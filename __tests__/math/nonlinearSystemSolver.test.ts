import { solveNonlinearSystem, isNonlinearSystem } from '@/lib/math/nonlinearSystemSolver';
import { solveSystem } from '@/lib/math/solver';

describe('Nonlinear System of Equations Solver', () => {
  describe('isNonlinearSystem detection', () => {
    it('detects quadratic powers in equations', () => {
      expect(isNonlinearSystem(['x^2 + y^2 = 25', 'y = x + 1'])).toBe(true);
    });

    it('detects product terms like xy', () => {
      expect(isNonlinearSystem(['x*y = 6', 'x + y = 5'])).toBe(true);
    });

    it('returns false for standard linear systems', () => {
      expect(isNonlinearSystem(['2x + 3y = 7', 'x - y = 1'])).toBe(false);
    });
  });

  describe('Nonlinear Systems Solving', () => {
    it('solves Parabola + Line intersection: y = x^2 and y = 2x + 3', () => {
      const res = solveNonlinearSystem(['y = x^2', 'y = 2*x + 3'], ['x', 'y']);
      expect(res).toBeDefined();
      expect(res.type).toBe('system');
      // Roots of x^2 - 2x - 3 = 0 are 3 and -1
      // (3, 9) and (-1, 1)
      expect(res.finalAnswer).toContain('(3, 9)');
      expect(res.finalAnswer).toContain('(-1, 1)');
      expect(res.steps.length).toBeGreaterThanOrEqual(4);
    });

    it('solves Circle + Line intersection: x^2 + y^2 = 25 and y = x + 1', () => {
      const res = solveNonlinearSystem(['x^2 + y^2 = 25', 'y = x + 1'], ['x', 'y']);
      expect(res).toBeDefined();
      // x^2 + (x+1)^2 = 25 => 2x^2 + 2x - 24 = 0 => x^2 + x - 12 = 0 => x = 3, -4
      // Points: (3, 4) and (-4, -3)
      expect(res.finalAnswer).toContain('(3, 4)');
      expect(res.finalAnswer).toContain('(-4, -3)');
    });

    it('solves Hyperbola + Line: x*y = 6 and x + y = 5', () => {
      const res = solveNonlinearSystem(['x*y = 6', 'x + y = 5'], ['x', 'y']);
      expect(res).toBeDefined();
      // Points: (2, 3) and (3, 2)
      expect(res.finalAnswer).toContain('(2, 3)');
      expect(res.finalAnswer).toContain('(3, 2)');
    });

    it('seamlessly routes through solveSystem()', () => {
      const res = solveSystem(['y = x^2', 'y = 2*x + 3'], ['x', 'y']);
      expect(res.type).toBe('system');
      expect(res.finalAnswer).toContain('(3, 9)');
      expect(res.finalAnswer).toContain('(-1, 1)');
    });
  });
});
