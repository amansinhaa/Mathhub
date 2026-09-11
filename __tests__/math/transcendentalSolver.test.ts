import { solveTranscendental, detectTranscendental } from '@/lib/math/transcendentalSolver';
import { solvePolynomial } from '@/lib/math/solver';

describe('Transcendental Equation Solver', () => {
  describe('detectTranscendental', () => {
    it('detects exponential equations', () => {
      const res = detectTranscendental('x * e^x = 5');
      expect(res.isTranscendental).toBe(true);
      expect(res.functions).toContain('exponential');
      expect(res.variable).toBe('x');
    });

    it('detects trigonometric equations', () => {
      const res = detectTranscendental('sin(x) + x = 2');
      expect(res.isTranscendental).toBe(true);
      expect(res.functions).toContain('trigonometric');
    });

    it('detects logarithmic equations', () => {
      const res = detectTranscendental('ln(x) + 2x = 4');
      expect(res.isTranscendental).toBe(true);
      expect(res.functions).toContain('logarithmic');
    });

    it('returns false for pure polynomial equations', () => {
      const res = detectTranscendental('x^2 - 5x + 6 = 0');
      expect(res.isTranscendental).toBe(false);
    });
  });

  describe('solveTranscendental execution', () => {
    it('solves x * e^x = 5 (known root approx 1.3267)', () => {
      const res = solveTranscendental('x * e^x = 5');
      expect(res).toBeDefined();
      expect(res.numericRoots).toBeDefined();
      expect(res.numericRoots!.length).toBeGreaterThan(0);
      const root = res.numericRoots![0];
      expect(root).toBeCloseTo(1.3267, 2);
      expect(res.steps.length).toBeGreaterThanOrEqual(4);
      expect(res.finalAnswer).toContain('1.3267');
    });

    it('solves sin(x) + x = 2 (known root approx 1.1061)', () => {
      const res = solveTranscendental('sin(x) + x = 2');
      expect(res.numericRoots).toBeDefined();
      const root = res.numericRoots![0];
      expect(root).toBeCloseTo(1.106, 2);
      expect(res.steps.some(s => s.explanation.includes('Newton-Raphson'))).toBe(true);
    });

    it('solves ln(x) + 2x = 4 (known root approx 1.7269)', () => {
      const res = solveTranscendental('ln(x) + 2*x = 4');
      expect(res.numericRoots).toBeDefined();
      const root = res.numericRoots![0];
      expect(root).toBeCloseTo(1.727, 2);
    });

    it('integrates seamlessly through solvePolynomial()', () => {
      const res = solvePolynomial('x * e^x = 5');
      expect(res).toBeDefined();
      expect(res.finalAnswer).toContain('1.3267');
      expect(res.numericRoots).toBeDefined();
      expect(res.numericRoots![0]).toBeCloseTo(1.3267, 2);
    });

    it('solves exponential equation 3^(2x+1) - 10*3^x + 3 = 0', () => {
      const res = solvePolynomial('3^(2x+1) - 10*3^x + 3 = 0');
      expect(res.finalAnswer).toContain('x_1 = -1');
      expect(res.finalAnswer).toContain('x_2 = 1');
      expect(res.steps.length).toBeGreaterThanOrEqual(5);
    });

    it('solves exponential expression without equals sign 3^(2x+1) - 10*3^x + 3', () => {
      const res = solvePolynomial('3^(2x+1) - 10*3^x + 3');
      expect(res.finalAnswer).toContain('x_1 = -1');
      expect(res.finalAnswer).toContain('x_2 = 1');
      expect(res.steps.length).toBeGreaterThanOrEqual(5);
    });

    it('handles unicode middle dot in exponential expression 3^(2x+1)-10·3^x+3', () => {
      const res = solvePolynomial('3^(2x+1)-10·3^x+3');
      expect(res.finalAnswer).toContain('x_1 = -1');
      expect(res.finalAnswer).toContain('x_2 = 1');
    });

    it('solves exponential equation with base unification 4^x - 3*2^x + 2 = 0', () => {
      const res = solvePolynomial('4^x - 3*2^x + 2 = 0');
      expect(res.numericRoots).toBeDefined();
      expect(res.numericRoots).toContain(0);
      expect(res.numericRoots).toContain(1);
    });

    it('solves single exponential equation 2^(x+3) = 16', () => {
      const res = solvePolynomial('2^(x+3) = 16');
      expect(res.numericRoots).toBeDefined();
      expect(res.numericRoots).toContain(1);
      expect(res.finalAnswer).toContain('1');
    });

    it('solves exponential equation in natural base e^(2x) - 4*e^x + 3 = 0', () => {
      const res = solvePolynomial('e^(2x) - 4*e^x + 3 = 0');
      expect(res.numericRoots).toBeDefined();
      expect(res.numericRoots).toContain(0);
      expect(res.finalAnswer).toContain('\\ln(3)');
    });
  });
});
