import { solveDerivative, solveIntegral } from '@/lib/math/calculusSolver';

describe('Calculus Solver', () => {
  describe('solveDerivative', () => {
    it('differentiates polynomials term-by-term with Power Rule', () => {
      const res = solveDerivative('3x^2 + 5x - 4');
      expect(res.type).toBe('derivative');
      expect(res.finalAnswer).toContain("f'(x)");
      expect(res.finalAnswer).toContain('6');
      expect(res.steps.length).toBeGreaterThan(2);
      expect(res.steps.some((s) => s.formulaUsed?.name === 'Sum & Difference Rule')).toBe(true);
      expect(res.steps.some((s) => s.formulaUsed?.name === 'Power Rule')).toBe(true);
    });

    it('differentiates trigonometric functions with rule callouts', () => {
      const res = solveDerivative('sin(x)');
      expect(res.type).toBe('derivative');
      expect(res.finalAnswer).toContain('cos');
      expect(res.steps.some((s) => s.formulaUsed?.name === 'Sine Derivative')).toBe(true);
    });

    it('differentiates exponential functions', () => {
      const res = solveDerivative('exp(x)');
      expect(res.type).toBe('derivative');
      expect(res.finalAnswer).toContain('e');
    });
  });

  describe('solveIntegral', () => {
    it('integrates polynomials with Power Rule and adds + C', () => {
      const res = solveIntegral('2x + 3');
      expect(res.type).toBe('integral');
      expect(res.finalAnswer).toContain('+ C');
      expect(res.steps.some((s) => s.formulaUsed?.name === 'Power Rule for Integration')).toBe(true);
    });

    it('integrates trigonometric functions with + C', () => {
      const res = solveIntegral('cos(x)');
      expect(res.type).toBe('integral');
      expect(res.finalAnswer).toContain('sin');
      expect(res.finalAnswer).toContain('+ C');
    });

    it('integrates 1/x to ln|x| + C', () => {
      const res = solveIntegral('1/x');
      expect(res.type).toBe('integral');
      expect(res.finalAnswer).toContain('log');
      expect(res.finalAnswer).toContain('+ C');
    });
  });
});
