import { solvePolynomial } from '@/lib/math/solver';
import { detectParametricEquation, solveParametricEquation } from '@/lib/math/parametricSolver';

describe('Parametric Equation Solver & Step Formatting', () => {
  test('detects parametric equation correctly', () => {
    const det1 = detectParametricEquation('2x^2 + 3x - m + 2 = 0');
    expect(det1.isParametric).toBe(true);
    expect(det1.primaryVar).toBe('x');
    expect(det1.parameters).toContain('m');

    const det2 = detectParametricEquation('x^2 - 5x + 6 = 0');
    expect(det2.isParametric).toBe(false);
  });

  test('solves 2x^2 + 3x - m + 2 = 0 with comprehensive steps', () => {
    const res = solvePolynomial('2x^2 + 3x - m + 2 = 0');
    expect(res.type).toBe('polynomial');
    expect(res.steps.length).toBeGreaterThanOrEqual(4);

    // Step 1: Coefficients
    expect(res.steps[0].math).toContain('a = 2');
    expect(res.steps[0].math).toContain('b = 3');

    // Step 2: Discriminant
    expect(res.steps[1].math).toContain('\\Delta');
    expect(res.steps[1].math).toContain('8');

    // Step 3: Quadratic Formula
    expect(res.steps[2].explanation).toContain('Quadratic Formula');

    // Step 5: Nature of roots
    const lastStep = res.steps[res.steps.length - 1];
    expect(lastStep.explanation).toContain('Nature of the Roots');
    expect(lastStep.math).toContain('distinct real roots');

    // Check top-level natureOfRoots field
    expect(res.natureOfRoots).toBeDefined();
    expect(res.natureOfRoots?.length).toBe(3);
    expect(res.natureOfRoots?.[0]).toContain('distinct real roots');
    expect(res.natureOfRoots?.[1]).toContain('repeated real root');
    expect(res.natureOfRoots?.[2]).toContain('complex conjugate');
  });

  test('solves k*x^2 + 4x + 1 = 0 with parametric k', () => {
    const res = solvePolynomial('k*x^2 + 4*x + 1 = 0');
    expect(res.type).toBe('polynomial');
    expect(res.steps[0].math).toContain('a = k');
    expect(res.steps[1].math).toContain('\\Delta');
  });

  test('solves linear parametric a*x + b = 0', () => {
    const res = solveParametricEquation('a*x + b = 0', 'x');
    expect(res.steps.length).toBe(2);
    expect(res.finalAnswer).toContain('x =');
  });
});
