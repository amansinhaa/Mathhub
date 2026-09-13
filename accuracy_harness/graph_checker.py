"""
Graph & Interval Accuracy Checker
Validates that plotted mathematical curves and number-line inequality intervals
match exact SymPy calculations within tolerance.
"""

from typing import Any, Dict, List, Tuple
import sympy as sp
from oracle import parse_sympy_expr

class GraphChecker:
    """Validates curve coordinate fidelity and inequality number-line endpoints."""

    @staticmethod
    def verify_curve_sampling(
        func_str: str,
        plotted_points: List[Tuple[float, float]],
        var_name: str = "x",
        tolerance: float = 0.05
    ) -> Dict[str, Any]:
        """
        Compares points plotted by the website's graphing engine against SymPy ground-truth curve.
        """
        var = sp.Symbol(var_name)
        expr = parse_sympy_expr(func_str)
        
        mismatches = []
        max_error = 0.0

        for x_val, y_plotted in plotted_points:
            try:
                y_true_sym = expr.subs(var, x_val)
                if y_true_sym.has(sp.zoo, sp.nan, sp.I):
                    continue  # undefined or complex point
                y_true = float(sp.N(y_true_sym))
                err = abs(y_true - y_plotted)
                if err > max_error:
                    max_error = err
                if err > tolerance:
                    mismatches.append({
                        "x": x_val,
                        "expected_y": round(y_true, 4),
                        "actual_y": round(y_plotted, 4),
                        "error": round(err, 4)
                    })
            except Exception as e:
                mismatches.append({
                    "x": x_val,
                    "actual_y": y_plotted,
                    "error_msg": str(e)
                })

        passed = len(mismatches) == 0
        return {
            "passed": passed,
            "total_points": len(plotted_points),
            "max_error": round(max_error, 4),
            "mismatches": mismatches,
            "reason": "All plotted points within tolerance" if passed else f"{len(mismatches)} points exceeded tolerance"
        }

    @staticmethod
    def verify_number_line_endpoints(
        expected_interval: Any,
        rendered_markers: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Verifies that number-line rendering correctly places open (hollow) vs closed (filled) circles.
        rendered_markers format: [{"value": 2.0, "is_closed": False}, ...]
        """
        if not isinstance(expected_interval, (sp.Interval, sp.Union)):
            return {"passed": True, "reason": "Non-interval target skipped"}

        expected_bounds = []
        intervals = expected_interval.args if isinstance(expected_interval, sp.Union) else [expected_interval]

        for inv in intervals:
            if isinstance(inv, sp.Interval):
                if inv.start != -sp.oo:
                    expected_bounds.append({
                        "value": float(sp.N(inv.start)),
                        "is_closed": not inv.left_open
                    })
                if inv.end != sp.oo:
                    expected_bounds.append({
                        "value": float(sp.N(inv.end)),
                        "is_closed": not inv.right_open
                    })

        # Match rendered markers
        if len(expected_bounds) != len(rendered_markers):
            return {
                "passed": False,
                "reason": f"Endpoint count mismatch: expected {len(expected_bounds)} endpoints, found {len(rendered_markers)} in UI"
            }

        for exp in expected_bounds:
            match = None
            for rend in rendered_markers:
                if abs(rend["value"] - exp["value"]) < 1e-3:
                    match = rend
                    break
            if not match:
                return {
                    "passed": False,
                    "reason": f"Expected endpoint at {exp['value']} was not rendered"
                }
            if match["is_closed"] != exp["is_closed"]:
                state_exp = "closed (filled)" if exp["is_closed"] else "open (hollow)"
                state_act = "closed (filled)" if match["is_closed"] else "open (hollow)"
                return {
                    "passed": False,
                    "reason": f"Endpoint at {exp['value']} has wrong boundary style: expected {state_exp}, rendered {state_act}"
                }

        return {
            "passed": True,
            "reason": "All number-line endpoints and open/closed circle styles verified"
        }
