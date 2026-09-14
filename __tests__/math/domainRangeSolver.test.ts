import { solveDomainAndRange } from '@/lib/math/domainRangeSolver';

describe('Domain and Range Solver', () => {
  test('Linear function: f(x) = 2x + 1', () => {
    const res = solveDomainAndRange('f(x) = 2x + 1');
    expect(res.finalAnswer).toContain('Domain: } (-\\infty, \\infty)');
    expect(res.finalAnswer).toContain('Range: } (-\\infty, \\infty)');
  });

  test('Quadratic function with upward parabola: x^2 - 4x + 3', () => {
    const res = solveDomainAndRange('x^2 - 4x + 3');
    // Vertex is at x = 2, y = -1. Range is [-1, \infty)
    expect(res.finalAnswer).toContain('Domain: } (-\\infty, \\infty)');
    expect(res.finalAnswer).toContain('Range: } [-1, \\infty)');
  });

  test('Quadratic function with downward parabola: -x^2 + 4', () => {
    const res = solveDomainAndRange('-x^2 + 4');
    // Vertex is at x = 0, y = 4. Range is (-\infty, 4]
    expect(res.finalAnswer).toContain('Domain: } (-\\infty, \\infty)');
    expect(res.finalAnswer).toContain('Range: } (-\\infty, 4]');
  });

  test('Rational function: 1/(x - 3)', () => {
    const res = solveDomainAndRange('1/(x - 3)');
    expect(res.finalAnswer).toContain('(-\\infty, 3) \\cup (3, \\infty)');
    expect(res.finalAnswer).toContain('(-\\infty, 0) \\cup (0, \\infty)');
  });

  test('Radical semi-circle: sqrt(4 - x^2)', () => {
    const res = solveDomainAndRange('sqrt(4 - x^2)');
    expect(res.finalAnswer).toContain('[-2, 2]');
    expect(res.finalAnswer).toContain('[0, 2]');
  });

  test('Linear radical: sqrt(x - 2)', () => {
    const res = solveDomainAndRange('sqrt(x - 2)');
    expect(res.finalAnswer).toContain('[2, \\infty)');
    expect(res.finalAnswer).toContain('[0, \\infty)');
  });

  test('Logarithmic function: ln(x - 5)', () => {
    const res = solveDomainAndRange('ln(x - 5)');
    expect(res.finalAnswer).toContain('(5, \\infty)');
    expect(res.finalAnswer).toContain('(-\\infty, \\infty)');
  });

  test('Trigonometric function: sin(x)', () => {
    const res = solveDomainAndRange('sin(x)');
    expect(res.finalAnswer).toContain('(-\\infty, \\infty)');
    expect(res.finalAnswer).toContain('[-1, 1]');
  });

  test('Constant function: f(x) = 7', () => {
    const res = solveDomainAndRange('f(x) = 7');
    expect(res.finalAnswer).toContain('Domain: } (-\\infty, \\infty)');
    expect(res.finalAnswer).toContain('Range: } [7, 7]');
  });

  test('Cubic polynomial: x^3 - 3x', () => {
    const res = solveDomainAndRange('x^3 - 3x');
    expect(res.finalAnswer).toContain('Domain: } (-\\infty, \\infty)');
    expect(res.finalAnswer).toContain('Range: } (-\\infty, \\infty)');
  });

  test('Linear-over-linear rational: (2x + 1)/(x - 1)', () => {
    const res = solveDomainAndRange('(2x + 1)/(x - 1)');
    expect(res.finalAnswer).toContain('Domain: } (-\\infty, 1) \\cup (1, \\infty)');
    expect(res.finalAnswer).toContain('Range: } (-\\infty, 2) \\cup (2, \\infty)');
  });

  test('Tangent function: tan(x)', () => {
    const res = solveDomainAndRange('tan(x)');
    expect(res.finalAnswer).toContain('\\frac{\\pi}{2} + k\\pi');
    expect(res.finalAnswer).toContain('Range: } (-\\infty, \\infty)');
  });
});
