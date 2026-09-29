import { solvePolynomial } from '../../src/lib/math/solver';
import { normalizeExpression } from '../../src/lib/math/normalizer';

describe('Solver and Step Generator Fixes', () => {
  describe('1. Quadratic solver accuracy', () => {
    it('solves 2x^2 + 2x + 1 = 0', () => {
      const res = solvePolynomial('2x^2 + 2x + 1 = 0');
      expect(res.finalAnswer).toContain('\\frac{1}{2}');
    });
    it('solves -2x^2 - 2x - 1 = 0', () => {
      const res = solvePolynomial('-2x^2 - 2x - 1 = 0');
      expect(res.finalAnswer).toContain('\\frac{1}{2}');
    });
    it('solves x^2 - 5x + 6 = 0', () => {
      const res = solvePolynomial('x^2 - 5x + 6 = 0');
      expect(res.numericRoots?.sort()).toEqual([2, 3]);
    });
    it('solves x^2 + 1 = 0', () => {
      const res = solvePolynomial('x^2 + 1 = 0');
      expect(res.finalAnswer).toContain('\\pm i');
    });
    it('solves 4x^2 - 4x + 1 = 0', () => {
      const res = solvePolynomial('4x^2 - 4x + 1 = 0');
      expect(res.numericRoots).toEqual([0.5]);
    });
    it('solves x^2 = 0', () => {
      const res = solvePolynomial('x^2 = 0');
      expect(res.numericRoots).toEqual([0]);
    });
  });

  describe('2. Cubic solver accuracy', () => {
    it('solves x^3 - 6x^2 + 11x - 6 = 0', () => {
      const res = solvePolynomial('x^3 - 6x^2 + 11x - 6 = 0');
      expect(res.numericRoots?.sort()).toEqual([1, 2, 3]);
    });
    it('solves x^3 - x = 0', () => {
      const res = solvePolynomial('x^3 - x = 0');
      expect(res.numericRoots?.sort()).toEqual([-1, 0, 1]);
    });
    it('solves x^3 + 1 = 0', () => {
      const res = solvePolynomial('x^3 + 1 = 0');
      expect(res.numericRoots).toContain(-1);
    });
    it('solves 2x^3 - 3x^2 - 11x + 6 = 0', () => {
      const res = solvePolynomial('2x^3 - 3x^2 - 11x + 6 = 0');
      expect(res.numericRoots?.sort()).toEqual([-2, 0.5, 3]);
    });
  });

  describe('4. Edge cases', () => {
    it('handles leading zero 0x^2 + 3x + 1 = 0', () => {
      const res = solvePolynomial('0x^2 + 3x + 1 = 0');
      expect(res.equationType).toBe('linear');
    });
    it('handles all zeros', () => {
      const res = solvePolynomial('0x = 0');
      expect(res).toBeDefined();
    });
    it('handles very large coefficients', () => {
      const res = solvePolynomial('1000000x^2 - 1000000 = 0');
      expect(res.numericRoots?.sort()).toEqual([-1, 1]);
    });
    it('handles equation with no = 0', () => {
      const res = solvePolynomial('x^2 - 4');
      expect(res.numericRoots?.sort()).toEqual([-2, 2]);
    });
  });

  describe('5. The normalizer', () => {
    it('normalizes 2x', () => {
      expect(normalizeExpression('2x')).toContain('2*x');
    });
    it('normalizes x(x+1)', () => {
      expect(normalizeExpression('x(x+1)')).toContain('x*(x+1)');
    });
    it('normalizes sin(x) without extra asterisk', () => {
      expect(normalizeExpression('sin(x)')).not.toContain('sin*');
      expect(normalizeExpression('sin(x)')).toContain('sin(x)');
    });
    it('normalizes 3x^2', () => {
      expect(normalizeExpression('3x^2')).toContain('3*x^(2)');
    });
  });
});
