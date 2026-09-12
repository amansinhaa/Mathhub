import { solvePolynomial } from '@/lib/math/solver';
import { isRationalExpression, trySimplifyRationalExpression, trySolveRationalEquation } from '@/lib/math/rationalSolver';

describe('Rational Expression & Equation Solver', () => {
  describe('isRationalExpression detection', () => {
    it('detects rational division with ÷', () => {
      expect(isRationalExpression('(x^(2)-36)/(x)÷(x^(3)-6x^(2))/(x^(2)-x)')).toBe(true);
    });

    it('detects rational fraction with /', () => {
      expect(isRationalExpression('(x^2 - 9)/(x^2 + 5*x + 6)')).toBe(true);
    });

    it('does not classify standard polynomials as rational expressions', () => {
      expect(isRationalExpression('x^2 - 5*x + 6')).toBe(false);
      expect(isRationalExpression('2*x + 3')).toBe(false);
    });

    it('does not classify transcendental expressions as rational expressions', () => {
      expect(isRationalExpression('sin(x) / cos(x)')).toBe(false);
    });
  });

  describe('User problem: (x^(2)-36)/(x)÷(x^(3)-6x^(2))/(x^(2)-x)', () => {
    it('simplifies division of rational expressions step-by-step', () => {
      const input = '(x^(2)-36)/(x)÷(x^(3)-6x^(2))/(x^(2)-x)';
      const result = solvePolynomial(input);

      expect(result).toBeDefined();
      expect(['polynomial', 'rational']).toContain(result.type);
      expect(result.steps.length).toBeGreaterThanOrEqual(4);

      // Verify reciprocal multiplication step exists
      const step1 = result.steps.find((s) => s.explanation.includes('reciprocal'));
      expect(step1).toBeDefined();

      // Verify factoring step exists
      const step2 = result.steps.find((s) => s.explanation.includes('Factor'));
      expect(step2).toBeDefined();

      // Verify common factor cancellation exists
      const stepCancel = result.steps.find((s) => s.explanation.includes('cancel') || s.explanation.includes('gcd'));
      expect(stepCancel).toBeDefined();

      // Verify domain restrictions (0, 1, 6)
      const stepRestr = result.steps.find((s) => s.explanation.includes('restriction') || s.explanation.includes('undefined'));
      expect(stepRestr).toBeDefined();
      expect(stepRestr?.math).toContain('0');
      expect(stepRestr?.math).toContain('1');
      expect(stepRestr?.math).toContain('6');

      // Final answer should contain (x-1)(x+6) / x^2 or (x+6)(x-1)/x^2
      expect(result.finalAnswer).toContain('x^{2}');
      expect(result.finalAnswer).toContain('x-1');
      expect(result.finalAnswer).toContain('x+6');
    });

    it('handles parenthesized slash division ((x^2-36)/x) / ((x^3-6x^2)/(x^2-x)) identically', () => {
      const input = '((x^2-36)/x) / ((x^3-6*x^2)/(x^2-x))';
      const result = solvePolynomial(input);

      expect(result).toBeDefined();
      expect(result.finalAnswer).toContain('x^{2}');
      expect(result.finalAnswer).toContain('x-1');
      expect(result.finalAnswer).toContain('x+6');
    });
  });

  describe('Single rational fraction simplification', () => {
    it('simplifies (x^2 - 9)/(x^2 + 5x + 6) to (x - 3)/(x + 2)', () => {
      const result = solvePolynomial('(x^2 - 9)/(x^2 + 5*x + 6)');
      expect(result).toBeDefined();
      expect(result.finalAnswer).toBe('\\frac{x-3}{x+2}');
    });

    it('simplifies (2x + 4)/(x^2 - 4) to 2/(x - 2)', () => {
      const result = solvePolynomial('(2*x + 4)/(x^2 - 4)');
      expect(result).toBeDefined();
      expect(result.finalAnswer).toBe('\\frac{2}{x-2}');
    });

    it('simplifies (x^2 - 25)/(x + 5) to x - 5', () => {
      const result = solvePolynomial('(x^2 - 25)/(x + 5)');
      expect(result).toBeDefined();
      expect(result.finalAnswer).toBe('x-5');
    });
  });

  describe('Rational equations with =', () => {
    it('solves (x^2 - 36)/x = 0 to x = -6, 6', () => {
      const result = solvePolynomial('(x^2 - 36)/x = 0');
      expect(result).toBeDefined();
      expect(result.finalAnswer).toContain('x = -6');
      expect(result.finalAnswer).toContain('x = 6');
    });

    it('detects extraneous roots in (x^2 - 4)/(x - 2) = 0', () => {
      const result = solvePolynomial('(x^2 - 4)/(x - 2) = 0');
      expect(result).toBeDefined();
      // x = 2 is extraneous, only x = -2 is valid
      expect(result.finalAnswer).toBe('x = -2');
      const stepExtr = result.steps.find((s) => s.explanation.includes('Extraneous') || s.explanation.includes('extraneous'));
      expect(stepExtr).toBeDefined();
    });

    it('solves user rational equation 3/(x-2) + 2/(x+1) = 7/(x^2-x-2) with LCD and clear steps', () => {
      const result = solvePolynomial('3/(x-2) + 2/(x+1) = 7/(x^2-x-2)');
      expect(result).toBeDefined();
      expect(result.finalAnswer).toContain('\\frac{8}{5}');
      expect(result.steps.length).toBeGreaterThanOrEqual(4);

      // Verify domain restrictions step mentions -1 and 2
      const stepRestr = result.steps.find((s) => s.explanation.includes('restriction') || s.explanation.includes('excluded'));
      expect(stepRestr).toBeDefined();
      expect(stepRestr?.math).toContain('-1');
      expect(stepRestr?.math).toContain('2');

      // Verify LCD multiplication step
      const stepLCD = result.steps.find((s) => s.explanation.includes('LCD') || s.explanation.includes('Least Common Denominator'));
      expect(stepLCD).toBeDefined();

      // Verify expand / simplify step with 5x - 8 = 0
      const stepExpand = result.steps.find((s) => s.explanation.includes('Expand') || s.explanation.includes('collect'));
      expect(stepExpand).toBeDefined();
      expect(stepExpand?.math).toContain('5x - 8 = 0');

      // Verify linear solve step
      const stepIsolate = result.steps.find((s) => s.explanation.includes('isolating') || s.explanation.includes('Isolate') || s.explanation.includes('Solve for the variable'));
      expect(stepIsolate).toBeDefined();
      expect(stepIsolate?.math).toContain('x = \\frac{8}{5}');
    });

    it('solves (x - 1)/(1 - x) = 1 and detects no solution / extraneous root', () => {
      const result = solvePolynomial('(x - 1)/(1 - x) = 1');
      expect(result).toBeDefined();
      expect(result.finalAnswer).toContain('No real solution');
      expect(result.finalAnswer).toContain('x = 1');
      expect(result.numericRoots).toEqual([]);
      expect(result.steps.length).toBeGreaterThanOrEqual(5);

      const stepExtr = result.steps.find((s) => s.explanation.includes('Extraneous') || s.explanation.includes('extraneous'));
      expect(stepExtr).toBeDefined();
      expect(stepExtr?.math).toContain('x = 1');
    });
  });
});
