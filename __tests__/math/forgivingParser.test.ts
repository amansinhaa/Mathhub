import {
  normalizeExpression,
  autoBalanceParens,
  autoInterpretEquals,
} from '@/lib/math/normalizer';
import { solvePolynomial, solveInequality } from '@/lib/math/solver';

describe('Resilient Math Parser & Wolfram UX Enhancements', () => {
  describe('Forgiving Parser & Normalization', () => {
    it('handles implicit multiplication with parentheses and digits', () => {
      expect(normalizeExpression('4t')).toBe('4*t');
      expect(normalizeExpression('(t-1)(t+2)')).toBe('(t-1)*(t+2)');
      expect(normalizeExpression('x(x+1)')).toBe('x*(x+1)');
      expect(normalizeExpression('2(x+3)')).toBe('2*(x+3)');
      expect(normalizeExpression('(x+1)2')).toBe('(x+1)*2');
    });

    it('preserves trigonometric and mathematical functions without false multiplication', () => {
      expect(normalizeExpression('sin(x)')).toBe('sin(x)');
      expect(normalizeExpression('cos(x)')).toBe('cos(x)');
      expect(normalizeExpression('exp(x)')).toBe('exp(x)');
      expect(normalizeExpression('sqrt(x)')).toBe('sqrt(x)');
    });

    it('auto-balances missing parentheses', () => {
      expect(autoBalanceParens('((x + 1) * (x - 2)')).toBe('((x + 1) * (x - 2))');
      expect(autoBalanceParens('72t^3 + 4t - (76')).toBe('72t^3 + 4t - (76)');
      expect(autoBalanceParens('x + 1)')).toBe('(x + 1)');
    });

    it('auto-interprets expressions missing equals sign as = 0', () => {
      const res = autoInterpretEquals('18t^3 + t - 19');
      expect(res.interpreted).toBe(true);
      expect(res.expr).toBe('18t^3 + t - 19 = 0');

      const alreadyHasEquals = autoInterpretEquals('x^2 - 5x + 6 = 0');
      expect(alreadyHasEquals.interpreted).toBe(false);
      expect(alreadyHasEquals.expr).toBe('x^2 - 5x + 6 = 0');
    });
  });

  describe('Input Interpretation & Solver Output', () => {
    it('generates an input interpretation pod for cubic polynomials', () => {
      const result = solvePolynomial('72t^3 + 4t - 76 = 0');
      expect(result.inputInterpretation).toBeDefined();
      expect(result.inputInterpretation).toContain('Solve');
      expect(result.inputInterpretation).toContain('72t^{3} + 4t - 76 = 0');
      expect(result.inputInterpretation).toContain('for variable');
    });

    it('auto-solves polynomials even when entered without = 0', () => {
      const result = solvePolynomial('18t^3 + t - 19');
      expect(result.inputInterpretation).toContain('Interpreted as');
      expect(result.finalAnswer).toBeDefined();
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it('generates input interpretation for inequalities', () => {
      const result = solveInequality('2x - 4 > 0');
      expect(result.inputInterpretation).toBeDefined();
      expect(result.inputInterpretation).toContain('2x - 4 > 0');
      expect(result.finalAnswer).toContain('x > 2');
    });
  });
});
