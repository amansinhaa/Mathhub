import { solveODE, detectODE } from '@/lib/math/odeSolver';
import { solvePolynomial } from '@/lib/math/solver';
import { solveDerivative } from '@/lib/math/calculusSolver';

describe('Ordinary Differential Equation (ODE) Solver', () => {
  describe('detectODE', () => {
    it('detects 1st order y\' notation', () => {
      const d = detectODE("y' + 2y = 4");
      expect(d.isODE).toBe(true);
      expect(d.order).toBe(1);
    });

    it('detects dy/dx notation', () => {
      const d = detectODE('dy/dx = 3*x^2');
      expect(d.isODE).toBe(true);
      expect(d.order).toBe(1);
    });

    it('detects 2nd order y\'\' notation', () => {
      const d = detectODE("y'' - 5y' + 6y = 0");
      expect(d.isODE).toBe(true);
      expect(d.order).toBe(2);
    });

    it('returns false for regular polynomials', () => {
      const d = detectODE('x^2 + 2x + 1 = 0');
      expect(d.isODE).toBe(false);
    });
  });

  describe('Direct Integration ODEs', () => {
    it('solves y\' = 3x^2 => y(x) = x^3 + C', () => {
      const res = solveODE("y' = 3*x^2");
      expect(res).toBeDefined();
      expect(res.type).toBe('ode');
      expect(res.finalAnswer).toMatch(/x\^3|x\^\{3\}/);
      expect(res.finalAnswer).toContain('C');
      expect(res.steps.length).toBeGreaterThanOrEqual(3);
    });

    it('solves dy/dx = e^(2x)', () => {
      const res = solveODE('dy/dx = exp(2*x)');
      expect(res.type).toBe('ode');
      expect(res.finalAnswer).toContain('C');
    });
  });

  describe('1st-Order Linear ODEs (Integrating Factor)', () => {
    it('solves y\' + 2y = 4', () => {
      const res = solveODE("y' + 2*y = 4");
      expect(res.type).toBe('ode');
      expect(res.steps.some(s => s.explanation.includes('integrating factor'))).toBe(true);
      expect(res.finalAnswer).toContain('C');
    });
  });

  describe('2nd-Order Linear Homogeneous ODEs (Characteristic Equation)', () => {
    it('solves distinct real roots: y\'\' - 5y\' + 6y = 0 => roots 2, 3', () => {
      const res = solveODE("y'' - 5*y' + 6*y = 0");
      expect(res.type).toBe('ode');
      expect(res.steps.some(s => s.explanation.includes('characteristic equation'))).toBe(true);
      expect(res.finalAnswer).toContain('e^{3x}');
      expect(res.finalAnswer).toContain('e^{2x}');
      expect(res.finalAnswer).toContain('C_1');
      expect(res.finalAnswer).toContain('C_2');
    });

    it('solves repeated root: y\'\' - 4y\' + 4y = 0 => root 2', () => {
      const res = solveODE("y'' - 4*y' + 4*y = 0");
      expect(res.type).toBe('ode');
      expect(res.finalAnswer).toContain('C_1 + C_2 x');
      expect(res.finalAnswer).toContain('e^{2x}');
    });

    it('solves complex conjugate roots: y\'\' + 4y = 0 => roots +- 2i', () => {
      const res = solveODE("y'' + 4*y = 0");
      expect(res.type).toBe('ode');
      expect(res.finalAnswer).toContain('\\cos(2x)');
      expect(res.finalAnswer).toContain('\\sin(2x)');
    });
  });

  describe('Universal UI Dispatch', () => {
    it('solves automatically through solvePolynomial()', () => {
      const res = solvePolynomial("y'' - 5*y' + 6*y = 0");
      expect(res.type).toBe('ode');
      expect(res.finalAnswer).toContain('C_1');
    });

    it('solves automatically through solveDerivative()', () => {
      const res = solveDerivative("y' + 2*y = 4");
      expect(res.type).toBe('ode');
      expect(res.finalAnswer).toContain('C');
    });
  });
});
