import { solvePolynomial, solveSystem, solveInequality, solveSymbolic } from '@/lib/math/solver';
import { expressionToLatex, quickDegreeDetect } from '@/lib/math/normalizer';

describe('MathHub Equation Solver — Accuracy & Transparency Audit', () => {
  // ─── Linear Equations (Degree 1) ─────────────────────────────────────────
  describe('Degree 1 (Linear): ax + b = 0', () => {
    it('solves 2x + 6 = 0 → x = -3 with step-by-step rearrangement', () => {
      const res = solvePolynomial('2x + 6 = 0');
      expect(res.type).toBe('polynomial');
      expect(res.steps[0].math).toContain('2x + 6 = 0');
      expect(res.steps[1].math).toContain('2x = -6');
      expect(res.steps[2].math).toContain('x = \\frac{-6}{2} = -3');
      expect(res.finalAnswer).toContain('-3');
    });

    it('solves 5t - 15 = 0 → t = 3 (custom variable)', () => {
      const res = solvePolynomial('5t - 15 = 0');
      expect(res.finalAnswer).toContain('3');
    });

    it('solves 3y + 9 → y = -3 (no = sign, implicit = 0)', () => {
      const res = solvePolynomial('3y + 9');
      expect(res.finalAnswer).toContain('-3');
    });

    it('solves user quartic: 2 x^4 - 9 x^3 + 14 x^2 - 9 x + 2 = 0', () => {
      const res = solvePolynomial('2  x^4  -  9  x^3  +  14  x^2  -  9  x  +  2  =0');
      console.log('USER QUARTIC WITH DOUBLE SPACES RESULT:', JSON.stringify(res, null, 2));
      expect(res.finalAnswer).not.toContain('No solution found');
    });
  });

  // ─── Quadratic Equations (Degree 2) ──────────────────────────────────────
  describe('Degree 2 (Quadratic): ax^2 + bx + c = 0', () => {
    it('solves x^2 - 5x + 6 = 0 using integer factoring with verification', () => {
      const res = solvePolynomial('x^2 - 5x + 6 = 0');
      expect(res.type).toBe('polynomial');
      // Must use factoring explanation
      const factoringStep = res.steps.find((s) => s.explanation.includes('multiply to'));
      expect(factoringStep).toBeDefined();
      expect(factoringStep?.math).toContain('(-2) \\times (-3) = 6');

      // Factored form step
      const formStep = res.steps.find((s) => s.explanation.includes('factored form'));
      expect(formStep?.math).toContain('(x - 2)(x - 3) = 0');

      // Verification step
      const verifyStep = res.steps.find((s) => s.explanation.includes('Verify'));
      expect(verifyStep).toBeDefined();
      expect(verifyStep?.math).toContain('\\text{Check } x = 2');
      expect(verifyStep?.math).toContain('\\text{Check } x = 3');

      expect(res.finalAnswer).toContain('2');
      expect(res.finalAnswer).toContain('3');
    });

    it('solves 2x^2 + 5x + 3 = 0 using AC factoring method', () => {
      const res = solvePolynomial('2x^2 + 5x + 3 = 0');
      expect(res.type).toBe('polynomial');
      const acStep = res.steps.find((s) => s.explanation.includes('ac'));
      expect(acStep).toBeDefined();
      expect(res.finalAnswer).toContain('-1');
    });

    it('solves x^2 + x + 1 = 0 using quadratic formula (complex roots & discriminant note)', () => {
      const res = solvePolynomial('x^2 + x + 1 = 0');
      expect(res.type).toBe('polynomial');
      // Must include discriminant explanation with definition note
      const discStep = res.steps.find((s) => s.explanation.includes('discriminant'));
      expect(discStep).toBeDefined();
      expect(discStep?.explanation).toContain('tells us how many real roots exist');
      expect(discStep?.explanation).toContain('complex conjugate');
      expect(discStep?.math).toContain('\\Delta = (1)^2 - 4(1)(1) = 1 - (4) = -3');

      // Quadratic formula application
      const formulaStep = res.steps.find((s) => s.explanation.includes('quadratic formula'));
      expect(formulaStep).toBeDefined();

      // Complex roots formatted as p ± qi
      expect(res.finalAnswer).toContain('-0.5 \\pm 0.866025\\,i');
    });

    it('solves x^2 + 4 = 0 using quadratic formula fallback (pure imaginary roots)', () => {
      const res = solvePolynomial('x^2 + 4 = 0');
      expect(res.finalAnswer).toContain('2\\,i');
      const discStep = res.steps.find((s) => s.explanation.includes('discriminant'));
      expect(discStep).toBeDefined();
      expect(discStep?.explanation).toContain('tells us how many real roots exist');
    });

    it('solves x^2 - 2 = 0 using quadratic formula fallback (irrational roots)', () => {
      const res = solvePolynomial('x^2 - 2 = 0');
      const formulaStep = res.steps.find((s) => s.explanation.includes('quadratic formula'));
      expect(formulaStep).toBeDefined();
      expect(res.finalAnswer).toContain('1.4142');
      expect(res.finalAnswer).toContain('-1.4142');
    });

    it('solves x^2 - 2x + 1 = 0 as perfect square trinomial (repeated root)', () => {
      const res = solvePolynomial('x^2 - 2x + 1 = 0');
      const formStep = res.steps.find((s) => s.explanation.includes('factored form'));
      expect(formStep?.math).toContain('(x - 1)^2 = 0');
      expect(res.finalAnswer).toBe('x = 1');
    });
  });

  // ─── Cubic Equations (Degree 3) ──────────────────────────────────────────
  describe('Degree 3 (Cubic): ax^3 + bx^2 + cx + d = 0', () => {
    it('solves x^3 - 6x^2 + 11x - 6 = 0 with rational root testing, synthetic division, and roots 1, 2, 3', () => {
      const res = solvePolynomial('x^3 - 6x^2 + 11x - 6 = 0');
      expect(res.type).toBe('polynomial');

      // Rational root theorem explanation and testing trail
      const rrtStep = res.steps.find((s) => s.explanation.includes('Rational Root Theorem'));
      expect(rrtStep).toBeDefined();
      expect(rrtStep?.explanation).toContain('a way to test for simple fraction/whole-number roots before trying harder methods');
      expect(rrtStep?.math).toContain('f(1)');

      // Synthetic division step
      const divStep = res.steps.find((s) => s.explanation.includes('synthetic division'));
      expect(divStep).toBeDefined();
      expect(divStep?.math).toContain('x^2 - 5x + 6');

      // Final roots 1, 2, 3
      expect(res.finalAnswer).toContain('1');
      expect(res.finalAnswer).toContain('2');
      expect(res.finalAnswer).toContain('3');
    });

    it('solves x^3 - 2x^2 - x + 2 = 0 — renders both Long Division (NCERT) and Synthetic Division arriving at quotient x^2 - x - 2', () => {
      const res = solvePolynomial('x^3 - 2x^2 - x + 2 = 0');
      expect(res.type).toBe('polynomial');

      // Find division step
      const divStep = res.steps.find((s) => s.divisionDetails !== undefined);
      expect(divStep).toBeDefined();
      expect(divStep?.divisionDetails).toBeDefined();

      const details = divStep!.divisionDetails!;
      expect(details.dividendMath).toContain('x^3 - 2x^2 - x + 2');
      expect(details.divisorMath).toContain('x - 1');
      expect(details.quotientMath).toContain('x^2 - x - 2');
      expect(details.remainderMath).toBe('0');

      // Long Division Math checks (NCERT format)
      expect(details.longDivisionMath).toContain('\\begin{array}{r}');
      expect(details.longDivisionMath).toContain('x^2 - x - 2');
      expect(details.longDivisionMath).toContain('x - 1');
      expect(details.longDivisionMath).toContain('x^3 - 2x^2 - x + 2');
      expect(details.longDivisionMath).toContain('\\underline{-(x^3 - x^2)');
      expect(details.longDivisionMath).toContain('-x^2 - x');
      expect(details.longDivisionMath).toContain('\\underline{-(-x^2 + x)');
      expect(details.longDivisionMath).toContain('-2x + 2');
      expect(details.longDivisionMath).toContain('\\underline{-(-2x + 2)');

      // Synthetic Division Math checks
      expect(details.syntheticMath).toContain('\\begin{array}{c|rrrr}');
      expect(details.syntheticMath).toContain('1 & -2 & -1 & 2');
      expect(details.syntheticMath).toContain('1 & -1 & -2 & 0');

      // Final roots: -1, 1, 2
      expect(res.finalAnswer).toContain('-1');
      expect(res.finalAnswer).toContain('1');
      expect(res.finalAnswer).toContain('2');
    });

    it('solves 72t^3 + 4t - 76 = 0 — verifies candidate test, synthetic division, and complex roots', () => {
      const res = solvePolynomial('72t^3 + 4t - 76 = 0');
      expect(res.type).toBe('polynomial');
      expect(res.steps.length).toBeGreaterThanOrEqual(7);

      // Step 1: Standard form
      expect(res.steps[0].math).toContain('72t^3 + 4t - 76 = 0');

      // Rational Root Theorem step
      const rrtStep = res.steps.find((s) => s.explanation.includes('Rational Root Theorem'));
      expect(rrtStep).toBeDefined();
      expect(rrtStep?.math).toContain('f(1)');

      // Synthetic division
      const divStep = res.steps.find((s) => s.explanation.includes('synthetic division'));
      expect(divStep).toBeDefined();
      expect(divStep?.math).toContain('72t^2 + 72t + 76');

      // Roots check
      expect(res.finalAnswer).toMatch(/t\s*=\s*1/);
      expect(res.finalAnswer).toContain('i');
    });

    it('solves x^3 + x + 1 = 0 (no rational root) with transparent numerical fallback and NO raw Cardano formulas', () => {
      const res = solvePolynomial('x^3 + x + 1 = 0');
      expect(res.type).toBe('polynomial');

      // Must state that candidates were tested and no rational roots found
      const rrtStep = res.steps.find((s) => s.explanation.includes('Rational Root Theorem'));
      expect(rrtStep).toBeDefined();
      expect(rrtStep?.explanation).toContain('No simple rational root found');

      // Solved numerically
      const numStep = res.steps.find((s) => s.explanation.includes('Solved numerically'));
      expect(numStep).toBeDefined();

      // Must NEVER contain Cardano raw parameter equations in the steps
      res.steps.forEach((s) => {
        expect(s.explanation).not.toContain('Cardano');
        expect(s.math).not.toContain('\\Delta_C');
        expect(s.math).not.toContain('depressed cubic');
      });

      // Valid real root approx -0.682328 and complex conjugate pair
      expect(res.finalAnswer).toContain('-0.682328');
      expect(res.finalAnswer).toContain('0.341164 \\pm 1.161541\\,i');
    });
  });

  // ─── Quartic Equations (Degree 4) ─────────────────────────────────────────
  describe('Degree 4 (Quartic): ax^4 + bx^3 + cx^2 + dx + e = 0', () => {
    it('solves bi-quadratic x^4 - 5x^2 + 4 = 0 using substitution u = x^2', () => {
      const res = solvePolynomial('x^4 - 5x^2 + 4 = 0');
      expect(res.type).toBe('polynomial');

      const substStep = res.steps.find((s) => s.explanation.includes('u = x^2'));
      expect(substStep).toBeDefined();

      // Roots: ±1, ±2
      expect(res.finalAnswer).toContain('1');
      expect(res.finalAnswer).toContain('-1');
      expect(res.finalAnswer).toContain('2');
      expect(res.finalAnswer).toContain('-2');
    });

    it('solves x^4 - 1 = 0 → roots 1, -1, ±i', () => {
      const res = solvePolynomial('x^4 - 1 = 0');
      expect(res.finalAnswer).toContain('1');
      expect(res.finalAnswer).toContain('-1');
      expect(res.finalAnswer).toContain('i');
    });

    it('solves 2x^4 - 9x^3 + 14x^2 - 9x + 2 = 0 with Factored Form and Zero Factor Principle sub-steps', () => {
      const res = solvePolynomial('2x^4 - 9x^3 + 14x^2 - 9x + 2 = 0');
      expect(res.type).toBe('polynomial');

      // Check for factored form / Zero Factor Principle step
      const zfpStep = res.steps.find((s) => s.explanation.includes('Zero Factor Principle'));
      expect(zfpStep).toBeDefined();
      expect(zfpStep?.subSteps).toBeDefined();
      expect(zfpStep?.subSteps!.length).toBeGreaterThanOrEqual(3);

      // Verify sub-steps solve each factor
      const subStepMath = zfpStep!.subSteps!.map((s) => s.math).join(' ');
      expect(subStepMath).toContain('x = 1');
      expect(subStepMath).toContain('x = 2');
      expect(subStepMath).toContain('\\frac{1}{2}');

      // Final answer shows fractional exact roots and provides decimalAnswer
      expect(res.finalAnswer).toContain('\\frac{1}{2}');
      expect(res.decimalAnswer).toContain('0.5');
    });
  });

  // ─── Higher Order Polynomials (Degree 5+) ────────────────────────────────
  describe('Degree 5+ (Abel–Ruffini Theorem): ax^n + ... = 0', () => {
    it('solves x^5 - x - 1 = 0 numerically and displays the Abel–Ruffini info note', () => {
      const res = solvePolynomial('x^5 - x - 1 = 0');
      expect(res.type).toBe('polynomial');

      // Abel-Ruffini note must be present
      const abelStep = res.steps.find((s) => s.explanation.includes('Abel–Ruffini'));
      expect(abelStep).toBeDefined();
      expect(abelStep?.explanation).toContain('Degree 5+ polynomials have no general algebraic solution (Abel–Ruffini theorem) — roots shown are computed numerically');
      expect(abelStep?.math).toContain('Abel–Ruffini');

      // Real root ~1.167304 and 2 pairs of complex conjugate roots
      expect(res.finalAnswer).toContain('1.167304');
      expect(res.finalAnswer).toContain('i');
    });
  });

  // ─── Systems of Linear Equations ─────────────────────────────────────────
  describe('System of linear equations', () => {
    it('solves 2x2: x + y = 5, x - y = 1 → x=3, y=2', () => {
      const res = solveSystem(['x + y = 5', 'x - y = 1'], ['x', 'y']);
      expect(res.type).toBe('system');
      expect(res.finalAnswer).toContain('3');
      expect(res.finalAnswer).toContain('2');
    });

    it('solves 2x2: 2x + 3y = 12, x - y = 1 → x=3, y=2', () => {
      const res = solveSystem(['2x + 3y = 12', 'x - y = 1'], ['x', 'y']);
      expect(res.finalAnswer).toContain('3');
      expect(res.finalAnswer).toContain('2');
    });
  });

  // ─── Inequalities ────────────────────────────────────────────────────────
  describe('Inequalities', () => {
    it('solves 2x - 4 > 0 → x > 2', () => {
      const res = solveInequality('2x - 4 > 0');
      expect(res.type).toBe('inequality');
      expect(res.finalAnswer).toContain('x > 2');
    });

    it('solves -3x + 9 > 0 → x < 3 (flips sign)', () => {
      const res = solveInequality('-3x + 9 > 0');
      expect(res.finalAnswer).toContain('x < 3');
    });
  });

  // ─── Symbolic Solver ─────────────────────────────────────────────────────
  describe('Symbolic solver', () => {
    it('solves v = u + a*t for t', () => {
      const res = solveSymbolic('v = u + a*t', 't');
      expect(res.type).toBe('symbolic');
      expect(res.finalAnswer).toContain('t');
    });
  });

  // ─── Radical Expressions Simplification ──────────────────────────────────
  describe('Radical Expression Simplification', () => {
    it('simplifies sqrt(9x^(7)y^(-2))*\\sqrt(12x^(2)y^(12)) to 6x^{4}y^{5}\\sqrt{3x} with clear steps', () => {
      const input = 'sqrt(9x^(7)y^(-2))*\\sqrt(12x^(2)y^(12))';

      // Question preview formatting
      const preview = expressionToLatex(input);
      expect(preview).toBe('\\sqrt{9x^{7}y^{-2}} \\cdot \\sqrt{12x^{2}y^{12}}');

      // Badge detection
      const badge = quickDegreeDetect(input);
      expect(badge?.label).toBe('Radical Expression');

      // Solver output
      const res = solvePolynomial(input);
      expect(res.finalAnswer).toBe('6x^{4}y^{5}\\sqrt{3x}');
      expect(res.steps.length).toBeGreaterThanOrEqual(3);
      expect(res.steps[0].explanation).toContain('product rule');
    });

    it('simplifies sqrt(50) to 5\\sqrt{2}', () => {
      const res = solvePolynomial('sqrt(50)');
      expect(res.finalAnswer).toBe('5\\sqrt{2}');
    });

    it('simplifies sqrt(18) * sqrt(2) to 6', () => {
      const res = solvePolynomial('sqrt(18) * sqrt(2)');
      expect(res.finalAnswer).toBe('6');
    });

    it('simplifies sqrt(8x^3) to 2x\\sqrt{2x}', () => {
      const res = solvePolynomial('sqrt(8x^3)');
      expect(res.finalAnswer).toBe('2x\\sqrt{2x}');
    });
  });

  // ─── Algebraic Expressions Simplification (Combining Like Terms) ────────
  describe('Algebraic Expression Simplification (Combining Like Terms)', () => {
    it('simplifies -26r+(+7r)+(-15p)+(-7p) to -19r - 22p with step-by-step grouping', () => {
      const input = '-26r+(+7r)+(-15p)+(-7p)';
      const res = solvePolynomial(input);

      expect(res.finalAnswer).toBe('-19r - 22p');
      expect(res.steps.length).toBeGreaterThanOrEqual(4);

      // Step 1: Parentheses removal
      expect(res.steps[0].explanation).toContain('Remove parentheses');
      expect(res.steps[0].math).toContain('-26r + 7r - 15p - 7p');

      // Step 2: Grouping like terms
      expect(res.steps[1].explanation).toContain('Group like terms');
      expect(res.steps[1].math).toContain('r');
      expect(res.steps[1].math).toContain('p');

      // Step 3 & 4: Combining coefficients
      const rStep = res.steps.find(s => s.explanation.includes('$r$'));
      const pStep = res.steps.find(s => s.explanation.includes('$p$'));
      expect(rStep?.math).toContain('-19r');
      expect(pStep?.math).toContain('-22p');
    });

    it('simplifies 3x + 5y - 2x + 4y to x + 9y', () => {
      const res = solvePolynomial('3x + 5y - 2x + 4y');
      expect(['x + 9y', '9y + x']).toContain(res.finalAnswer);
    });

    it('simplifies 2*(x + 3) + 4*(x - 1) with distribution', () => {
      const res = solvePolynomial('2*(x + 3) + 4*(x - 1)');
      expect(res.finalAnswer).toBe('6x + 2');
      expect(res.steps.some(s => s.explanation.includes('distribute'))).toBe(true);
    });
  });
});
