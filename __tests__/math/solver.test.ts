import { solvePolynomial, solveSystem, solveInequality, solveSymbolic } from '@/lib/math/solver';

describe('MathHub Equation Solver — Accuracy Audit', () => {
  // ─── Linear Equations ───────────────────────────────────────────────────
  describe('Linear equations', () => {
    it('solves 2x + 6 = 0 → x = -3', () => {
      const res = solvePolynomial('2x + 6 = 0');
      expect(res.type).toBe('polynomial');
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
  });

  // ─── Quadratic Equations ────────────────────────────────────────────────
  describe('Quadratic equations', () => {
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

    it('solves x^2 + 4 = 0 using quadratic formula fallback (complex roots)', () => {
      const res = solvePolynomial('x^2 + 4 = 0');
      expect(res.finalAnswer).toContain('2\\,i');
      // Should have merged discriminant step
      const discStep = res.steps.find((s) => s.explanation.includes('discriminant'));
      expect(discStep).toBeDefined();
      expect(discStep?.explanation).toContain('complex conjugate');
      // Should have verification
      const verifyStep = res.steps.find((s) => s.explanation.includes('Verification'));
      expect(verifyStep).toBeDefined();
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

  // ─── Cubic Equations ────────────────────────────────────────────────────
  describe('Cubic equations', () => {
    it('solves 72t^3 + 4t - 76 = 0 — verifies t = 1 is found and all intermediate steps are present', () => {
      const res = solvePolynomial('72t^3 + 4t - 76 = 0');
      expect(res.type).toBe('polynomial');
      expect(res.steps.length).toBeGreaterThanOrEqual(8);
      // Step 1: Standard form
      expect(res.steps[0].math).toContain('72t^3 + 4t - 76 = 0');
      // Step 2: Rational root test
      expect(res.steps[1].math).toContain('f(1)');
      expect(res.steps[1].math).toContain('72(1)^3 + 4(1) - 76 = 72 + 4 - 76 = 0');
      // Step 3: Synthetic division
      expect(res.steps[2].explanation).toContain('synthetic division');
      expect(res.steps[2].math).toContain('array');
      expect(res.steps[2].math).toContain('72t^2 + 72t + 76');
      // Step 4: Factored form with GCD
      expect(res.steps[3].math).toContain('4(t - 1)(18t^2 + 18t + 19) = 0');
      // Step 5: Divide by GCD (constant factor)
      expect(res.steps[4].explanation).toContain('Divide both sides by $4$');
      expect(res.steps[4].math).toContain('18t^2 + 18t + 19 = 0');
      // Step 6: Discriminant
      expect(res.steps[5].math).toContain('\\Delta');
      expect(res.steps[5].math).toContain('-1044');
      // Step 7: Quadratic formula substitution
      expect(res.steps[6].math).toContain('\\frac{-18 \\pm \\sqrt{1044}\\,i}{36}');
      expect(res.steps[6].math).toContain('-0.5 \\pm 0.897527\\,i');
      // Step 8: Complex roots
      expect(res.steps[7].math).toContain('t_2 = -0.5 + 0.897527\\,i, \\quad t_3 = -0.5 - 0.897527\\,i');
      // Step 9: Final summary
      expect(res.steps[8].math).toContain('t_1 = 1, \\quad t_{2,3} = -0.5 \\pm 0.897527\\,i');
      expect(res.finalAnswer).toMatch(/t_1\s*=\s*1(?:\.0+)?(?:\s|,|$)/);
    });

    it('solves 72t^3 + 4t - 76 (no = 0, implicit)', () => {
      const res = solvePolynomial('72t^3 + 4t - 76');
      expect(res.finalAnswer).toMatch(/t_1\s*=\s*1/);
    });

    it('solves t^3 - 6t^2 + 11t - 6 = 0 → t = 1, 2, 3', () => {
      const res = solvePolynomial('t^3 - 6t^2 + 11t - 6 = 0');
      expect(res.finalAnswer).toContain('1');
      expect(res.finalAnswer).toContain('2');
      expect(res.finalAnswer).toContain('3');
    });

    it('solves x^3 - 1 = 0 → x = 1 (one real root)', () => {
      const res = solvePolynomial('x^3 - 1 = 0');
      expect(res.finalAnswer).toMatch(/x_1\s*=\s*1/);
    });

    it('solves x^3 + 6x^2 + 11x + 6 = 0 → x = -1, -2, -3', () => {
      const res = solvePolynomial('x^3 + 6x^2 + 11x + 6 = 0');
      expect(res.finalAnswer).toContain('-1');
      expect(res.finalAnswer).toContain('-2');
      expect(res.finalAnswer).toContain('-3');
    });

    it('solves x^3 - 4x^2 + 5x - 2 = 0 → x = 1 (repeated), 2', () => {
      const res = solvePolynomial('x^3 - 4x^2 + 5x - 2 = 0');
      expect(res.finalAnswer).toContain('1');
      expect(res.finalAnswer).toContain('2');
    });

    it('verifies synthetic division: (t-1)(72t^2+72t+76) = 72t^3+4t-76', () => {
      // Synthetic division of 72t^3 + 0t^2 + 4t - 76 by (t - 1)
      const a = 72, b = 0, c = 4, d = -76, r0 = 1;
      const qA = a;           // 72
      const qB = b + a * r0;  // 72
      const qC = c + qB * r0; // 76
      // Verify: (t-1)(72t^2+72t+76) at t=2 should equal 72*8+4*2-76 = 508
      expect((2 - r0) * (qA * 4 + qB * 2 + qC)).toBe(72 * 8 + 4 * 2 - 76);
      // At t=3
      expect((3 - r0) * (qA * 9 + qB * 3 + qC)).toBe(72 * 27 + 4 * 3 - 76);
    });
  });

  // ─── System of Equations ────────────────────────────────────────────────
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

  // ─── Inequalities ──────────────────────────────────────────────────────
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

  // ─── Symbolic Solver ───────────────────────────────────────────────────
  describe('Symbolic solver', () => {
    it('solves v = u + a*t for t', () => {
      const res = solveSymbolic('v = u + a*t', 't');
      expect(res.type).toBe('symbolic');
      // Should contain some form of t = (v-u)/a
      expect(res.finalAnswer).toContain('t');
    });
  });
});
