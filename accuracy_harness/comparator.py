"""
Symbolic Equivalence Comparator
Compares actual solver output against SymPy ground truth using exact algebraic simplification,
order-independent set matching, derivative verification for indefinite integrals,
and numeric tolerance fallback.
"""

import re
from typing import Any, Dict, List, Optional, Set, Tuple
import sympy as sp
from sympy import S, Interval, Union as SpUnion, EmptySet, FiniteSet

try:
    from oracle import parse_sympy_expr
except ImportError:
    from accuracy_harness.oracle import parse_sympy_expr

def _clean_fractions(s: str) -> str:
    """Recursively replace \frac{num}{den} handling nested braces."""
    while r"\frac" in s:
        idx = s.find(r"\frac")
        brace1_start = s.find("{", idx)
        if brace1_start == -1:
            break
        depth = 0
        brace1_end = -1
        for i in range(brace1_start, len(s)):
            if s[i] == "{":
                depth += 1
            elif s[i] == "}":
                depth -= 1
                if depth == 0:
                    brace1_end = i
                    break
        if brace1_end == -1:
            break
        num = s[brace1_start + 1:brace1_end]

        brace2_start = s.find("{", brace1_end)
        if brace2_start == -1:
            break
        depth = 0
        brace2_end = -1
        for i in range(brace2_start, len(s)):
            if s[i] == "{":
                depth += 1
            elif s[i] == "}":
                depth -= 1
                if depth == 0:
                    brace2_end = i
                    break
        if brace2_end == -1:
            break
        den = s[brace2_start + 1:brace2_end]
        s = s[:idx] + f" (({num})/({den})) " + s[brace2_end + 1:]
    return s

def clean_to_sympy_string(val_str: str) -> str:
    """Sanitize string from solver (stripping LaTeX formatting) to SymPy syntax."""
    if not val_str:
        return ""
    s = str(val_str).strip()
    
    # 0. Strip equation prefixes like f'(x) =, f(x) =, y =, F(x) =
    s = re.sub(r"^(?:f\s*['’]*\s*\([^)]*\)|F\s*\([^)]*\)|y\s*)\s*=\s*", "", s).strip()

    # 0a. Strip LaTeX font macros like \mathrm{...}, \mathbf{...}, \operatorname{...}
    s = re.sub(r"\\(?:mathrm|mathbf|mathit|text|operatorname)\{([^}]+)\}", r"\1", s)

    # 0b. Infinity and Set Unions
    s = re.sub(r"\\infty\b|\\inf\b|\\infty|infinity", "oo", s)
    s = s.replace(r"\cup", " or ")

    # 1. Clean fractions with balanced braces
    s = _clean_fractions(s)
    
    # 2. Strip remaining operatorname
    s = re.sub(r"\\operatorname\{([^}]+)\}", r"\1", s)
    
    # 3. Strip standard function backslashes
    s = re.sub(r"\\(sin|cos|tan|cot|sec|csc|sinh|cosh|tanh|asin|acos|atan|arcsin|arccos|arctan|log|ln|exp|sqrt)", r"\1", s)
    
    # 4. Strip LaTeX formatting commands
    s = re.sub(r"\\left|\\right", "", s)
    s = re.sub(r"\\cdot|\\times", "*", s)
    s = s.replace(r"\,", "").replace(r"\;", " ").replace(r"\quad", " ").replace(r"\qquad", " ")
    s = re.sub(r"\\text\{[^}]*\}", "", s)
    s = re.sub(r"\\in\b", " in ", s)
    s = re.sub(r"\\pm", "+-", s)
    s = re.sub(r"\\pi", "pi", s)
    s = re.sub(r"\\emptyset", "empty", s)
    s = re.sub(r"\\checkmark", "", s)
    
    # 5. Handle trig powers: e.g. sin^{2}(x) -> (sin(x))**2
    s = re.sub(r"\b(sin|cos|tan|sec|csc|cot|log|ln)\^\{?(\d+)\}?\s*(\{[^}]+\}|\([^)]+\))", r"(\1\3)**\2", s)
    
    # 6. Remaining braces to parentheses
    s = s.replace("{", "(").replace("}", ")")
    
    # 7. Powers ^ -> **
    s = s.replace("^", "**")
    
    # 8. Sqrt
    s = re.sub(r"\\sqrt\(([^)]+)\)", r"sqrt(\1)", s)
    s = re.sub(r"\\sqrt", "sqrt", s)
    
    # 9. Imaginary i
    s = re.sub(r"\bi\b", "I", s)
    s = re.sub(r"(\d+)i\b", r"\1*I", s)
    
    return s.strip()

class ComparisonResult:
    def __init__(self, passed: bool, reason: str, expected_str: str = "", actual_str: str = ""):
        self.passed = passed
        self.reason = reason
        self.expected_str = expected_str
        self.actual_str = actual_str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "reason": self.reason,
            "expected": self.expected_str,
            "actual": self.actual_str
        }

class SymbolicComparator:
    """Performs deep algebraic comparison between SymPy Oracle and solver results."""

    @staticmethod
    def compare(
        oracle_res: Any,
        actual_res: Any,
        variable: str = "x",
        tolerance: float = 1e-4
    ) -> ComparisonResult:
        res_type = getattr(oracle_res, "result_type", "set")
        gt = getattr(oracle_res, "ground_truth", None)
        var = sp.Symbol(variable)

        # 1. No solution / Empty set
        if res_type == "no_solution" or gt == EmptySet:
            return SymbolicComparator._compare_no_solution(actual_res)

        # 2. All real numbers / Identity
        if res_type == "all_reals" or gt == S.Reals:
            return SymbolicComparator._compare_all_reals(actual_res)

        # 3. Systems
        if res_type == "system":
            return SymbolicComparator._compare_system(gt, actual_res, tolerance)

        # 4. Intervals (Inequalities)
        if res_type == "interval":
            return SymbolicComparator._compare_intervals(gt, actual_res, var, tolerance)

        # 5. Expressions (Derivatives, Integrals)
        if res_type == "expression":
            is_indef = not oracle_res.details.get("is_definite", True) and oracle_res.category == "integrals"
            return SymbolicComparator._compare_expression(gt, actual_res, var, is_indefinite_integral=is_indef, tolerance=tolerance)

        # 6. ODE
        if res_type == "ode":
            return SymbolicComparator._compare_ode(oracle_res, actual_res, tolerance)

        # 7. Sets of Roots (Polynomial, Rational, Radical, Trig, Exp/Log)
        return SymbolicComparator._compare_root_sets(gt, actual_res, tolerance)

    @staticmethod
    def _compare_no_solution(actual_res: Any) -> ComparisonResult:
        actual_str = str(getattr(actual_res, "raw_answer", actual_res)).lower()
        has_no_sol = any(phrase in actual_str for phrase in [
            "no solution", "no real solution", "undefined", "empty", "\\emptyset", "cannot be solved", "null"
        ])
        roots = getattr(actual_res, "parsed_roots", [])
        if has_no_sol or (isinstance(roots, list) and len(roots) == 0):
            return ComparisonResult(True, "Correctly identified as no solution / empty set", "No solution", actual_str)
        return ComparisonResult(False, f"Expected no solution, but actual solver found: {actual_str}", "No solution", actual_str)

    @staticmethod
    def _compare_all_reals(actual_res: Any) -> ComparisonResult:
        actual_str = str(getattr(actual_res, "raw_answer", actual_res)).lower()
        has_all = any(phrase in actual_str for phrase in [
            "all real", "identity", "\\mathbb{r}", "infinite", "(-oo, oo)", "(-infinity, infinity)"
        ])
        if has_all:
            return ComparisonResult(True, "Correctly identified as identity / all real numbers", "All Reals", actual_str)
        return ComparisonResult(False, f"Expected all real numbers (identity), got: {actual_str}", "All Reals", actual_str)

    @staticmethod
    def _compare_root_sets(expected_roots: List[Any], actual_res: Any, tolerance: float) -> ComparisonResult:
        # Extract candidate roots from actual_res
        actual_roots = getattr(actual_res, "parsed_roots", None)
        raw_ans = getattr(actual_res, "raw_answer", str(actual_res))

        if actual_roots is None or len(actual_roots) == 0:
            # Try to extract numbers from raw_ans
            actual_roots = SymbolicComparator._extract_numbers_from_string(raw_ans)

        exp_list = list(expected_roots) if isinstance(expected_roots, (list, tuple, set, FiniteSet)) else [expected_roots]

        if len(exp_list) != len(actual_roots):
            return ComparisonResult(
                False,
                f"Root count mismatch: expected {len(exp_list)} roots ({exp_list}), got {len(actual_roots)} roots ({actual_roots})",
                str(exp_list),
                str(actual_roots)
            )

        # Match each expected root to an actual root
        matched_actual = [False] * len(actual_roots)

        for exp_r in exp_list:
            found_match = False
            for j, act_r in enumerate(actual_roots):
                if matched_actual[j]:
                    continue
                if SymbolicComparator._roots_equal(exp_r, act_r, tolerance):
                    matched_actual[j] = True
                    found_match = True
                    break
            if not found_match:
                return ComparisonResult(
                    False,
                    f"Expected root {exp_r} was not found in actual roots {actual_roots}",
                    str(exp_list),
                    str(actual_roots)
                )

        return ComparisonResult(True, "All roots matched symbolically or within tolerance", str(exp_list), str(actual_roots))

    @staticmethod
    def _roots_equal(exp_r: Any, act_r: Any, tolerance: float) -> bool:
        # Try symbolic simplification: simplify(exp - act) == 0
        try:
            sp_act = parse_sympy_expr(clean_to_sympy_string(str(act_r)))
            diff = sp.simplify(exp_r - sp_act)
            if diff == 0:
                return True
            # Numeric evaluation
            if abs(complex(sp.N(diff))) < tolerance:
                return True
        except Exception:
            pass

        # Try direct float comparison
        try:
            exp_f = complex(sp.N(exp_r))
            act_f = complex(float(act_r)) if not isinstance(act_r, complex) else act_r
            if abs(exp_f - act_f) < tolerance:
                return True
        except Exception:
            pass

        return False

    @staticmethod
    def _compare_expression(
        expected_expr: sp.Expr,
        actual_res: Any,
        var: sp.Symbol,
        is_indefinite_integral: bool = False,
        tolerance: float = 1e-4
    ) -> ComparisonResult:
        raw_ans = getattr(actual_res, "raw_answer", str(actual_res))
        cleaned = clean_to_sympy_string(raw_ans)
        # Strip trailing + C
        cleaned = re.sub(r"\+\s*[cC]\b", "", cleaned).strip()

        try:
            act_expr = parse_sympy_expr(cleaned)
        except Exception as e:
            return ComparisonResult(False, f"Failed to parse actual expression '{raw_ans}': {e}", str(expected_expr), raw_ans)

        if is_indefinite_integral:
            # Indefinite integrals: differentiate BOTH and compare derivatives
            try:
                diff_exp = sp.diff(expected_expr, var)
                diff_act = sp.diff(act_expr, var)
                diff = sp.simplify(diff_exp - diff_act)
                if diff == 0:
                    return ComparisonResult(True, "Indefinite integral verified via derivative equivalence", str(expected_expr), raw_ans)
                # Sample 3 test points
                sample_pts = [0.5, 1.2, 2.7]
                all_match = True
                for pt in sample_pts:
                    v1 = complex(sp.N(diff_exp.subs(var, pt)))
                    v2 = complex(sp.N(diff_act.subs(var, pt)))
                    if abs(v1 - v2) > tolerance:
                        all_match = False
                        break
                if all_match:
                    return ComparisonResult(True, "Indefinite integral verified via sample derivative values", str(expected_expr), raw_ans)
            except Exception as ex:
                return ComparisonResult(False, f"Error differentiating for integral comparison: {ex}", str(expected_expr), raw_ans)

        # Standard expression comparison: simplify(expected - actual) == 0
        try:
            diff = sp.simplify(expected_expr - act_expr)
            if diff == 0:
                return ComparisonResult(True, "Expressions match identically", str(expected_expr), raw_ans)
            # Numeric sampling fallback
            sample_pts = [0.5, 1.2, 2.7]
            for pt in sample_pts:
                v1 = complex(sp.N(expected_expr.subs(var, pt)))
                v2 = complex(sp.N(act_expr.subs(var, pt)))
                if abs(v1 - v2) > tolerance:
                    return ComparisonResult(False, f"Expressions differ: expected {expected_expr}, got {act_expr}", str(expected_expr), raw_ans)
            return ComparisonResult(True, "Expressions matched across test points", str(expected_expr), raw_ans)
        except Exception:
            # Pure float comparison (e.g. constant derivative)
            try:
                if abs(float(sp.N(expected_expr)) - float(sp.N(act_expr))) < tolerance:
                    return ComparisonResult(True, "Numeric values matched", str(expected_expr), raw_ans)
            except Exception:
                pass
            return ComparisonResult(False, f"Failed symbolic comparison: expected {expected_expr}, got {act_expr}", str(expected_expr), raw_ans)

    @staticmethod
    def _parse_to_sympy_set(act_clean: str, var: sp.Symbol) -> Optional[sp.Set]:
        """Convert inequality text or interval notation string to a SymPy Set."""
        s = act_clean.strip()
        s = s.replace(r"\infty", "oo").replace(r"\inf", "oo").replace("infinity", "oo")

        # 1. Interval notation: [a, b), (-oo, 3), etc.
        m_int = re.match(r"^([\[\(])\s*([^,]+)\s*,\s*([^\]\)]+)\s*([\]\)])$", s)
        if m_int:
            l_br, start_s, end_s, r_br = m_int.groups()
            try:
                start = parse_sympy_expr(clean_to_sympy_string(start_s))
                end = parse_sympy_expr(clean_to_sympy_string(end_s))
                return Interval(start, end, left_open=(l_br == "("), right_open=(r_br == ")"))
            except Exception:
                pass

        # 2. Compound inequality: a < x < b or a <= x <= b
        m_comp = re.match(r"^([^<>=]+)\s*(<|<=)\s*([a-zA-Z])\s*(<|<=)\s*([^<>=]+)$", s)
        if m_comp:
            v1_s, op1, v_name, op2, v2_s = m_comp.groups()
            try:
                rel1_s = f"{v1_s} {op1} {v_name}"
                rel2_s = f"{v_name} {op2} {v2_s}"
                s1 = parse_sympy_expr(rel1_s).as_set()
                s2 = parse_sympy_expr(rel2_s).as_set()
                return s1.intersect(s2)
            except Exception:
                pass

        # 3. Disjunction / union: e.g. "x < -2 or x > 2"
        if " or " in s.lower():
            parts = re.split(r"\s+or\s+", s, flags=re.IGNORECASE)
            sets = []
            for p in parts:
                parsed_p = SymbolicComparator._parse_to_sympy_set(p, var)
                if parsed_p is not None:
                    sets.append(parsed_p)
            if len(sets) == len(parts):
                return SpUnion(*sets)

        # 4. Standard single inequality: e.g. "x < 3", "x >= 2"
        try:
            rel = parse_sympy_expr(s)
            if hasattr(rel, "as_set"):
                return rel.as_set()
        except Exception:
            pass

        return None

    @staticmethod
    def _compare_intervals(expected_interval: Any, actual_res: Any, var: sp.Symbol, tolerance: float) -> ComparisonResult:
        raw_ans = getattr(actual_res, "raw_answer", str(actual_res))
        exp_str = str(expected_interval)
        act_clean = clean_to_sympy_string(raw_ans)

        act_set = SymbolicComparator._parse_to_sympy_set(act_clean, var)
        if act_set is not None:
            try:
                if act_set == expected_interval or (hasattr(act_set, "symmetric_difference") and act_set.symmetric_difference(expected_interval) == EmptySet):
                    return ComparisonResult(True, "Intervals match exactly", exp_str, raw_ans)
                # Also check logical equivalence via relational representation
                if hasattr(act_set, "as_relational") and hasattr(expected_interval, "as_relational"):
                    if sp.simplify(act_set.as_relational(var) ^ expected_interval.as_relational(var)) == False:
                        return ComparisonResult(True, "Intervals match logically", exp_str, raw_ans)
            except Exception:
                pass
            return ComparisonResult(False, f"Inequality mismatch: expected {exp_str}, got {act_set} ('{raw_ans}')", exp_str, raw_ans)

        # Fallback string comparison for raw forms
        if str(expected_interval) in act_clean:
            return ComparisonResult(True, "Interval string matched", exp_str, raw_ans)

        return ComparisonResult(False, f"Could not verify interval: expected {exp_str}, got '{raw_ans}'", exp_str, raw_ans)

    @staticmethod
    def _compare_system(expected_sols: List[Any], actual_res: Any, tolerance: float) -> ComparisonResult:
        actual_sols = getattr(actual_res, "parsed_solutions", None)
        raw_ans = getattr(actual_res, "raw_answer", str(actual_res))
        if not actual_sols and isinstance(actual_res, dict):
            actual_sols = [actual_res]

        if not actual_sols:
            # Look for x = a, y = b in raw_ans
            pairs = re.findall(r"([a-zA-Z])\s*=\s*([-+]?\d*\.?\d+(?:/\d+)?)", raw_ans)
            if pairs:
                sol_dict = {p[0]: float(p[1]) if "/" not in p[1] else float(sp.Rational(p[1])) for p in pairs}
                actual_sols = [sol_dict]

        if not actual_sols or len(actual_sols) == 0:
            return ComparisonResult(False, f"No solutions extracted from system output: '{raw_ans}'", str(expected_sols), raw_ans)

        # Each expected solution dict must match an actual solution dict
        for exp_sol in expected_sols:
            matched = False
            for act_sol in actual_sols:
                all_vars_match = True
                for var_sym, exp_val in exp_sol.items():
                    var_name = str(var_sym)
                    if var_name not in act_sol and f"{var_name}_1" not in act_sol:
                        all_vars_match = False
                        break
                    act_val = act_sol.get(var_name, act_sol.get(f"{var_name}_1"))
                    if not SymbolicComparator._roots_equal(exp_val, act_val, tolerance):
                        all_vars_match = False
                        break
                if all_vars_match:
                    matched = True
                    break
            if not matched:
                return ComparisonResult(False, f"System solution {exp_sol} was not matched in actual {actual_sols}", str(expected_sols), raw_ans)

        return ComparisonResult(True, "All system solutions matched", str(expected_sols), str(actual_sols))

    @staticmethod
    def _extract_numbers_from_string(text: str) -> List[Any]:
        """Heuristic extractor of roots from LaTeX or text answers."""
        cleaned = clean_to_sympy_string(text)
        # Look for numbers or fractions: e.g. -7/3, 8, 3.14, 1 +- 2I
        # If there are comma separated items or x = ...
        parts = re.split(r",|;|\bor\b|\\quad", cleaned)
        roots = []
        for p in parts:
            p = p.strip()
            if not p:
                continue
            if "=" in p:
                p = p.split("=")[-1].strip()
            try:
                val = parse_sympy_expr(p)
                roots.append(val)
            except Exception:
                pass
        return roots

    @staticmethod
    def _compare_ode(oracle_res: Any, actual_res: Any, tolerance: float = 1e-4) -> ComparisonResult:
        raw_ans = getattr(actual_res, "raw_answer", str(actual_res))
        ans_s = raw_ans.split("=", 1)[-1].strip() if "=" in raw_ans else raw_ans.strip()

        cleaned = clean_to_sympy_string(ans_s)
        cleaned = re.sub(r"C_1|C1\b", "c_one", cleaned)
        cleaned = re.sub(r"C_2|C2\b", "c_two", cleaned)

        x = sp.Symbol('x')
        c_one = sp.Symbol('c_one')
        c_two = sp.Symbol('c_two')

        try:
            act_expr = parse_sympy_expr(cleaned)
        except Exception as e:
            return ComparisonResult(False, f"Failed to parse actual ODE solution '{raw_ans}': {e}", str(oracle_res.ground_truth), raw_ans)

        details = getattr(oracle_res, "details", {}) or {}
        a = parse_sympy_expr(details.get("a", "1"))
        b = parse_sympy_expr(details.get("b", "0"))
        c = parse_sympy_expr(details.get("c", "0"))
        f_x = parse_sympy_expr(details.get("f_x", "0"))

        try:
            y_prime = sp.diff(act_expr, x)
            y_double_prime = sp.diff(y_prime, x)
            residual = sp.simplify(a * y_double_prime + b * y_prime + c * act_expr - f_x)

            if residual == 0:
                return ComparisonResult(True, "ODE solution satisfied differential equation identically (residual = 0)", str(oracle_res.ground_truth), raw_ans)

            pts = [(0.5, 1.0, 2.0), (1.2, -1.0, 0.5), (2.1, 0.5, -1.5)]
            all_zero = True
            for px, pC1, pC2 in pts:
                val = complex(sp.N(residual.subs({x: px, c_one: pC1, c_two: pC2})))
                if abs(val) > tolerance:
                    all_zero = False
                    break

            if all_zero:
                return ComparisonResult(True, "ODE solution satisfied differential equation across test points", str(oracle_res.ground_truth), raw_ans)

            return ComparisonResult(False, f"ODE solution does not satisfy differential equation (residual = {residual})", str(oracle_res.ground_truth), raw_ans)
        except Exception as ex:
            return ComparisonResult(False, f"Error validating ODE solution: {ex}", str(oracle_res.ground_truth), raw_ans)
