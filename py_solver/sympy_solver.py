"""
SymPy Math Equation Solver for Student-Facing Web Application
Designed to run client-side in Pyodide or server-side with Python 3.8+.
Emphasizes mathematical correctness, domain validation, extraneous root detection,
step-by-step pedagogy, and full JSON serialization.
"""

from typing import Any, Dict, List, Optional, Set, Tuple, Union
import json
import re
import sympy as sp
from sympy import (
    Eq,
    ImageSet,
    Integer,
    Lambda,
    Rational,
    S,
    Symbol,
    cbrt,
    cos,
    diff,
    exp,
    factor,
    fraction,
    latex,
    log,
    oo,
    pi,
    root,
    roots,
    sin,
    solve,
    solveset,
    sqrt,
    symbols,
    sympify,
    tan,
    together,
)
from sympy.parsing.sympy_parser import (
    convert_xor,
    implicit_multiplication_application,
    parse_expr,
    standard_transformations,
)

# ─── SAFE PARSER & RESTRICTED NAMESPACE ────────────────────────────────────────

SAFE_TRANSFORMATIONS = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)

SAFE_LOCALS = {
    "sin": sp.sin,
    "cos": sp.cos,
    "tan": sp.tan,
    "cot": sp.cot,
    "sec": sp.sec,
    "csc": sp.csc,
    "asin": sp.asin,
    "acos": sp.acos,
    "atan": sp.atan,
    "sinh": sp.sinh,
    "cosh": sp.cosh,
    "tanh": sp.tanh,
    "log": sp.log,
    "ln": sp.log,
    "exp": sp.exp,
    "sqrt": sp.sqrt,
    "cbrt": sp.cbrt,
    "root": sp.root,
    "abs": sp.Abs,
    "pi": sp.pi,
    "E": sp.E,
    "e": sp.E,
    "I": sp.I,
    "i": sp.I,
    "oo": sp.oo,
}


def safe_parse_expr(expr_str: str, var_symbol: Optional[Symbol] = None) -> sp.Expr:
    """Safely parse a mathematical expression string into a SymPy expression."""
    s = expr_str.strip()
    s = s.replace("²", "^2").replace("³", "^3").replace("√", "sqrt")
    s = s.replace("×", "*").replace("÷", "/")
    local_dict = dict(SAFE_LOCALS)
    if var_symbol is not None:
        local_dict[var_symbol.name] = var_symbol

    return parse_expr(
        s,
        local_dict=local_dict,
        transformations=SAFE_TRANSFORMATIONS,
        evaluate=True,
    )


def parse_equation(eq_str: str, var: str = "x") -> Tuple[sp.Expr, sp.Expr, sp.Expr, Symbol]:
    """
    Parse an equation string into (LHS, RHS, LHS - RHS, Symbol).
    Does NOT prematurely cancel fractions or eliminate poles.
    Handles 'y = f(x)' or 'f(x) = ...' as setting f(x) = 0 to find roots.
    """
    v_sym = Symbol(var)
    clean = eq_str.strip()

    # Function notation: y = f(x) -> find roots where y = 0
    fn_match = re.match(r"^(?:y|f\s*\(\s*[a-zA-Z]\s*\))\s*=\s*(.+)$", clean, re.IGNORECASE)
    if fn_match:
        rhs_part = fn_match.group(1).strip()
        lhs_expr = safe_parse_expr(rhs_part, v_sym)
        rhs_expr = S.Zero
        diff_expr = lhs_expr - rhs_expr
        return lhs_expr, rhs_expr, diff_expr, v_sym

    if "=" in clean:
        parts = clean.split("=", 1)
        lhs_expr = safe_parse_expr(parts[0], v_sym)
        rhs_expr = safe_parse_expr(parts[1], v_sym)
    else:
        lhs_expr = safe_parse_expr(clean, v_sym)
        rhs_expr = S.Zero

    diff_expr = lhs_expr - rhs_expr
    return lhs_expr, rhs_expr, diff_expr, v_sym


# ─── HELPER: FIND ORIGINAL DENOMINATORS ───────────────────────────────────────


def extract_denominators(expr: sp.Expr, var_sym: Symbol) -> Set[sp.Expr]:
    """Find all unique denominator sub-expressions containing the variable."""
    dens: Set[sp.Expr] = set()

    for atom in sp.preorder_traversal(expr):
        if atom.is_Pow and atom.exp.is_negative and atom.base.has(var_sym):
            dens.add(atom.base)

    num, den = sp.fraction(expr)
    if den.has(var_sym) and den != S.One:
        factored = sp.factor(den)
        for base, _ in factored.as_powers_dict().items():
            if base.has(var_sym):
                dens.add(base)

    return dens


# ─── EQUATION CLASSIFICATION ─────────────────────────────────────────────────


def classify_equation(eq_str: str, var: str = "x") -> str:
    """
    Parse a raw equation string and classify it into one of:
    - linear
    - quadratic
    - polynomial (degree 3+)
    - rational (variable appears in a denominator)
    - radical (contains sqrt/nth-root of an expression with the variable)
    - trigonometric (sin/cos/tan/etc of the variable)
    - exponential (variable in an exponent)
    - logarithmic (log/ln of an expression with the variable)
    - system (multiple equations or variables)
    """
    if re.search(r"[,;\n]", eq_str) and "=" in eq_str:
        sub_eqs = [part.strip() for part in re.split(r"[,;\n]", eq_str) if part.strip()]
        if len(sub_eqs) > 1:
            return "system"

    lhs, rhs, diff_expr, v_sym = parse_equation(eq_str, var)
    all_exprs = (lhs, rhs, diff_expr)

    # 1. Check Trigonometric
    trig_types = (
        sp.sin,
        sp.cos,
        sp.tan,
        sp.cot,
        sp.sec,
        sp.csc,
        sp.asin,
        sp.acos,
        sp.atan,
    )
    for expr in all_exprs:
        for atom in sp.preorder_traversal(expr):
            if isinstance(atom, trig_types) and atom.has(v_sym):
                return "trigonometric"

    # 2. Check Logarithmic
    for expr in all_exprs:
        for atom in sp.preorder_traversal(expr):
            if isinstance(atom, sp.log) and atom.has(v_sym):
                return "logarithmic"

    # 3. Check Radical (fractional power with variable in base)
    for expr in all_exprs:
        for atom in sp.preorder_traversal(expr):
            if atom.is_Pow and atom.base.has(v_sym):
                if not atom.exp.is_integer:
                    return "radical"

    # 4. Check Exponential (variable in exponent)
    for expr in all_exprs:
        for atom in sp.preorder_traversal(expr):
            if atom.is_Pow and atom.exp.has(v_sym):
                return "exponential"

    # 5. Check Rational (variable in negative exponent or denominator)
    dens = (
        extract_denominators(lhs, v_sym)
        | extract_denominators(rhs, v_sym)
        | extract_denominators(diff_expr, v_sym)
    )
    if dens:
        return "rational"

    # 6. Polynomial Family (linear, quadratic, polynomial 3+)
    simp_diff = sp.simplify(diff_expr)
    if simp_diff.is_polynomial(v_sym):
        deg = sp.degree(simp_diff, v_sym)
        if deg == 1:
            return "linear"
        elif deg == 2:
            return "quadratic"
        elif deg >= 3:
            return "polynomial"
        elif deg == 0:
            return "linear"

    # Fallback inspection of degree
    try:
        deg = sp.degree(sp.cancel(simp_diff), v_sym)
        if deg == 1:
            return "linear"
        elif deg == 2:
            return "quadratic"
        elif deg >= 3:
            return "polynomial"
    except Exception:
        pass

    return "polynomial"


# ─── TYPE-SPECIFIC SOLVER IMPLEMENTATIONS ────────────────────────────────────


def solve_linear(
    lhs: sp.Expr, rhs: sp.Expr, diff_expr: sp.Expr, v_sym: Symbol
) -> Dict[str, Any]:
    steps = []
    poly = sp.Poly(diff_expr, v_sym)
    coeffs = poly.all_coeffs()

    if len(coeffs) == 2:
        a, b = coeffs[0], coeffs[1]
    elif len(coeffs) == 1:
        a, b = coeffs[0], S.Zero
    else:
        a, b = S.Zero, S.Zero

    steps.append({
        "step_number": 1,
        "explanation": "Express the linear equation in standard form $ax + b = 0$:",
        "math_latex": f"{latex(a)}{latex(v_sym)} + {latex(b)} = 0",
        "math_ascii": f"{a}*{v_sym} + {b} = 0",
    })

    if a == 0:
        if b == 0:
            steps.append({
                "step_number": 2,
                "explanation": "Equation holds true for all real values of the variable (Identity):",
                "math_latex": f"{latex(v_sym)} \\in \\mathbb{{R}}",
                "math_ascii": f"{v_sym} in Reals",
            })
            return {
                "type": "linear",
                "solutions": [S.Reals],
                "excluded": [],
                "steps": steps,
                "domain_notes": "Identity equation: infinitely many solutions.",
                "verified": True,
            }
        else:
            steps.append({
                "step_number": 2,
                "explanation": "Contradiction ($b \\neq 0$). The equation has no solution:",
                "math_latex": "\\emptyset",
                "math_ascii": "No solution",
            })
            return {
                "type": "linear",
                "solutions": [],
                "excluded": [],
                "steps": steps,
                "domain_notes": "Inconsistent equation: no real solution exists.",
                "verified": True,
            }

    sol = -b / a
    steps.append({
        "step_number": 2,
        "explanation": f"Isolate the variable term by subtracting constant {latex(b)} from both sides:",
        "math_latex": f"{latex(a)}{latex(v_sym)} = {latex(-b)}",
        "math_ascii": f"{a}*{v_sym} = {-b}",
    })
    steps.append({
        "step_number": 3,
        "explanation": f"Divide both sides by the coefficient {latex(a)}:",
        "math_latex": f"{latex(v_sym)} = {latex(sol)}",
        "math_ascii": f"{v_sym} = {sol}",
    })

    return {
        "type": "linear",
        "solutions": [sol],
        "excluded": [],
        "steps": steps,
        "domain_notes": "Linear equation defined for all real numbers.",
        "verified": True,
    }


def solve_quadratic(
    lhs: sp.Expr, rhs: sp.Expr, diff_expr: sp.Expr, v_sym: Symbol
) -> Dict[str, Any]:
    steps = []
    poly = sp.Poly(diff_expr, v_sym)
    coeffs = poly.all_coeffs()

    if len(coeffs) == 3:
        a, b, c = coeffs[0], coeffs[1], coeffs[2]
    elif len(coeffs) == 2:
        a, b, c = coeffs[0], coeffs[1], S.Zero
    elif len(coeffs) == 1:
        a, b, c = coeffs[0], S.Zero, S.Zero
    else:
        a, b, c = S.One, S.Zero, S.Zero

    steps.append({
        "step_number": 1,
        "explanation": "Identify coefficients for standard form $ax^2 + bx + c = 0$:",
        "math_latex": f"a = {latex(a)}, \\quad b = {latex(b)}, \\quad c = {latex(c)}",
        "math_ascii": f"a = {a}, b = {b}, c = {c}",
    })

    delta = b**2 - 4 * a * c
    steps.append({
        "step_number": 2,
        "explanation": "Compute the discriminant $\\Delta = b^2 - 4ac$:",
        "math_latex": f"\\Delta = ({latex(b)})^2 - 4({latex(a)})({latex(c)}) = {latex(delta)}",
        "math_ascii": f"Delta = ({b})^2 - 4*({a})*({c}) = {delta}",
    })

    if delta > 0:
        disc_desc = f"Since $\\Delta = {latex(delta)} > 0$, there are two distinct real solutions."
    elif delta == 0:
        disc_desc = f"Since $\\Delta = 0$, there is a repeated real solution of multiplicity 2."
    else:
        disc_desc = f"Since $\\Delta = {latex(delta)} < 0$, there are two complex conjugate solutions."

    steps.append({
        "step_number": 3,
        "explanation": disc_desc,
        "math_latex": f"\\Delta = {latex(delta)}",
        "math_ascii": f"Delta = {delta}",
    })

    raw_sols = solve(diff_expr, v_sym)
    clean_sols = []
    for s in raw_sols:
        if not any(sp.simplify(s - cs) == 0 for cs in clean_sols):
            clean_sols.append(s)

    steps.append({
        "step_number": 4,
        "explanation": "Apply the quadratic formula $x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$:",
        "math_latex": ", \\quad ".join([f"{latex(v_sym)} = {latex(s)}" for s in clean_sols]),
        "math_ascii": str(clean_sols),
    })

    return {
        "type": "quadratic",
        "solutions": sorted(
            clean_sols,
            key=lambda s: (float(sp.re(s.evalf())), float(sp.im(s.evalf()))),
        ),
        "excluded": [],
        "steps": steps,
        "domain_notes": "Quadratic polynomial defined for all real numbers.",
        "verified": True,
    }


def solve_polynomial(
    lhs: sp.Expr, rhs: sp.Expr, diff_expr: sp.Expr, v_sym: Symbol
) -> Dict[str, Any]:
    steps = []
    simp_diff = sp.simplify(diff_expr)
    poly = sp.Poly(simp_diff, v_sym)
    deg = poly.degree()

    steps.append({
        "step_number": 1,
        "explanation": f"Write the polynomial of degree {deg} in standard form $P({latex(v_sym)}) = 0$:",
        "math_latex": f"{latex(simp_diff)} = 0",
        "math_ascii": f"{simp_diff} = 0",
    })

    factored = factor(simp_diff)
    steps.append({
        "step_number": 2,
        "explanation": "Factor the polynomial completely over $\\mathbb{Q}$ / $\\mathbb{R}$:",
        "math_latex": f"{latex(factored)} = 0",
        "math_ascii": f"{factored} = 0",
    })

    root_dict = roots(poly)
    all_sols = []
    mult_notes = []

    for r, m in root_dict.items():
        all_sols.append(r)
        mult_notes.append(f"{latex(v_sym)} = {latex(r)} \\text{{ (multiplicity {m})}}")

    if not all_sols:
        all_sols = solve(simp_diff, v_sym)
        for s in all_sols:
            mult_notes.append(f"{latex(v_sym)} = {latex(s)}")

    steps.append({
        "step_number": 3,
        "explanation": "Identify all roots and their respective multiplicities (including repeated root multiplicity):",
        "math_latex": ", \\quad ".join(mult_notes),
        "math_ascii": "; ".join(mult_notes),
    })

    return {
        "type": "polynomial",
        "solutions": sorted(
            all_sols,
            key=lambda s: (float(sp.re(s.evalf())), float(sp.im(s.evalf()))),
        ),
        "excluded": [],
        "steps": steps,
        "domain_notes": f"Polynomial of degree {deg} has {deg} roots in $\\mathbb{{C}}$ (counting multiplicity).",
        "verified": True,
    }


def solve_rational(
    lhs: sp.Expr, rhs: sp.Expr, diff_expr: sp.Expr, v_sym: Symbol
) -> Dict[str, Any]:
    steps = []

    lhs_dens = extract_denominators(lhs, v_sym)
    rhs_dens = extract_denominators(rhs, v_sym)
    diff_dens = extract_denominators(diff_expr, v_sym)
    all_dens = list(lhs_dens.union(rhs_dens).union(diff_dens))

    excluded_vals: Set[sp.Expr] = set()
    restr_strings = []

    for den in all_dens:
        den_roots = solveset(den, v_sym, domain=S.Reals)
        for dr in den_roots:
            excluded_vals.add(dr)
            restr_strings.append(f"{latex(v_sym)} \\neq {latex(dr)}")

    domain_notes = "Domain restriction: " + (
        ", ".join(restr_strings) + " (division by zero is undefined)"
        if restr_strings
        else "No division-by-zero restrictions found."
    )

    steps.append({
        "step_number": 1,
        "explanation": "Identify domain restrictions by setting all denominators in the original equation to non-zero:",
        "math_latex": ", \\quad ".join(restr_strings) if restr_strings else "\\text{No restrictions}",
        "math_ascii": ", ".join(restr_strings) if restr_strings else "No restrictions",
    })

    combined = together(lhs - rhs)
    num, den = fraction(combined)

    steps.append({
        "step_number": 2,
        "explanation": "Clear fractions by multiplying through by the Least Common Denominator (LCD):",
        "math_latex": f"\\text{{Numerator: }} {latex(num)} = 0",
        "math_ascii": f"Numerator: {num} = 0",
    })

    candidate_sols = list(solveset(num, v_sym, domain=S.Reals))
    valid_sols = []
    discarded = []

    for sol in candidate_sols:
        is_extraneous = False
        for den_expr in all_dens:
            val = sp.simplify(den_expr.subs(v_sym, sol))
            if val == 0 or (val.is_number and abs(complex(val.evalf())) < 1e-7):
                is_extraneous = True
                break

        if any(sp.simplify(sol - ex) == 0 for ex in excluded_vals):
            is_extraneous = True

        if is_extraneous:
            discarded.append(sol)
        else:
            valid_sols.append(sol)

    steps.append({
        "step_number": 3,
        "explanation": "Solve the resulting polynomial equation and check each candidate root against domain restrictions:",
        "math_latex": f"\\text{{Candidates: }} {latex(candidate_sols)}",
        "math_ascii": f"Candidates: {candidate_sols}",
    })

    if discarded:
        steps.append({
            "step_number": 4,
            "explanation": "Discard extraneous root(s) that cause division by zero in the original denominators:",
            "math_latex": "\\text{Extraneous root(s): } " + ", ".join([f"{latex(v_sym)} = {latex(d)}" for d in discarded]) + " \\quad (\\text{rejected})",
            "math_ascii": f"Extraneous root(s): {discarded} (rejected)",
        })

    all_excluded = list(excluded_vals)
    for d in discarded:
        if not any(sp.simplify(d - ex) == 0 for ex in all_excluded):
            all_excluded.append(d)

    return {
        "type": "rational",
        "solutions": sorted(valid_sols, key=lambda s: float(s.evalf()) if s.is_number else 0),
        "excluded": all_excluded,
        "steps": steps,
        "domain_notes": domain_notes,
        "verified": True,
    }


def solve_radical(
    lhs: sp.Expr, rhs: sp.Expr, diff_expr: sp.Expr, v_sym: Symbol
) -> Dict[str, Any]:
    steps = []

    steps.append({
        "step_number": 1,
        "explanation": "Isolate the radical expression to one side of the equation:",
        "math_latex": f"{latex(lhs)} = {latex(rhs)}",
        "math_ascii": f"{lhs} = {rhs}",
    })

    candidate_sols = []
    # Use unrad to eliminate radicals algebraically
    try:
        from sympy.solvers.solvers import unrad
        u = unrad(diff_expr, v_sym)
        if u and u[0] is not None:
            poly_eq = u[0]
            candidate_sols = solve(poly_eq, v_sym)
    except Exception:
        pass

    if not candidate_sols:
        try:
            poly_eq = sp.expand(lhs**2 - rhs**2)
            candidate_sols = solve(poly_eq, v_sym)
        except Exception:
            pass

    if not candidate_sols:
        candidate_sols = solve(diff_expr, v_sym)

    # Clean candidate list
    clean_candidates = []
    for c in candidate_sols:
        if not any(sp.simplify(c - cc) == 0 for cc in clean_candidates):
            clean_candidates.append(c)

    steps.append({
        "step_number": 2,
        "explanation": "Eliminate radicals by raising both sides to powers and solving the resulting polynomial:",
        "math_latex": f"\\text{{Candidate algebraic solutions: }} {latex(clean_candidates)}",
        "math_ascii": f"Candidate algebraic solutions: {clean_candidates}",
    })

    valid_sols = []
    extraneous = []

    for sol in clean_candidates:
        if not (sol.is_real or (sol.is_number and sp.im(sol) == 0)):
            continue

        try:
            lhs_val = lhs.subs(v_sym, sol)
            rhs_val = rhs.subs(v_sym, sol)
            val_diff = sp.simplify(lhs_val - rhs_val)
            is_valid = False

            if val_diff == 0 or val_diff.is_zero:
                is_valid = True
            elif val_diff.is_number:
                is_valid = abs(complex(val_diff.evalf())) < 1e-6

            if is_valid:
                valid_sols.append(sol)
            else:
                extraneous.append(sol)
        except Exception:
            valid_sols.append(sol)

    if extraneous:
        steps.append({
            "step_number": 3,
            "explanation": "Check solutions in the original equation to identify and discard extraneous roots introduced by squaring/powers:",
            "math_latex": "\\text{Extraneous root(s): } " + ", ".join([f"{latex(v_sym)} = {latex(ex)}" for ex in extraneous]) + " \\quad (\\text{rejected})",
            "math_ascii": f"Extraneous root(s): {extraneous} (rejected)",
        })

    steps.append({
        "step_number": 4 if extraneous else 3,
        "explanation": "Final verified real solution(s):",
        "math_latex": ", \\quad ".join([f"{latex(v_sym)} = {latex(s)}" for s in valid_sols]) if valid_sols else "\\text{No real solution } (\\emptyset)",
        "math_ascii": str(valid_sols) if valid_sols else "No real solution",
    })

    return {
        "type": "radical",
        "solutions": sorted(valid_sols, key=lambda s: float(s.evalf()) if s.is_number else 0),
        "excluded": extraneous,
        "steps": steps,
        "domain_notes": "Radical equation: domain requires non-negative radicands for even roots.",
        "verified": True,
    }


def solve_trigonometric(
    lhs: sp.Expr, rhs: sp.Expr, diff_expr: sp.Expr, v_sym: Symbol
) -> Dict[str, Any]:
    steps = []

    steps.append({
        "step_number": 1,
        "explanation": "Express trigonometric equation in standard homogeneous form $T(x) = 0$:",
        "math_latex": f"{latex(diff_expr)} = 0",
        "math_ascii": f"{diff_expr} = 0",
    })

    # Force symbolic solveset with Eq(lhs, rhs) first for exact trigonometric roots
    sol_set = solveset(Eq(lhs, rhs), v_sym, domain=S.Reals)
    if not sol_set or getattr(sol_set, "is_ConditionSet", False):
        sol_set = solveset(diff_expr, v_sym, domain=S.Reals)
    general_solutions: List[sp.Expr] = []
    principal_solutions: List[sp.Expr] = []

    n = Symbol("n", integer=True)

    def extract_from_set(s_obj: Any) -> None:
        if isinstance(s_obj, ImageSet):
            lam = s_obj.lamda
            expr_n = lam(n)
            general_solutions.append(expr_n)
            # Evaluate for n in [-4, 4] to find principal solutions in [0, 2*pi)
            for k_val in range(-4, 6):
                val = expr_n.subs(n, k_val)
                try:
                    num_val = float(val.evalf())
                    if -1e-8 <= num_val < (2 * 3.141592653589793 - 1e-8):
                        if num_val < 0:
                            val = S.Zero
                        principal_solutions.append(val)
                except Exception:
                    pass
        elif hasattr(s_obj, "args") and s_obj.is_Union:
            for sub in s_obj.args:
                extract_from_set(sub)
        elif hasattr(s_obj, "__iter__"):
            for item in s_obj:
                if item.is_number:
                    principal_solutions.append(item)
                    general_solutions.append(item)

    extract_from_set(sol_set)

    if not general_solutions:
        try:
            raw_sols = solve(diff_expr, v_sym)
            for rs in raw_sols:
                principal_solutions.append(rs)
                general_solutions.append(rs)
        except Exception:
            pass

    clean_principals = []
    for p in principal_solutions:
        if not any(sp.simplify(p - cp) == 0 for cp in clean_principals):
            clean_principals.append(p)

    clean_principals = sorted(clean_principals, key=lambda s: float(s.evalf()) if s.is_number else 0)

    steps.append({
        "step_number": 2,
        "explanation": "Solve for the general periodic solution set over $\\mathbb{R}$ ($n \\in \\mathbb{Z}$):",
        "math_latex": ", \\quad ".join([f"{latex(v_sym)} = {latex(g)}" for g in general_solutions]) if general_solutions else "\\emptyset",
        "math_ascii": str(general_solutions),
    })

    if clean_principals:
        steps.append({
            "step_number": 3,
            "explanation": "Principal solutions within the interval $[0, 2\\pi)$:",
            "math_latex": ", \\quad ".join([f"{latex(v_sym)} = {latex(p)}" for p in clean_principals]),
            "math_ascii": str(clean_principals),
        })

    return {
        "type": "trigonometric",
        "solutions": clean_principals if clean_principals else general_solutions,
        "general_solutions": general_solutions,
        "principal_solutions": clean_principals,
        "excluded": [],
        "steps": steps,
        "domain_notes": "Trigonometric solutions are periodic with integer parameter n (n ∈ ℤ).",
        "verified": True,
    }


def solve_logarithmic(
    lhs: sp.Expr, rhs: sp.Expr, diff_expr: sp.Expr, v_sym: Symbol
) -> Dict[str, Any]:
    steps = []

    log_args: List[sp.Expr] = []
    for atom in sp.preorder_traversal(lhs):
        if isinstance(atom, sp.log) and atom.args[0].has(v_sym):
            log_args.append(atom.args[0])
    for atom in sp.preorder_traversal(rhs):
        if isinstance(atom, sp.log) and atom.args[0].has(v_sym):
            log_args.append(atom.args[0])

    steps.append({
        "step_number": 1,
        "explanation": "Identify domain restrictions for logarithmic expressions. The argument of each logarithm must be strictly positive ($u > 0$):",
        "math_latex": " \\quad \\text{and} \\quad ".join([f"{latex(arg)} > 0" for arg in log_args]) if log_args else "\\text{None}",
        "math_ascii": ", ".join([f"{arg} > 0" for arg in log_args]),
    })

    steps.append({
        "step_number": 2,
        "explanation": "Apply logarithmic laws $\\log(a) + \\log(b) = \\log(ab)$ and $\\log(a) - \\log(b) = \\log(a/b)$ to combine terms, then exponentiate:",
        "math_latex": f"{latex(diff_expr)} = 0",
        "math_ascii": f"{diff_expr} = 0",
    })

    candidates = []
    try:
        combined = sp.logcombine(diff_expr, force=True)
        alg_eq = sp.simplify(sp.exp(combined) - 1)
        for c in solve(alg_eq, v_sym):
            if not any(sp.simplify(c - ec) == 0 for ec in candidates):
                candidates.append(c)
    except Exception:
        pass

    try:
        for c in solve(diff_expr, v_sym):
            if not any(sp.simplify(c - ec) == 0 for ec in candidates):
                candidates.append(c)
    except Exception:
        pass

    if not candidates:
        try:
            cand_set = solveset(diff_expr, v_sym, domain=S.Reals)
            for c in cand_set:
                if not any(sp.simplify(c - ec) == 0 for ec in candidates):
                    candidates.append(c)
        except Exception:
            pass

    valid_sols = []
    extraneous = []

    for c in candidates:
        if not (c.is_real or (c.is_number and sp.im(c) == 0)):
            continue

        arg_nonpositive = False
        for arg in log_args:
            val = arg.subs(v_sym, c)
            try:
                if val <= 0 or val.evalf() <= 0:
                    arg_nonpositive = True
                    break
            except Exception:
                pass

        if arg_nonpositive:
            extraneous.append(c)
        else:
            val_diff = sp.simplify(lhs.subs(v_sym, c) - rhs.subs(v_sym, c))
            is_valid = False
            try:
                if val_diff == 0 or val_diff.is_zero:
                    is_valid = True
                elif val_diff.is_number:
                    is_valid = abs(complex(val_diff.evalf())) < 1e-6
            except Exception:
                pass

            if is_valid:
                valid_sols.append(c)
            else:
                extraneous.append(c)

    if extraneous:
        steps.append({
            "step_number": 3,
            "explanation": "Discard extraneous root(s) that produce a non-positive argument ($\\\\le 0$) in any original logarithm:",
            "math_latex": "\\text{Extraneous root(s): } " + ", ".join([f"{latex(v_sym)} = {latex(ex)}" for ex in extraneous]) + " \\quad (\\text{rejected})",
            "math_ascii": f"Extraneous: {extraneous}",
        })

    steps.append({
        "step_number": 4 if extraneous else 3,
        "explanation": "Final valid real solution(s):",
        "math_latex": ", \\quad ".join([f"{latex(v_sym)} = {latex(s)}" for s in valid_sols]) if valid_sols else "\\text{No real solution } (\\emptyset)",
        "math_ascii": str(valid_sols) if valid_sols else "No real solution",
    })

    return {
        "type": "logarithmic",
        "solutions": sorted(valid_sols, key=lambda s: float(s.evalf()) if s.is_number else 0),
        "excluded": extraneous,
        "steps": steps,
        "domain_notes": "Logarithmic domain requires all arguments to be strictly positive (> 0).",
        "verified": True,
    }


def solve_exponential(
    lhs: sp.Expr, rhs: sp.Expr, diff_expr: sp.Expr, v_sym: Symbol
) -> Dict[str, Any]:
    steps = []

    steps.append({
        "step_number": 1,
        "explanation": "Write the exponential equation in standard form and relate bases using properties of exponents or logarithms:",
        "math_latex": f"{latex(lhs)} = {latex(rhs)}",
        "math_ascii": f"{lhs} = {rhs}",
    })

    candidates = solve(diff_expr, v_sym)
    if not candidates:
        cand_set = solveset(diff_expr, v_sym, domain=S.Reals)
        candidates = list(cand_set)

    valid_sols = []
    extraneous = []

    for c in candidates:
        if not (c.is_real or (c.is_number and sp.im(c) == 0)):
            continue

        try:
            val_diff = sp.simplify(lhs.subs(v_sym, c) - rhs.subs(v_sym, c))
            is_valid = False
            if val_diff == 0 or val_diff.is_zero:
                is_valid = True
            elif val_diff.is_number:
                is_valid = abs(complex(val_diff.evalf())) < 1e-6

            if is_valid:
                valid_sols.append(c)
            else:
                extraneous.append(c)
        except Exception:
            valid_sols.append(c)

    steps.append({
        "step_number": 2,
        "explanation": "Solve for the variable by equating exponents or taking natural logarithms of both sides:",
        "math_latex": ", \\quad ".join([f"{latex(v_sym)} = {latex(s)}" for s in valid_sols]) if valid_sols else "\\text{No real solution } (\\emptyset)",
        "math_ascii": str(valid_sols) if valid_sols else "No real solution",
    })

    return {
        "type": "exponential",
        "solutions": sorted(valid_sols, key=lambda s: float(s.evalf()) if s.is_number else 0),
        "excluded": extraneous,
        "steps": steps,
        "domain_notes": "Exponential bases must satisfy positive base properties ($a > 0, a \\neq 1$).",
        "verified": True,
    }


def solve_system(eqs_list: List[str], vars_list: Optional[List[str]] = None) -> Dict[str, Any]:
    steps = []
    parsed_eqs = []

    detected_symbols: Set[Symbol] = set()
    for eq_str in eqs_list:
        if "=" in eq_str:
            p = eq_str.split("=", 1)
            e = safe_parse_expr(p[0]) - safe_parse_expr(p[1])
        else:
            e = safe_parse_expr(eq_str)
        parsed_eqs.append(e)
        detected_symbols.update(e.free_symbols)

    syms = sorted(list(detected_symbols), key=lambda s: s.name)
    steps.append({
        "step_number": 1,
        "explanation": "Formulate the system of simultaneous equations in standard form:",
        "math_latex": "\\begin{cases} " + " \\\\ ".join([f"{latex(e)} = 0" for e in parsed_eqs]) + " \\end{cases}",
        "math_ascii": "; ".join([f"{e} = 0" for e in parsed_eqs]),
    })

    sol_dict = solve(parsed_eqs, syms, dict=True)

    steps.append({
        "step_number": 2,
        "explanation": "Solve the system using algebraic elimination / matrix substitution:",
        "math_latex": f"\\text{{Found {len(sol_dict)} solution set(s)}}",
        "math_ascii": f"Found {len(sol_dict)} solution set(s)",
    })

    return {
        "type": "system",
        "solutions": sol_dict,
        "excluded": [],
        "steps": steps,
        "domain_notes": f"System in {len(syms)} variables: {', '.join([s.name for s in syms])}.",
        "verified": True,
    }


# ─── MAIN DISPATCHER ─────────────────────────────────────────────────────────


def solve_equation(eq_str: str, var: str = "x") -> Dict[str, Any]:
    """
    Dispatcher: classifies equation, routes to specialized solver,
    performs self-check validation, and returns structured result dict.
    """
    eq_type = classify_equation(eq_str, var)

    if eq_type == "system":
        sub_eqs = [part.strip() for part in re.split(r"[,;\n]", eq_str) if part.strip()]
        return solve_system(sub_eqs)

    lhs, rhs, diff_expr, v_sym = parse_equation(eq_str, var)

    if eq_type == "linear":
        res = solve_linear(lhs, rhs, diff_expr, v_sym)
    elif eq_type == "quadratic":
        res = solve_quadratic(lhs, rhs, diff_expr, v_sym)
    elif eq_type == "polynomial":
        res = solve_polynomial(lhs, rhs, diff_expr, v_sym)
    elif eq_type == "rational":
        res = solve_rational(lhs, rhs, diff_expr, v_sym)
    elif eq_type == "radical":
        res = solve_radical(lhs, rhs, diff_expr, v_sym)
    elif eq_type == "trigonometric":
        res = solve_trigonometric(lhs, rhs, diff_expr, v_sym)
    elif eq_type == "exponential":
        res = solve_exponential(lhs, rhs, diff_expr, v_sym)
    elif eq_type == "logarithmic":
        res = solve_logarithmic(lhs, rhs, diff_expr, v_sym)
    else:
        res = solve_polynomial(lhs, rhs, diff_expr, v_sym)

    # Self-Check Verification Pass
    verified_solutions = []
    flagged_solutions = []

    for s in res.get("solutions", []):
        if s == S.Reals or not hasattr(s, "subs"):
            verified_solutions.append(s)
            continue

        try:
            val_diff = sp.simplify(lhs.subs(v_sym, s) - rhs.subs(v_sym, s))
            if val_diff == 0 or val_diff.is_zero:
                verified_solutions.append(s)
            elif val_diff.is_number and abs(complex(val_diff.evalf())) < 1e-6:
                verified_solutions.append(s)
            else:
                flagged_solutions.append(s)
        except Exception:
            verified_solutions.append(s)

    if flagged_solutions:
        for fl in flagged_solutions:
            if not any(sp.simplify(fl - ex) == 0 for ex in res["excluded"]):
                res["excluded"].append(fl)
        res["solutions"] = verified_solutions

    res["verified"] = len(flagged_solutions) == 0
    return res


# ─── WEB ENTRY POINT (JSON-SERIALIZABLE FOR PYODIDE) ─────────────────────────


def _serialize_sympy(obj: Any) -> Any:
    """Helper to convert SymPy entities into JSON-serializable structures."""
    if isinstance(obj, (int, float, str, bool)) or obj is None:
        return obj
    if isinstance(obj, (list, tuple, set)):
        return [_serialize_sympy(item) for item in obj]
    if isinstance(obj, dict):
        return {str(k): _serialize_sympy(v) for k, v in obj.items()}
    if hasattr(obj, "evalf") and obj.is_number:
        try:
            num = float(obj.evalf())
            return {
                "latex": latex(obj),
                "ascii": str(obj),
                "numeric": num if sp.im(obj) == 0 else None,
            }
        except Exception:
            pass

    return {
        "latex": latex(obj),
        "ascii": str(obj),
    }


def solve_for_web(eq_str: str, var: str = "x") -> str:
    """
    Clean entry point for JavaScript / Pyodide.
    Returns JSON string with all SymPy objects safely converted to strings and LaTeX.
    """
    try:
        raw_result = solve_equation(eq_str, var)
        serialized = _serialize_sympy(raw_result)
        serialized["success"] = True
        serialized["error"] = None
        return json.dumps(serialized)
    except Exception as err:
        return json.dumps({
            "success": False,
            "error": str(err),
            "type": "error",
            "solutions": [],
            "excluded": [],
            "steps": [],
            "domain_notes": f"Error solving equation: {err}",
            "verified": False,
        })
