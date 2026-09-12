"""
Unit Test Suite for SymPy Math Equation Solver
Tests classification, solvers for all 9 equation families, domain restrictions,
multiplicity reporting, extraneous root detection, trig periodicity, and JSON serialization.
"""

import json
import unittest
import sympy as sp
from py_solver.sympy_solver import (
    classify_equation,
    solve_equation,
    solve_for_web,
)


class TestSympySolver(unittest.TestCase):
    # ─── CLASSIFICATION TESTS ────────────────────────────────────────────────

    def test_01_classification(self):
        """Verify correct classification of diverse equation types."""
        self.assertEqual(classify_equation("5*x - 15 = 0"), "linear")
        self.assertEqual(classify_equation("x^2 - 5*x + 6 = 0"), "quadratic")
        self.assertEqual(classify_equation("4*x^3 - 12*x^2 + 9*x - 2 = 0"), "polynomial")
        self.assertEqual(classify_equation("(x - 1)/(1 - x) = 1"), "rational")
        self.assertEqual(classify_equation("2/(3 - 2*x)^2 - x = 0"), "rational")
        self.assertEqual(classify_equation("sqrt(2*x + 3) = x - 3"), "radical")
        self.assertEqual(classify_equation("sin(x) = 0"), "trigonometric")
        self.assertEqual(classify_equation("2^x = 3^(x - 1)"), "exponential")
        self.assertEqual(classify_equation("log(x) + log(x - 3) = log(4)"), "logarithmic")
        self.assertEqual(classify_equation("x + y = 5, x - y = 1"), "system")

    # ─── LINEAR EQUATION TESTS ───────────────────────────────────────────────

    def test_02_linear_integer(self):
        """Linear equation with integer root."""
        res = solve_equation("5*x - 15 = 0")
        self.assertEqual(res["type"], "linear")
        self.assertEqual(len(res["solutions"]), 1)
        self.assertEqual(res["solutions"][0], sp.Integer(3))
        self.assertTrue(res["verified"])

    def test_03_linear_fractional(self):
        """Linear equation with fractional root."""
        res = solve_equation("3*x + 7 = 0")
        self.assertEqual(res["type"], "linear")
        self.assertEqual(len(res["solutions"]), 1)
        self.assertEqual(res["solutions"][0], sp.Rational(-7, 3))
        self.assertTrue(res["verified"])

    # ─── QUADRATIC EQUATION TESTS ────────────────────────────────────────────

    def test_04_quadratic_distinct_real(self):
        """Quadratic equation with two distinct real roots."""
        res = solve_equation("x^2 - 5*x + 6 = 0")
        self.assertEqual(res["type"], "quadratic")
        sols = set(res["solutions"])
        self.assertEqual(sols, {sp.Integer(2), sp.Integer(3)})
        self.assertTrue(res["verified"])

    def test_05_quadratic_repeated_root(self):
        """Quadratic with double root (repeated root)."""
        res = solve_equation("x^2 - 4*x + 4 = 0")
        self.assertEqual(res["type"], "quadratic")
        self.assertEqual(res["solutions"], [sp.Integer(2)])
        self.assertTrue(res["verified"])

    def test_06_quadratic_complex_roots(self):
        """Quadratic equation with complex conjugate roots."""
        res = solve_equation("x^2 + 4 = 0")
        self.assertEqual(res["type"], "quadratic")
        sols = set(res["solutions"])
        self.assertEqual(sols, {2 * sp.I, -2 * sp.I})
        self.assertTrue(res["verified"])

    # ─── POLYNOMIAL EQUATION TESTS (DEGREE 3+) ───────────────────────────────

    def test_07_cubic_with_multiplicity(self):
        """Cubic with repeated root and distinct root with multiplicities reported."""
        res = solve_equation("4*x^3 - 12*x^2 + 9*x - 2 = 0")
        self.assertEqual(res["type"], "polynomial")
        # Roots are x=2 (mult 1) and x=1/2 (mult 2)
        sols = set(res["solutions"])
        self.assertEqual(sols, {sp.Rational(1, 2), sp.Integer(2)})
        # Check that steps explain the multiplicity
        step_texts = " ".join([s["explanation"] for s in res["steps"]])
        self.assertIn("multiplicity", step_texts.lower())
        self.assertTrue(res["verified"])

    def test_08_quartic_polynomial(self):
        """Quartic polynomial factored into 4 real roots."""
        res = solve_equation("x^4 - 5*x^2 + 4 = 0")
        self.assertEqual(res["type"], "polynomial")
        sols = set(res["solutions"])
        self.assertEqual(sols, {sp.Integer(-2), sp.Integer(-1), sp.Integer(1), sp.Integer(2)})
        self.assertTrue(res["verified"])

    # ─── RATIONAL EQUATION TESTS & EXCLUDED DOMAINS ──────────────────────────

    def test_09_rational_canceled_pole(self):
        """(x - 1)/(1 - x) = 1 has no solution because x = 1 causes division by zero."""
        res = solve_equation("(x - 1)/(1 - x) = 1")
        self.assertEqual(res["type"], "rational")
        # Solution set must be empty or x=1 must be in excluded
        self.assertEqual(len(res["solutions"]), 0)
        self.assertTrue(any(sp.simplify(e - 1) == 0 for e in res["excluded"]))

    def test_10_rational_removable_singularity(self):
        """(x^2 - 1)/(x - 1) = 0 has candidate root x=1 which is excluded."""
        res = solve_equation("(x^2 - 1)/(x - 1) = 0")
        self.assertEqual(res["type"], "rational")
        self.assertNotIn(sp.Integer(1), res["solutions"])
        self.assertTrue(any(sp.simplify(e - 1) == 0 for e in res["excluded"]))

    def test_11_rational_user_equation(self):
        """User equation: 2/(3 - 2*x)^2 - x = 0 has roots x=1/2, x=2, and excludes x=3/2."""
        res = solve_equation("2/(3 - 2*x)^2 - x = 0")
        self.assertEqual(res["type"], "rational")
        sols = set(res["solutions"])
        self.assertEqual(sols, {sp.Rational(1, 2), sp.Integer(2)})
        # Pole at 3 - 2x = 0 -> x = 3/2
        self.assertTrue(any(sp.simplify(e - sp.Rational(3, 2)) == 0 for e in res["excluded"]))
        self.assertTrue(res["verified"])

    # ─── RADICAL EQUATION TESTS & EXTRANEOUS ROOTS ───────────────────────────

    def test_12_radical_with_extraneous_root(self):
        """sqrt(x + 4) = x - 2: squaring gives x^2 - 5x = 0 (x=0, x=5). x=0 is extraneous."""
        res = solve_equation("sqrt(x + 4) = x - 2")
        self.assertEqual(res["type"], "radical")
        self.assertEqual(res["solutions"], [sp.Integer(5)])
        self.assertTrue(any(sp.simplify(e - 0) == 0 for e in res["excluded"]))
        self.assertTrue(res["verified"])

    def test_13_radical_second_extraneous_case(self):
        """sqrt(2*x + 3) = x - 3: squaring gives x^2 - 8x + 6 = 0 -> root 4 - sqrt(10) is extraneous."""
        res = solve_equation("sqrt(2*x + 3) = x - 3")
        self.assertEqual(res["type"], "radical")
        valid = res["solutions"]
        self.assertEqual(len(valid), 1)
        self.assertEqual(valid[0], 4 + sp.sqrt(10))
        self.assertTrue(any(sp.simplify(e - (4 - sp.sqrt(10))) == 0 for e in res["excluded"]))
        self.assertTrue(res["verified"])

    # ─── TRIGONOMETRIC EQUATION TESTS ────────────────────────────────────────

    def test_14_trigonometric_periodic(self):
        """sin(x) = 0 has periodic roots n*pi and principal values {0, pi}."""
        res = solve_equation("sin(x) = 0")
        self.assertEqual(res["type"], "trigonometric")
        # Principal roots in [0, 2pi) should contain 0 and pi
        principal = set(res["solutions"])
        self.assertTrue({sp.Integer(0), sp.pi}.issubset(principal))
        all_text = " ".join([s["explanation"] + " " + s.get("math_ascii", "") for s in res["steps"]])
        self.assertTrue("n" in all_text or "k" in all_text or "pi" in all_text.lower())

    def test_15_trigonometric_cos_multiple_angle(self):
        """cos(2*x) = 0 has principal solutions pi/4, 3pi/4, 5pi/4, 7pi/4."""
        res = solve_equation("cos(2*x) = 0")
        self.assertEqual(res["type"], "trigonometric")
        sols = set(res["solutions"])
        expected = {sp.pi / 4, 3 * sp.pi / 4, 5 * sp.pi / 4, 7 * sp.pi / 4}
        self.assertEqual(sols, expected)

    # ─── LOGARITHMIC EQUATION TESTS ──────────────────────────────────────────

    def test_16_logarithmic_extraneous(self):
        """log(x - 1) + log(x + 1) = log(3) -> x^2 - 1 = 3 -> x=2 (valid), x=-2 (extraneous: arg < 0)."""
        res = solve_equation("log(x - 1) + log(x + 1) = log(3)")
        self.assertEqual(res["type"], "logarithmic")
        self.assertEqual(res["solutions"], [sp.Integer(2)])
        self.assertTrue(any(sp.simplify(e - (-2)) == 0 for e in res["excluded"]))
        self.assertTrue(res["verified"])

    # ─── EXPONENTIAL EQUATION TESTS ──────────────────────────────────────────

    def test_17_exponential_equation(self):
        """2^x = 8 -> x = 3; and 2^x = 3^(x - 1) has exact log solution."""
        res = solve_equation("2^x = 8")
        self.assertEqual(res["type"], "exponential")
        self.assertEqual(res["solutions"], [sp.Integer(3)])
        self.assertTrue(res["verified"])

        res2 = solve_equation("2^x = 3^(x - 1)")
        self.assertEqual(res2["type"], "exponential")
        self.assertEqual(len(res2["solutions"]), 1)
        self.assertTrue(res2["verified"])

    # ─── SYSTEM OF EQUATIONS TESTS ───────────────────────────────────────────

    def test_18_system_of_equations(self):
        """System of two linear equations: x + y = 5, x - y = 1."""
        res = solve_equation("x + y = 5, x - y = 1")
        self.assertEqual(res["type"], "system")
        sols = res["solutions"]
        self.assertEqual(len(sols), 1)
        sol_map = {k.name: v for k, v in sols[0].items()}
        self.assertEqual(sol_map.get("x"), sp.Integer(3))
        self.assertEqual(sol_map.get("y"), sp.Integer(2))

    # ─── WEB JSON ENTRY POINT TEST ───────────────────────────────────────────

    def test_19_solve_for_web_json(self):
        """solve_for_web returns valid JSON with all required keys and serializations."""
        json_str = solve_for_web("2/(3 - 2*x)^2 - x = 0")
        data = json.loads(json_str)
        self.assertTrue(data["success"])
        self.assertEqual(data["type"], "rational")
        self.assertIn("solutions", data)
        self.assertIn("excluded", data)
        self.assertIn("steps", data)
        self.assertIn("domain_notes", data)
        self.assertIn("verified", data)

        # Check solutions format
        solutions = data["solutions"]
        self.assertEqual(len(solutions), 2)
        numerics = sorted([s["numeric"] for s in solutions])
        self.assertAlmostEqual(numerics[0], 0.5)
        self.assertAlmostEqual(numerics[1], 2.0)

    # ─── REGRESSION TESTS (BUGS 1, 2, 3) ────────────────────────────────────

    def test_20_regression_ln_natural_log(self):
        """BUG 1 regression: ln(x+2) = 3 must return x = E**3 - 2 ≈ 18.0855, not base-10 log 998."""
        res = solve_equation("ln(x + 2) = 3")
        self.assertEqual(res["type"], "logarithmic")
        self.assertEqual(len(res["solutions"]), 1)
        root = res["solutions"][0]
        # Must be mathematically identical to e^3 - 2
        self.assertEqual(sp.simplify(root - (sp.E**3 - 2)), 0)
        self.assertAlmostEqual(float(root.evalf()), 18.0855369, places=4)
        # Verify by exact substitution into lhs - rhs
        sub_check = sp.simplify(sp.log(root + 2) - 3)
        self.assertEqual(sub_check, 0)
        self.assertTrue(res["verified"])

    def test_21_regression_trig_exact_pi(self):
        """BUG 2 regression: sin(x) = 1/2 must return exact solutions containing pi (pi/6, 5*pi/6), not raw decimals."""
        res = solve_equation("sin(x) = 1/2")
        self.assertEqual(res["type"], "trigonometric")
        sols = set(res["solutions"])
        # Must contain exact symbolic fractions with pi
        self.assertEqual(sols, {sp.pi / 6, 5 * sp.pi / 6})
        # Check general solutions
        gen_sols = res.get("general_solutions", [])
        self.assertTrue(any(g.has(sp.pi) for g in gen_sols))
        # Ensure solutions in steps contain pi in LaTeX
        step_maths = " ".join([s.get("math_latex", "") for s in res["steps"]])
        self.assertIn("\\pi", step_maths)
        self.assertTrue(res["verified"])

    def test_22_regression_equation_classifications(self):
        """BUG 3 regression: verify classify_equation returns the real specific type for each equation family."""
        self.assertEqual(classify_equation("sqrt(x + 4) = x - 2"), "radical")
        self.assertEqual(classify_equation("sin(x) = 1/2"), "trigonometric")
        self.assertEqual(classify_equation("2^x = 8"), "exponential")
        self.assertEqual(classify_equation("ln(x + 2) = 3"), "logarithmic")
        self.assertEqual(classify_equation("(x - 1)/(1 - x) = 1"), "rational")
        self.assertEqual(classify_equation("2*x + 4 = 10"), "linear")
        self.assertEqual(classify_equation("x^2 - 4 = 0"), "quadratic")
        self.assertEqual(classify_equation("x^3 - 6*x^2 + 11*x - 6 = 0"), "polynomial")
        self.assertEqual(classify_equation("x + y = 5, x - y = 1"), "system")


if __name__ == "__main__":
    unittest.main()
