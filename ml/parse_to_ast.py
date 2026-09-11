"""Math problem AST parser pipeline.

Reads filtered JSONL files from raw math datasets (GSM8K, MATH) and parses
extracted equations into structured SymPy ASTs, classified types, coefficients,
verified solutions, and solution step objects.
"""

import argparse
from collections import Counter
import json
import logging
from pathlib import Path
import random
import re
import sys
from typing import Any, Dict, List, Optional, Set, Tuple, Union

from tqdm import tqdm
import sympy as sp
from sympy.core.relational import Equality, Relational
from sympy.parsing.latex import parse_latex
from sympy.parsing.sympy_parser import (
    parse_expr,
    standard_transformations,
    implicit_multiplication_application,
    convert_xor,
)

logger = logging.getLogger("parse_to_ast")

# SymPy parsing transformations enabling implicit multiplication and ^ as exponentiation
TRANSFORMATIONS = standard_transformations + (implicit_multiplication_application, convert_xor)

# Standard mathematical functions to protect from text tokenization
MATH_FUNCTIONS: Set[str] = {
    "sqrt", "cbrt", "sin", "cos", "tan", "sec", "csc", "cot",
    "arcsin", "arccos", "arctan", "sinh", "cosh", "tanh",
    "log", "ln", "exp", "abs", "frac", "cdot", "times", "div",
    "pm", "mp", "leq", "geq", "le", "ge", "neq", "approx",
    "pi", "theta", "alpha", "beta", "gamma", "delta", "lambda", "sigma"
}

# Regex pattern identifying English words with length >= 2 that are not math functions
MATH_FUNC_LOOKAHEAD = r"\b(?!(?:" + "|".join(MATH_FUNCTIONS) + r")\b)[a-zA-Z]{2,}\b"


def strip_latex_delimiters(s: str) -> str:
    """Remove outer LaTeX enclosing delimiters from a math string.

    Args:
        s: Raw LaTeX string possibly enclosed in math mode delimiters.

    Returns:
        Stripped string with outer math delimiters removed.
    """
    s = s.strip()
    if s.startswith("$$") and s.endswith("$$") and len(s) >= 4:
        return s[2:-2].strip()
    if s.startswith("$") and s.endswith("$") and len(s) >= 2:
        return s[1:-1].strip()
    if s.startswith(r"\[") and s.endswith(r"\]") and len(s) >= 4:
        return s[2:-2].strip()
    if s.startswith(r"\(") and s.endswith(r"\)") and len(s) >= 4:
        return s[2:-2].strip()
    if s.startswith(r"\begin{equation}") and s.endswith(r"\end{equation}"):
        return s[len(r"\begin{equation}"):-len(r"\end{equation}")].strip()
    if s.startswith(r"\begin{equation*}") and s.endswith(r"\end{equation*}"):
        return s[len(r"\begin{equation*}"):-len(r"\end{equation*}")].strip()
    return s


def clean_equation_side(side_str: str, from_left: bool = True) -> str:
    """Trim multi-letter non-math English words from either side of an equation operator.

    Args:
        side_str: Text on one side of an equality/inequality.
        from_left: If True, extract the last segment closest to the operator (LHS).
                   If False, extract the first segment closest to the operator (RHS).

    Returns:
        Cleaned mathematical text segment.
    """
    tokens = re.split(MATH_FUNC_LOOKAHEAD, side_str)
    segments = [t.strip(" ,;:?.!") for t in tokens if t.strip(" ,;:?.!")]
    if not segments:
        return side_str.strip(" ,;:?.!")
    seg = segments[-1] if from_left else segments[0]
    return seg.strip(" ,;:?.!")


def score_candidate(cand: str) -> int:
    """Heuristic scoring to prioritize true algebraic equations over trivial arithmetic.

    Args:
        cand: Mathematical candidate string.

    Returns:
        Integer score where higher indicates higher relevance.
    """
    score = 0
    # Heavy penalty for unbalanced parentheses or brackets
    if cand.count("(") != cand.count(")") or cand.count("[") != cand.count("]"):
        score -= 50

    # Equation or inequality relations
    if any(op in cand for op in ["=", "<", ">", r"\le", r"\ge", r"\leq", r"\geq"]):
        score += 15

    # Contains single-letter variable symbols (e.g. x in 3x^2, y, etc.)
    var_matches = re.findall(r"(?<![a-zA-Z])[a-zA-Z](?![a-zA-Z])", cand)
    if var_matches:
        score += 25

    # Exponentiation / polynomial terms
    if "^" in cand or "**" in cand:
        score += 15

    # LaTeX commands
    if "\\" in cand:
        score += 5

    # If multiple equals signs (like x = 1/3, x = -2), penalize as likely solution list
    if cand.count("=") > 1:
        score -= 20

    # Sensible equation length
    if 4 <= len(cand) <= 100:
        score += 5

    return score


def is_valid_math_candidate(s: str) -> bool:
    """Validate that candidate contains meaningful mathematical syntax."""
    if not s or len(s) < 2:
        return False
    # Must contain at least one math operator or digit
    has_operator = any(op in s for op in ["=", "<", ">", "+", "-", "*", "/", "^", "\\"])
    has_digit = any(c.isdigit() for c in s)
    if not (has_operator or has_digit):
        return False
    # Filter out multi-word English sentences like 'their problems'
    words = re.findall(r"\b[a-zA-Z]{2,}\b", s)
    if len(words) >= 2 and not any(op in s for op in ["=", "<", ">", "+", "*", "/", "^", "\\"]):
        return False
    return True


def extract_equation_candidates(problem_text: str, solution_text: str) -> List[str]:
    """Extract candidate equations from problem and solution texts using regex patterns.

    Looks for:
    - LaTeX math delimiters ($$, $, \\[, \\(),
    - Plain text equations and inequalities (e.g., 2x + 3 = 7, x^2 - 4 <= 0),
    - Explicit problem keywords (e.g., 'solve for x', 'roots of:', 'simplify'),
    - GSM8K calculator tags (<<expr=ans>>) and solution steps.

    Args:
        problem_text: Raw problem statement.
        solution_text: Raw solution text.

    Returns:
        Deduplicated list of equation candidates sorted by heuristic score.
    """
    candidates: List[str] = []

    # 1. LaTeX blocks in problem and solution texts
    for text_block in [problem_text, solution_text]:
        latex_matches = re.findall(
            r"\$\$([\s\S]*?)\$\$|\$([^\$\n]+?)\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)",
            text_block,
        )
        for match in latex_matches:
            cand_list = [x.strip() for x in match if x.strip()]
            if cand_list:
                c = strip_latex_delimiters(cand_list[0])
                c = re.sub(r"\\boxed\{([^}]+)\}", r"\1", c).strip()
                if len(c) > 1 and not re.match(r"^[a-zA-Z]$", c) and is_valid_math_candidate(c):
                    candidates.append(c)

    # 2. GSM8K calculator tags <<expr=ans>>
    for text_block in [problem_text, solution_text]:
        gsm_matches = re.findall(r"<<([^>]+)>>", text_block)
        for g in gsm_matches:
            g_clean = g.strip()
            if is_valid_math_candidate(g_clean):
                candidates.append(g_clean)

    # 3. Explicit keywords: 'solve for x:', 'simplify', 'roots of:'
    for text_block in [problem_text, solution_text]:
        keyword_matches = re.findall(
            r"(?:solve\s+for\s+[a-zA-Z]\s*:\s*|the\s+equation\s+|roots\s+of\s*:\s*|simplify\s+:?\s*)([0-9a-zA-Z_\^\+\-\*\/\(\)\s\.\=]+)",
            text_block,
            re.IGNORECASE,
        )
        for km in keyword_matches:
            km_clean = km.strip().strip(".,;:?!")
            if km_clean and is_valid_math_candidate(km_clean):
                candidates.append(km_clean)

    # 4. Plain text equations & inequalities split by sentences
    chunks: List[str] = []
    for text_block in [problem_text, solution_text]:
        for line in text_block.splitlines():
            for sentence in re.split(r"(?<=[.?!])\s+", line):
                s_clean = sentence.strip()
                if s_clean:
                    chunks.append(s_clean)

    rel_ops = ["<=", ">=", "!=", "==", "=", "<", ">", r"\le", r"\ge", r"\leq", r"\geq"]
    for chunk in chunks:
        if "####" in chunk:
            continue
        for op in rel_ops:
            if op in chunk:
                parts = chunk.split(op, 1)
                lhs = clean_equation_side(parts[0], from_left=True)
                rhs = clean_equation_side(parts[1], from_left=False)
                if lhs and rhs and (any(ch.isalpha() or ch.isdigit() for ch in lhs)):
                    cand_eq = f"{lhs} {op} {rhs}"
                    cand_eq = re.sub(r"\\boxed\{([^}]+)\}", r"\1", cand_eq).strip()
                    if is_valid_math_candidate(cand_eq):
                        candidates.append(cand_eq)
                break

    # Clean candidates and filter conversational noise
    cleaned: List[str] = []
    seen: Set[str] = set()
    for cand in candidates:
        cand_str = strip_latex_delimiters(cand).strip(" ,;:?!")
        cand_str = re.sub(r"^(?:for\s+)?[a-zA-Z]\s*:\s*", "", cand_str)
        cand_str = re.sub(r"\\boxed\{([^}]+)\}", r"\1", cand_str).strip()
        if not cand_str or not is_valid_math_candidate(cand_str):
            continue
        # Filter obvious non-mathematical conversational sentences
        if re.match(r"^(?:the|we|can|let|then|and|so|if|this|that|there)\b", cand_str, re.IGNORECASE):
            continue
        if cand_str not in seen:
            seen.add(cand_str)
            cleaned.append(cand_str)

    # Sort candidates by relevance score descending
    cleaned.sort(key=score_candidate, reverse=True)
    return cleaned


def preprocess_latex_to_python(text: str) -> str:
    """Preprocess LaTeX math syntax into standard Python/SymPy expression string.

    Args:
        text: Math expression with LaTeX macros.

    Returns:
        String consumable by parse_expr or sympify.
    """
    s = text.strip()
    s = re.sub(r"\\boxed\{([^}]+)\}", r"\1", s)
    s = re.sub(r"\\frac\{([^}]+)\}\{([^}]+)\}", r"((\1)/(\2))", s)
    s = re.sub(r"\\sqrt\{([^}]+)\}", r"sqrt(\1)", s)
    s = re.sub(r"\\sqrt\[(\d+)\]\{([^}]+)\}", r"((\2)**(1/\1))", s)
    s = re.sub(r"\\(?:cdot|times)", "*", s)
    s = re.sub(r"\\(?:le|leq)", "<=", s)
    s = re.sub(r"\\(?:ge|geq)", ">=", s)
    s = re.sub(r"\\(?:neq|ne)", "!=", s)
    s = re.sub(r"\\([a-zA-Z]+)", r"\1", s)
    s = s.replace("{", "(").replace("}", ")")
    s = s.replace("^", "**")
    return s


def parse_to_sympy(candidate: str) -> Dict[str, Any]:
    """Parse candidate string to SymPy using parse_latex first, fallback to sympify/parse_expr.

    Args:
        candidate: Raw candidate equation or expression.

    Returns:
        Dictionary containing parsed SymPy object, flattened difference expression,
        flags for equality and inequality, and canonical LaTeX string.

    Raises:
        ValueError: If both parse_latex and sympify fallback fail.
    """
    cleaned = strip_latex_delimiters(candidate).strip()
    errors: List[str] = []

    # 1. Attempt LaTeX parsing first
    try:
        parsed = parse_latex(cleaned)
        if isinstance(parsed, Equality):
            raw_diff = parsed.lhs - parsed.rhs
            diff = sp.sympify(str(raw_diff))
            latex_repr = sp.latex(sp.Eq(diff, 0)) if parsed.rhs == 0 else sp.latex(parsed)
            return {
                "parsed_obj": parsed,
                "expr": diff,
                "is_equality": True,
                "has_inequality": False,
                "latex": latex_repr,
                "parse_method": "parse_latex_equality",
            }
        elif isinstance(parsed, (sp.LessThan, sp.GreaterThan, sp.StrictLessThan, sp.StrictGreaterThan)):
            raw_diff = parsed.lhs - parsed.rhs
            diff = sp.sympify(str(raw_diff))
            return {
                "parsed_obj": parsed,
                "expr": diff,
                "is_equality": False,
                "has_inequality": True,
                "latex": sp.latex(parsed),
                "parse_method": "parse_latex_inequality",
            }
        elif isinstance(parsed, (sp.logic.boolalg.BooleanTrue, sp.logic.boolalg.BooleanFalse)):
            # Arithmetic equality evaluated directly by parse_latex
            if "=" in cleaned:
                parts = cleaned.split("=", 1)
                lhs = parse_expr(preprocess_latex_to_python(parts[0]), transformations=TRANSFORMATIONS)
                rhs = parse_expr(preprocess_latex_to_python(parts[1]), transformations=TRANSFORMATIONS)
                eq = sp.Eq(lhs, rhs, evaluate=False)
                diff = sp.sympify(str(lhs - rhs))
                return {
                    "parsed_obj": eq,
                    "expr": diff,
                    "is_equality": True,
                    "has_inequality": False,
                    "latex": f"{sp.latex(lhs)} = {sp.latex(rhs)}",
                    "parse_method": "parse_expr_boolean_equality",
                }
        else:
            diff = sp.sympify(str(parsed))
            return {
                "parsed_obj": diff,
                "expr": diff,
                "is_equality": False,
                "has_inequality": False,
                "latex": sp.latex(diff),
                "parse_method": "parse_latex_expression",
            }
    except Exception as e:
        errors.append(f"parse_latex error: {e}")

    # 2. Fallback to parse_expr / sympify
    try:
        py_str = preprocess_latex_to_python(cleaned)

        # Check for inequalities
        ineq_map = [
            ("<=", sp.LessThan),
            (">=", sp.GreaterThan),
            ("<", sp.StrictLessThan),
            (">", sp.StrictGreaterThan),
        ]
        for ineq_op, sp_cls in ineq_map:
            if ineq_op in py_str:
                parts = py_str.split(ineq_op, 1)
                lhs = parse_expr(parts[0].strip(), transformations=TRANSFORMATIONS)
                rhs = parse_expr(parts[1].strip(), transformations=TRANSFORMATIONS)
                ineq = sp_cls(lhs, rhs, evaluate=False)
                diff = sp.sympify(str(lhs - rhs))
                return {
                    "parsed_obj": ineq,
                    "expr": diff,
                    "is_equality": False,
                    "has_inequality": True,
                    "latex": f"{sp.latex(lhs)} {ineq_op} {sp.latex(rhs)}",
                    "parse_method": "parse_expr_inequality",
                }

        # Check for equality =
        if "=" in py_str and "==" not in py_str:
            parts = py_str.split("=", 1)
            lhs = parse_expr(parts[0].strip(), transformations=TRANSFORMATIONS)
            rhs = parse_expr(parts[1].strip(), transformations=TRANSFORMATIONS)
            eq = sp.Eq(lhs, rhs, evaluate=False)
            diff = sp.sympify(str(lhs - rhs))
            return {
                "parsed_obj": eq,
                "expr": diff,
                "is_equality": True,
                "has_inequality": False,
                "latex": f"{sp.latex(lhs)} = {sp.latex(rhs)}",
                "parse_method": "parse_expr_equality",
            }

        # Plain expression (algebraic simplification)
        parsed_expr = parse_expr(py_str, transformations=TRANSFORMATIONS)
        diff = sp.sympify(str(parsed_expr))
        return {
            "parsed_obj": diff,
            "expr": diff,
            "is_equality": False,
            "has_inequality": False,
            "latex": sp.latex(diff),
            "parse_method": "parse_expr_plain",
        }
    except Exception as e:
        errors.append(f"parse_expr error: {e}")

    raise ValueError("; ".join(errors))


def classify_equation_type(
    expr: sp.Expr,
    is_equality: bool,
    has_inequality: bool,
    is_system: bool = False,
) -> str:
    """Classify equation type based on SymPy analysis.

    Categories:
    - linear (degree 1)
    - quadratic (degree 2)
    - cubic (degree 3)
    - quartic (degree 4)
    - higher_order (degree 5+)
    - system (multiple equations)
    - inequality (contains >, <, >=, <=)
    - radical (contains sqrt, nth root on variable)
    - algebraic_simplification (no = sign, just simplify)
    - other

    Args:
        expr: Evaluated difference expression.
        is_equality: True if the candidate contains an equality relation.
        has_inequality: True if the candidate contains an inequality relation.
        is_system: True if part of a multivariable system.

    Returns:
        Classification category string.
    """
    if is_system:
        return "system"
    if has_inequality:
        return "inequality"
    if not is_equality:
        return "algebraic_simplification"

    symbols = expr.free_symbols

    # Check for radical terms containing variables
    for p in expr.atoms(sp.Pow):
        if not p.exp.is_integer:
            if any(s in p.base.free_symbols for s in symbols):
                return "radical"

    # Check polynomial degree
    if len(symbols) == 1:
        sym = list(symbols)[0]
        try:
            poly = sp.Poly(expr, sym)
            deg = poly.degree()
            if deg == 1:
                return "linear"
            elif deg == 2:
                return "quadratic"
            elif deg == 3:
                return "cubic"
            elif deg == 4:
                return "quartic"
            elif deg >= 5:
                return "higher_order"
        except (sp.PolynomialError, sp.GeneratorsError, Exception):
            pass
    elif len(symbols) > 1:
        try:
            poly = sp.Poly(expr, *symbols)
            deg = poly.total_degree()
            if deg == 1:
                return "linear"
            elif deg == 2:
                return "quadratic"
            elif deg == 3:
                return "cubic"
            elif deg == 4:
                return "quartic"
            elif deg >= 5:
                return "higher_order"
        except (sp.PolynomialError, sp.GeneratorsError, Exception):
            pass
    elif len(symbols) == 0:
        return "linear"

    return "other"


def extract_coefficients(expr: sp.Expr, symbol: Optional[sp.Symbol]) -> Optional[List[Union[int, float]]]:
    """Extract polynomial coefficients in descending order of power.

    Args:
        expr: Polynomial expression.
        symbol: Variable with respect to which coefficients are taken.

    Returns:
        List of coefficients (e.g. [a, b, c] for ax^2 + bx + c), or None.
    """
    if symbol is None:
        return None
    try:
        poly = sp.Poly(expr, symbol)
        coeffs: List[Union[int, float]] = []
        for c in poly.all_coeffs():
            if c.is_integer:
                coeffs.append(int(c))
            elif c.is_rational:
                coeffs.append(round(float(c), 4))
            else:
                try:
                    coeffs.append(round(float(c.evalf()), 4))
                except Exception:
                    coeffs.append(float(c))
        return coeffs
    except Exception:
        return None


def compute_solutions(
    expr: sp.Expr,
    parsed_obj: Any,
    symbol: Optional[sp.Symbol],
    eq_type: str,
) -> List[Dict[str, Any]]:
    """Compute solutions using SymPy's solve() function for verification.

    Args:
        expr: Canonical difference expression (lhs - rhs).
        parsed_obj: Original parsed equation or relational object.
        symbol: Variable to solve for.
        eq_type: Equation type classification.

    Returns:
        List of solution dictionaries containing value, numeric, and is_complex flags.
    """
    if eq_type in {"algebraic_simplification", "higher_order", "other"} or symbol is None:
        return []

    try:
        symbols = expr.free_symbols
        if len(symbols) > 2:
            return []

        # Degree guard: if degree > 3, don't attempt exact radical solve
        try:
            poly = sp.Poly(expr, symbol)
            deg = poly.degree()
            if deg > 3:
                try:
                    num_roots = poly.nroots(maxsteps=15)
                    return [
                        {
                            "value": str(r),
                            "numeric": round(float(r.as_real_imag()[0]), 3) if hasattr(r, "as_real_imag") else None,
                            "is_complex": not getattr(r, "is_real", True),
                        }
                        for r in num_roots[:4]
                    ]
                except Exception:
                    return []
        except Exception:
            pass

        target = parsed_obj if isinstance(parsed_obj, (Equality, Relational)) else expr
        # Fast solve with check=False
        raw_sols = sp.solve(target, symbol, check=False)
        solutions: List[Dict[str, Any]] = []

        if isinstance(raw_sols, list):
            for s in raw_sols[:5]:  # limit to first 5 solutions
                if isinstance(s, dict):
                    val_str = ", ".join(f"{k} = {v}" for k, v in s.items())
                    solutions.append({"value": val_str, "numeric": None, "is_complex": False})
                elif isinstance(s, tuple):
                    val_str = ", ".join(str(v) for v in s)
                    solutions.append({"value": val_str, "numeric": None, "is_complex": False})
                else:
                    val_str = str(s)
                    is_complex = not getattr(s, "is_real", True)
                    numeric_val: Optional[float] = None
                    try:
                        eval_val = s.evalf()
                        if getattr(eval_val, "is_real", False):
                            numeric_val = round(float(eval_val), 3)
                        else:
                            is_complex = True
                    except Exception:
                        pass
                    solutions.append({
                        "value": val_str,
                        "numeric": numeric_val,
                        "is_complex": bool(is_complex),
                    })
        elif isinstance(raw_sols, dict):
            val_str = ", ".join(f"{k} = {v}" for k, v in raw_sols.items())
            solutions.append({"value": val_str, "numeric": None, "is_complex": False})
        else:
            solutions.append({"value": str(raw_sols), "numeric": None, "is_complex": False})

        return solutions
    except Exception as e:
        logger.debug(f"SymPy solve error for symbol {symbol}: {e}")
        return []


def parse_solution_steps(solution_text: str, default_math: str = "") -> List[Dict[str, Any]]:
    """Parse solution steps from solution text into structured step objects.

    Args:
        solution_text: Raw step-by-step or paragraph solution.
        default_math: Fallback math equation string if a step has no explicit math.

    Returns:
        List of structured step objects with stepNumber, explanation, and math fields.
    """
    if not solution_text or not solution_text.strip():
        if default_math:
            return [{"stepNumber": 1, "explanation": "Identify the equation", "math": default_math}]
        return []

    lines = [line.strip() for line in solution_text.splitlines() if line.strip()]
    raw_steps: List[Dict[str, Any]] = []

    numbered_marker = re.compile(r"^(?:Step\s*(\d+)[:.]?|(\d+)[\.\)])\s*(.*)", re.IGNORECASE)
    has_numbered_lines = any(numbered_marker.match(l) for l in lines)

    if has_numbered_lines:
        current_step: Optional[Dict[str, Any]] = None
        for line in lines:
            m = numbered_marker.match(line)
            if m:
                if current_step:
                    raw_steps.append(current_step)
                step_num = int(m.group(1) or m.group(2))
                current_step = {"text": m.group(3).strip(), "num": step_num}
            else:
                if current_step:
                    current_step["text"] += " " + line
                else:
                    current_step = {"text": line, "num": len(raw_steps) + 1}
        if current_step:
            raw_steps.append(current_step)
    elif len(lines) > 1:
        for idx, line in enumerate(lines, start=1):
            raw_steps.append({"text": line, "num": idx})
    else:
        # Single line or paragraph: split by sentence endings
        sentences = re.split(r"(?<=[.?!])\s+(?=[A-Z0-9$])", solution_text.strip())
        sentences = [s.strip() for s in sentences if s.strip()]
        for idx, s in enumerate(sentences, start=1):
            raw_steps.append({"text": s, "num": idx})

    structured_steps: List[Dict[str, Any]] = []
    for s_idx, raw in enumerate(raw_steps, start=1):
        text = raw["text"]
        math_items: List[str] = []

        # Extract LaTeX blocks
        latex_matches = re.findall(
            r"\$\$([\s\S]*?)\$\$|\$([^\$\n]+?)\$|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)",
            text,
        )
        for b in latex_matches:
            cand_list = [x.strip() for x in b if x.strip()]
            if cand_list:
                math_items.append(cand_list[0])

        # GSM8k calculator annotations <<...>>
        gsm_matches = re.findall(r"<<([^>]+)>>", text)
        math_items.extend(gsm_matches)

        # GSM8k #### final answers
        hash_match = re.search(r"####\s*(.+)", text)
        if hash_match:
            math_items.append(hash_match.group(1).strip())

        # Fallback to plain equations if no explicit markers
        if not math_items:
            plain_eq = re.search(r"([0-9a-zA-Z_\^\+\-\*\/\(\)\s\.]+\s*=\s*[0-9a-zA-Z_\^\+\-\*\/\(\)\s\.]+)", text)
            if plain_eq:
                math_items.append(plain_eq.group(1).strip())

        # Clean explanation text
        clean_exp = text
        clean_exp = re.sub(r"<<[^>]+>>", "", clean_exp)
        clean_exp = re.sub(r"####\s*.*", "", clean_exp)
        clean_exp = clean_exp.replace("$", "").replace(r"\[", "").replace(r"\]", "").replace(r"\(", "").replace(r"\)", "")
        clean_exp = re.sub(r"\\boxed\{([^}]+)\}", r"\1", clean_exp)
        clean_exp = re.sub(r"\s+", " ", clean_exp).strip()

        math_str = "; ".join(dict.fromkeys(math_items)) if math_items else ""
        if not math_str and default_math and s_idx == 1:
            math_str = default_math

        if not clean_exp and math_str:
            clean_exp = f"Step {s_idx}"

        structured_steps.append({
            "stepNumber": s_idx,
            "explanation": clean_exp or f"Step {s_idx}",
            "math": math_str,
        })

    if not structured_steps and default_math:
        structured_steps.append({
            "stepNumber": 1,
            "explanation": "Identify the equation",
            "math": default_math,
        })

    return structured_steps


def generate_tags(
    eq_type: str,
    expr: Optional[sp.Expr],
    solutions: List[Dict[str, Any]],
    coefficients: Optional[List[Union[int, float]]],
    symbols: List[sp.Symbol],
) -> List[str]:
    """Generate categorization tags for an equation problem.

    Args:
        eq_type: Equation classification type.
        expr: SymPy expression.
        solutions: Computed solutions.
        coefficients: Polynomial coefficients.
        symbols: Free symbols in the expression.

    Returns:
        List of string tags.
    """
    tags: List[str] = []
    if eq_type:
        tags.append(eq_type)

    if eq_type in {"linear", "quadratic", "cubic", "quartic", "higher_order"}:
        tags.append("polynomial")

    if len(symbols) == 1:
        tags.append("single_variable")
    elif len(symbols) > 1:
        tags.append("multivariate")

    if coefficients:
        if all(isinstance(c, int) for c in coefficients):
            tags.append("integer_coefficients")

    if solutions:
        if all(not s.get("is_complex", False) for s in solutions):
            tags.append("real_roots")
        elif any(s.get("is_complex", False) for s in solutions):
            tags.append("complex_roots")

        if eq_type in {"quadratic", "cubic", "quartic"}:
            is_factorable = all(
                not s.get("is_complex", False) and (
                    "/" in s.get("value", "") or s.get("value", "").replace("-", "").isdigit()
                )
                for s in solutions
            )
            if is_factorable:
                tags.append("factorable")

    return list(dict.fromkeys(tags))


def process_record(
    item: Dict[str, Any],
    default_source: str,
    index: int,
) -> Dict[str, Any]:
    """Parse a single problem record into structured JSON format with SymPy AST.

    Args:
        item: Raw dictionary representing one math problem.
        default_source: Source dataset name (e.g. 'gsm8k' or 'math').
        index: Index counter used for fallback ID generation.

    Returns:
        Structured output record conforming to the project schema.
    """
    prob_id = item.get("id") or f"{default_source}_{index:05d}"
    source = item.get("source") or default_source
    raw_problem = (
        item.get("raw_problem")
        or item.get("problem")
        or item.get("question")
        or item.get("prompt")
        or item.get("text")
        or item.get("input")
        or ""
    )
    raw_solution = (
        item.get("raw_solution")
        or item.get("solution")
        or item.get("answer")
        or item.get("target")
        or item.get("output")
        or ""
    )

    parse_errors: List[str] = []
    candidates = extract_equation_candidates(raw_problem, raw_solution)

    parsed_res: Optional[Dict[str, Any]] = None

    for cand in candidates:
        try:
            res = parse_to_sympy(cand)
            parsed_res = res
            break
        except Exception as e:
            parse_errors.append(f"Failed '{cand}': {e}")

    if not parsed_res:
        if not candidates:
            parse_errors.append("No extractable equation or mathematical expression found.")
        return {
            "id": prob_id,
            "source": source,
            "raw_problem": raw_problem,
            "raw_solution": raw_solution,
            "equation": None,
            "equation_latex": None,
            "variable": None,
            "degree": None,
            "type": None,
            "coefficients": None,
            "solutions": [],
            "steps": parse_solution_steps(raw_solution),
            "sympy_ast": None,
            "tags": [],
            "parse_success": False,
            "parse_errors": parse_errors,
        }

    try:
        expr: Any = parsed_res["expr"]
        parsed_obj: Any = parsed_res["parsed_obj"]
        is_equality: bool = parsed_res["is_equality"]
        has_inequality: bool = parsed_res["has_inequality"]
        equation_latex: str = parsed_res["latex"]

        if not hasattr(expr, "free_symbols"):
            raise ValueError(f"Parsed object {type(expr)} does not have free_symbols")

        # Select primary variable preferring 'x', then 'y', then alphabetical
        free_syms = sorted(list(expr.free_symbols), key=lambda s: (getattr(s, "name", "") != "x", getattr(s, "name", "") != "y", getattr(s, "name", "")))
        primary_var: Optional[sp.Symbol] = free_syms[0] if free_syms else None
        var_str = primary_var.name if primary_var else None

        # Classify equation type
        eq_type = classify_equation_type(expr, is_equality, has_inequality)

        # Compute polynomial degree
        degree: Optional[int] = None
        if primary_var and eq_type in {"linear", "quadratic", "cubic", "quartic", "higher_order"}:
            try:
                poly = sp.Poly(expr, primary_var)
                degree = poly.degree()
            except Exception:
                pass

        # Extract polynomial coefficients
        coeffs = extract_coefficients(expr, primary_var) if degree is not None else None

        # Compute verified solutions
        solutions = compute_solutions(expr, parsed_obj, primary_var, eq_type)

        # Parse solution steps
        steps = parse_solution_steps(raw_solution, default_math=equation_latex)

        # SymPy AST string
        sympy_ast = sp.srepr(expr) if hasattr(sp, "srepr") else str(expr)

        # Classification tags
        tags = generate_tags(eq_type, expr, solutions, coeffs, free_syms)

        return {
            "id": prob_id,
            "source": source,
            "raw_problem": raw_problem,
            "raw_solution": raw_solution,
            "equation": str(expr),
            "equation_latex": equation_latex,
            "variable": var_str,
            "degree": degree,
            "type": eq_type,
            "coefficients": coeffs,
            "solutions": solutions,
            "steps": steps,
            "sympy_ast": sympy_ast,
            "tags": tags,
            "parse_success": True,
            "parse_errors": [],
        }
    except Exception as err:
        parse_errors.append(f"Post-parse analysis error: {err}")
        return {
            "id": prob_id,
            "source": source,
            "raw_problem": raw_problem,
            "raw_solution": raw_solution,
            "equation": None,
            "equation_latex": None,
            "variable": None,
            "degree": None,
            "type": None,
            "coefficients": None,
            "solutions": [],
            "steps": parse_solution_steps(raw_solution),
            "sympy_ast": None,
            "tags": [],
            "parse_success": False,
            "parse_errors": parse_errors,
        }


def process_jsonl_file(
    input_file: Path,
    output_file: Path,
    sample_size: Optional[int] = None,
) -> Tuple[int, int, Counter]:
    """Process a single input JSONL file and write parsed records to output JSONL.

    Args:
        input_file: Path to input JSONL file.
        output_file: Path to destination JSONL file.
        sample_size: Optional maximum number of random records to process.

    Returns:
        Tuple of (total_processed, successful_parsed, type_distribution_counter).
    """
    logger.info(f"Reading input file: {input_file}")
    records: List[Dict[str, Any]] = []

    with open(input_file, "r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line_str = line.strip()
            if not line_str:
                continue
            try:
                records.append(json.loads(line_str))
            except json.JSONDecodeError as e:
                logger.warning(f"Skipping malformed JSON at {input_file}:{line_no}: {e}")

    total_records = len(records)
    logger.info(f"Loaded {total_records} records from {input_file.name}")

    if sample_size and sample_size < total_records:
        rng = random.Random(42)
        records = rng.sample(records, sample_size)
        logger.info(f"Sampled {len(records)} records for processing")

    source_name = "gsm8k" if "gsm8k" in input_file.name.lower() else "math"

    output_file.parent.mkdir(parents=True, exist_ok=True)
    success_count = 0
    type_counts: Counter = Counter()

    with open(output_file, "w", encoding="utf-8") as out_f:
        progress_bar = tqdm(records, desc=f"Parsing {input_file.name}", unit="prob")
        for idx, rec in enumerate(progress_bar, start=1):
            out_rec = process_record(rec, source_name, idx)
            if out_rec["parse_success"]:
                success_count += 1
                type_counts[out_rec["type"]] += 1
            else:
                type_counts["unparsed"] += 1

            out_f.write(json.dumps(out_rec, ensure_ascii=False) + "\n")

    logger.info(f"Wrote {len(records)} parsed records to {output_file}")
    return len(records), success_count, type_counts


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments for the AST parsing pipeline."""
    parser = argparse.ArgumentParser(
        description="Parse raw math problems into structured JSON with SymPy ASTs."
    )
    parser.add_argument(
        "--input-file",
        type=Path,
        default=None,
        help="Optional specific input JSONL file to process.",
    )
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=Path("data/raw"),
        help="Input directory containing filtered JSONL files (default: data/raw).",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("data/processed"),
        help="Output directory for parsed JSONL files (default: data/processed).",
    )
    parser.add_argument(
        "--sample",
        type=int,
        default=None,
        help="Sample N random problems to process per file (useful for testing).",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable debug logging output.",
    )
    return parser.parse_args()


def main() -> None:
    """Execute the AST parser pipeline CLI."""
    args = parse_args()

    # Configure logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="[%(asctime)s] [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    output_dir: Path = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    if args.input_file:
        if not args.input_file.exists():
            logger.error(f"Input file does not exist: {args.input_file}")
            sys.exit(1)
        files_to_process = [args.input_file]
    else:
        input_dir: Path = args.input_dir
        if not input_dir.exists():
            logger.error(f"Input directory does not exist: {input_dir}")
            sys.exit(1)

        primary_targets = [
            input_dir / "gsm8k_filtered.jsonl",
            input_dir / "math_filtered.jsonl",
            input_dir / "math_plus_filtered.jsonl",
        ]
        files_to_process = [f for f in primary_targets if f.is_file()]

        if not files_to_process:
            files_to_process = sorted(list(input_dir.glob("*.jsonl")))

    if not files_to_process:
        logger.warning(
            "No JSONL files found to process. "
            "Please run fetch_math_data.py or fetch_math_plus.py to populate raw data."
        )
        return

    logger.info(f"Found {len(files_to_process)} file(s) to process")

    total_all = 0
    success_all = 0
    type_counts_all: Counter = Counter()

    for input_file in files_to_process:
        output_file = output_dir / f"{input_file.stem}_ast.jsonl"
        tot, succ, t_counts = process_jsonl_file(input_file, output_file, args.sample)
        total_all += tot
        success_all += succ
        type_counts_all.update(t_counts)

    # Log comprehensive pipeline statistics
    fail_all = total_all - success_all
    success_rate = (success_all / total_all * 100) if total_all > 0 else 0.0

    logger.info("=" * 60)
    logger.info("PARSING PIPELINE SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Total problems processed : {total_all}")
    logger.info(f"Successfully parsed      : {success_all} ({success_rate:.2f}%)")
    logger.info(f"Failed to parse          : {fail_all} ({100.0 - success_rate:.2f}%)")
    logger.info("-" * 60)
    logger.info("Equation Type Distribution:")
    for eq_type, count in sorted(type_counts_all.items(), key=lambda x: x[1], reverse=True):
        pct = (count / total_all * 100) if total_all > 0 else 0.0
        logger.info(f"  - {eq_type:24s}: {count:5d} ({pct:5.1f}%)")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
