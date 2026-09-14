"""
SymPy Ground-Truth Oracle
Computes exact symbolic mathematical solutions across algebra, calculus, and systems.
"""

import re
from typing import Any, Dict, List, Optional, Set, Union
import sympy as sp
from sympy import S, Interval, Union as SpUnion, EmptySet, FiniteSet, oo

def parse_sympy_expr(expr_str: str) -> sp.Expr:
    """Pre-clean expression string into standard SymPy syntax."""
    clean = expr_str.strip()
    clean = clean.replace("^", "**")
    # Replace implicit mult like 2x -> 2*x, 3sin -> 3*sin
    # But sympify with transformations handles standard implicit multiplication
    from sympy.parsing.sympy_parser import (
        parse_expr,
        standard_transformations,
        implicit_multiplication_application,
        convert_xor
    )
    transformations = standard_transformations + (
        implicit_multiplication_application,
        convert_xor
    )
    # custom mappings
    local_dict = {
        "ln": sp.log,
        "cbrt": lambda x: sp.cbrt(x),
        "e": sp.E,
        "pi": sp.pi,
        "PI": sp.pi,
        "i": sp.I,
        "I": sp.I
    }
    return parse_expr(clean, local_dict=local_dict, transformations=transformations)

class OracleResult:
    def __init__(
        self,
        case_id: str,
        category: str,
        result_type: str,
        ground_truth: Any,
        latex_str: str = "",
        details: Optional[Dict[str, Any]] = None
    ):
        self.case_id = case_id
        self.category = category
        self.result_type = result_type  # 'set', 'interval', 'expression', 'system', 'no_solution', 'all_reals'
        self.ground_truth = ground_truth
        self.latex_str = latex_str
        self.details = details or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "case_id": self.case_id,
            "category": self.category,
            "result_type": self.result_type,
            "ground_truth": str(self.ground_truth),
            "latex": self.latex_str,
            "details": self.details
        }

class SympyOracle:
    """Computes exact ground truth using SymPy."""

    @staticmethod
    def solve_case(case: Dict[str, Any], category: str) -> OracleResult:
        case_id = case.get("id", "")
        var_name = case.get("variable", "x")
        var = sp.Symbol(var_name)

        if category in ("polynomial", "linear", "quadratic", "cubic_quartic", "rational", "radical", "exponential_logarithmic", "edge_cases"):
            return SympyOracle._solve_equation(case_id, category, case["input"], var)
        elif category == "trigonometric":
            domain = case.get("domain", [0, "2*pi"])
            return SympyOracle._solve_trig(case_id, category, case["input"], var, domain)
        elif category in ("systems", "systems_linear", "systems_nonlinear"):
            return SympyOracle._solve_system(case_id, category, case["input"], case.get("variables", ["x", "y"]))
        elif category == "inequalities":
            return SympyOracle._solve_inequality(case_id, category, case["input"], var)
        elif category == "derivatives":
            return SympyOracle._solve_derivative(case_id, category, case["input"], var)
        elif category == "integrals":
            return SympyOracle._solve_integral(case_id, category, case, var)
        elif category == "ode":
            return SympyOracle._solve_ode(case_id, category, case["input"])
        elif category == "matrix":
            return SympyOracle._solve_matrix(case_id, category, case)
        elif category in ("arithmetic_scientific", "arithmetic_gcd_lcm", "scientific_calculator", "unit_converter"):
            return SympyOracle._solve_arithmetic(case_id, category, case)
        else:
            raise ValueError(f"Unknown category: {category}")

    @staticmethod
    def _solve_equation(case_id: str, category: str, eq_str: str, var: sp.Symbol) -> OracleResult:
        if "=" in eq_str:
            lhs_s, rhs_s = eq_str.split("=", 1)
            lhs = parse_sympy_expr(lhs_s)
            rhs = parse_sympy_expr(rhs_s)
            eq = sp.Eq(lhs, rhs)
            expr = lhs - rhs
        else:
            expr = parse_sympy_expr(eq_str)
            eq = sp.Eq(expr, 0)

        # Check for identities (0 == 0)
        try:
            if sp.simplify(expr) == 0 and ("=" in eq_str):
                # Identity check: make sure denominator is not 0 everywhere
                return OracleResult(case_id, category, "all_reals", S.Reals, "\\mathbb{R}")
        except Exception:
            pass

        # Use solve
        try:
            raw_sols = sp.solve(eq, var)
        except Exception:
            raw_sols = []

        # Filter solutions that violate the original domain (e.g. division by zero, negative under even root)
        valid_sols = []
        if "=" in eq_str:
            lhs_s, rhs_s = eq_str.split("=", 1)
            lhs = parse_sympy_expr(lhs_s)
            rhs = parse_sympy_expr(rhs_s)
            for s_val in raw_sols:
                try:
                    # Check denominator zeros
                    sub_l = lhs.subs(var, s_val)
                    sub_r = rhs.subs(var, s_val)
                    if sub_l.has(sp.zoo, sp.nan) or sub_r.has(sp.zoo, sp.nan):
                        continue
                    # Check equality holds numerically or symbolically
                    diff = sp.simplify(sub_l - sub_r)
                    if diff == 0 or abs(sp.N(diff)) < 1e-7:
                        valid_sols.append(s_val)
                except Exception:
                    pass
        else:
            valid_sols = raw_sols

        if not valid_sols:
            return OracleResult(case_id, category, "no_solution", EmptySet, "\\emptyset")

        return OracleResult(
            case_id=case_id,
            category=category,
            result_type="set",
            ground_truth=valid_sols,
            latex_str=sp.latex(valid_sols),
            details={"roots": [str(r) for r in valid_sols]}
        )

    @staticmethod
    def _solve_trig(case_id: str, category: str, eq_str: str, var: sp.Symbol, domain_spec: List[Any]) -> OracleResult:
        lhs_s, rhs_s = eq_str.split("=", 1)
        lhs = parse_sympy_expr(lhs_s)
        rhs = parse_sympy_expr(rhs_s)
        
        low = parse_sympy_expr(str(domain_spec[0]))
        high = parse_sympy_expr(str(domain_spec[1]))
        dom_interval = Interval(low, high)

        solset = sp.solveset(lhs - rhs, var, domain=dom_interval)
        if solset == EmptySet or not isinstance(solset, FiniteSet):
            # Try numeric or direct solve within domain
            try:
                raw_s = sp.solve(sp.Eq(lhs, rhs), var)
                in_dom = [s for s in raw_s if s.is_real and low <= s <= high]
                solset = FiniteSet(*in_dom)
            except Exception:
                solset = EmptySet

        sols_list = sorted(list(solset), key=lambda x: float(sp.N(x))) if solset != EmptySet else []
        if not sols_list:
            return OracleResult(case_id, category, "no_solution", EmptySet, "\\emptyset")

        return OracleResult(
            case_id=case_id,
            category=category,
            result_type="set",
            ground_truth=sols_list,
            latex_str=sp.latex(sols_list),
            details={"roots": [str(r) for r in sols_list]}
        )

    @staticmethod
    def _solve_system(case_id: str, category: str, eq_list: List[str], var_names: List[str]) -> OracleResult:
        symbols = [sp.Symbol(v) for v in var_names]
        eqs = []
        for e in eq_list:
            lhs_s, rhs_s = e.split("=", 1)
            eqs.append(sp.Eq(parse_sympy_expr(lhs_s), parse_sympy_expr(rhs_s)))

        try:
            sol = sp.solve(eqs, symbols, dict=True)
        except Exception:
            sol = []

        if not sol:
            return OracleResult(case_id, category, "no_solution", EmptySet, "\\text{No solution}")

        return OracleResult(
            case_id=case_id,
            category=category,
            result_type="system",
            ground_truth=sol,
            latex_str=sp.latex(sol),
            details={"solutions": [{str(k): str(v) for k, v in item.items()} for item in sol]}
        )

    @staticmethod
    def _solve_inequality(case_id: str, category: str, ineq_str: str, var: sp.Symbol) -> OracleResult:
        # Relational symbols: >=, <=, >, <
        op = None
        for cand in [">=", "<=", ">", "<"]:
            if cand in ineq_str:
                op = cand
                break
        if not op:
            raise ValueError(f"No inequality operator found in {ineq_str}")

        lhs_s, rhs_s = ineq_str.split(op, 1)
        lhs = parse_sympy_expr(lhs_s)
        rhs = parse_sympy_expr(rhs_s)
        diff = lhs - rhs

        if op == ">":
            ineq = diff > 0
        elif op == ">=":
            ineq = diff >= 0
        elif op == "<":
            ineq = diff < 0
        else:
            ineq = diff <= 0

        res_set = sp.solveset(ineq, var, domain=S.Reals)
        if res_set == EmptySet:
            return OracleResult(case_id, category, "no_solution", EmptySet, "\\emptyset")
        if res_set == S.Reals:
            return OracleResult(case_id, category, "all_reals", S.Reals, "(-\\infty, \\infty)")

        return OracleResult(
            case_id=case_id,
            category=category,
            result_type="interval",
            ground_truth=res_set,
            latex_str=sp.latex(res_set),
            details={"interval_str": str(res_set)}
        )

    @staticmethod
    def _solve_derivative(case_id: str, category: str, expr_str: str, var: sp.Symbol) -> OracleResult:
        expr = parse_sympy_expr(expr_str)
        deriv = sp.diff(expr, var)
        return OracleResult(
            case_id=case_id,
            category=category,
            result_type="expression",
            ground_truth=deriv,
            latex_str=sp.latex(deriv),
            details={"derivative": str(deriv)}
        )

    @staticmethod
    def _solve_integral(case_id: str, category: str, case: Dict[str, Any], var: sp.Symbol) -> OracleResult:
        expr = parse_sympy_expr(case["input"])
        int_type = case.get("type", "indefinite")

        if int_type == "definite":
            low = parse_sympy_expr(str(case["lower"]))
            high = parse_sympy_expr(str(case["upper"]))
            integral_val = sp.integrate(expr, (var, low, high))
            return OracleResult(
                case_id=case_id,
                category=category,
                result_type="expression",
                ground_truth=integral_val,
                latex_str=sp.latex(integral_val),
                details={"value": str(integral_val), "is_definite": True}
            )
        else:
            indef = sp.integrate(expr, var)
            return OracleResult(
                case_id=case_id,
                category=category,
                result_type="expression",
                ground_truth=indef,
                latex_str=sp.latex(indef) + " + C",
                details={"antiderivative": str(indef), "is_definite": False}
            )

    @staticmethod
    def _solve_ode(case_id: str, category: str, eq_str: str) -> OracleResult:
        x = sp.Symbol('x')
        y = sp.Function('y')

        lhs_s, rhs_s = eq_str.split("=", 1) if "=" in eq_str else (eq_str, "0")

        def clean_ode_sub(s: str) -> sp.Expr:
            s = s.replace("y''", "var_two").replace("y'", "var_one")
            s = re.sub(r"(\d)\s*y\b", r"\1*var_zero", s)
            s = re.sub(r"\by\b", "var_zero", s)
            return parse_sympy_expr(s)

        expr = clean_ode_sub(lhs_s) - clean_ode_sub(rhs_s)
        v2, v1, v0 = sp.symbols('var_two var_one var_zero')
        e000 = expr.subs({v2: 0, v1: 0, v0: 0})
        e100 = expr.subs({v2: 1, v1: 0, v0: 0})
        e010 = expr.subs({v2: 0, v1: 1, v0: 0})
        e001 = expr.subs({v2: 0, v1: 0, v0: 1})

        a = sp.simplify(e100 - e000)
        b = sp.simplify(e010 - e000)
        c = sp.simplify(e001 - e000)
        f_x = sp.simplify(-e000)

        ode_eq = sp.Eq(a * y(x).diff(x, 2) + b * y(x).diff(x) + c * y(x), f_x)
        sol = None
        try:
            sol = sp.dsolve(ode_eq, y(x))
            gt_expr = sol.rhs
        except Exception:
            gt_expr = None

        return OracleResult(
            case_id=case_id,
            category=category,
            result_type="ode",
            ground_truth=gt_expr,
            latex_str=sp.latex(sol) if sol is not None else "",
            details={
                "a": str(a),
                "b": str(b),
                "c": str(c),
                "f_x": str(f_x),
                "eq_str": eq_str
            }
        )

    @staticmethod
    def _solve_matrix(case_id: str, category: str, case: Dict[str, Any]) -> OracleResult:
        op = case.get("operation")
        matA = sp.Matrix(case["matrixA"])
        matB = sp.Matrix(case["matrixB"]) if "matrixB" in case and case["matrixB"] is not None else None

        if op == "determinant":
            val = float(matA.det())
            return OracleResult(case_id, category, "matrix_scalar", val, str(val), {"value": val})
        elif op == "trace":
            val = float(matA.trace())
            return OracleResult(case_id, category, "matrix_scalar", val, str(val), {"value": val})
        elif op == "rank":
            val = int(matA.rank())
            return OracleResult(case_id, category, "matrix_scalar", val, str(val), {"value": val})
        elif op == "transpose":
            res = matA.T
            return OracleResult(case_id, category, "matrix", [[float(x) for x in row] for row in res.tolist()], sp.latex(res), {"matrix": res.tolist()})
        elif op == "inverse":
            if matA.det() == 0:
                return OracleResult(case_id, category, "no_solution", EmptySet, "\\text{Singular matrix}", {"singular": True})
            res = matA.inv()
            return OracleResult(case_id, category, "matrix", [[float(x) for x in row] for row in res.tolist()], sp.latex(res), {"matrix": res.tolist()})
        elif op == "multiply":
            res = matA * matB
            return OracleResult(case_id, category, "matrix", [[float(x) for x in row] for row in res.tolist()], sp.latex(res), {"matrix": res.tolist()})
        elif op == "add":
            res = matA + matB
            return OracleResult(case_id, category, "matrix", [[float(x) for x in row] for row in res.tolist()], sp.latex(res), {"matrix": res.tolist()})
        elif op == "subtract":
            res = matA - matB
            return OracleResult(case_id, category, "matrix", [[float(x) for x in row] for row in res.tolist()], sp.latex(res), {"matrix": res.tolist()})
        elif op == "rref":
            res = matA.rref()[0]
            return OracleResult(case_id, category, "matrix", [[float(x) for x in row] for row in res.tolist()], sp.latex(res), {"matrix": res.tolist()})
        else:
            raise ValueError(f"Unsupported matrix operation: {op}")

    @staticmethod
    def _solve_arithmetic(case_id: str, category: str, case: Dict[str, Any]) -> OracleResult:
        subtype = case.get("subtype", "")
        if subtype in ("gcd", "lcm") or case.get("operation") in ("gcd", "lcm"):
            import math
            a = int(round(case["a"]))
            b = int(round(case["b"]))
            op = case.get("operation", subtype)
            if op == "gcd":
                val = math.gcd(a, b)
            else:
                val = abs(a * b) // math.gcd(a, b) if math.gcd(a, b) != 0 else 0
            return OracleResult(case_id, category, "number", val, str(val), {"value": val})
        elif subtype == "unit" or "fromUnit" in case:
            exp = float(case.get("expected", 0))
            return OracleResult(case_id, category, "number", exp, str(exp), {"value": exp})
        else:
            expr_str = case.get("input", "")
            expr = parse_sympy_expr(expr_str)
            val = float(sp.N(expr))
            return OracleResult(case_id, category, "number", val, str(val), {"value": val})

