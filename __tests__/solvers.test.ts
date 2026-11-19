import { solvePolynomial, solveSystem, solveInequality, solveSymbolic } from '../src/lib/math/solver';
import { solveDerivative, solveIntegral } from '../src/lib/math/calculusSolver';
import { solveDomainAndRange } from '../src/lib/math/domainRangeSolver';
import { matrixAdd, matrixMultiply, matrixDeterminant, matrixInverse } from '../src/lib/math/matrix';
import { classifyEquation } from '../src/lib/math/classifier';
import { quickDegreeDetect, normalizeExpression } from '../src/lib/math/normalizer';
import { analyzeFunction } from '../src/lib/math/functionAnalysis';

describe('EasyEquate Math Solver Engine Hardening (50+ Tricky Test Suite)', () => {
  // ─── 1. Quadratic Equations (10 tests) ──────────────────────────────────
  describe('Quadratic Equations', () => {
    it('1. x^2 - 5x + 6 = 0 (integer factoring)', () => {
      const res = solvePolynomial('x^2 - 5x + 6 = 0');
      expect(res.finalAnswer).toContain('2');
      expect(res.finalAnswer).toContain('3');
      expect(res.numericRoots).toEqual(expect.arrayContaining([2, 3]));
    });

    it('2. x^2 - 4 = 0 (difference of squares)', () => {
      const res = solvePolynomial('x^2 - 4 = 0');
      expect(res.finalAnswer).toContain('2');
      expect(res.finalAnswer).toContain('-2');
      expect(res.numericRoots).toEqual(expect.arrayContaining([2, -2]));
    });

    it('3. x^2 + 4x + 4 = 0 (perfect square repeated root)', () => {
      const res = solvePolynomial('x^2 + 4x + 4 = 0');
      expect(res.finalAnswer).toContain('-2');
      expect(res.numericRoots).toContain(-2);
    });

    it('4. 2x^2 + 5x - 3 = 0 (AC factoring)', () => {
      const res = solvePolynomial('2x^2 + 5x - 3 = 0');
      expect(res.numericRoots).toEqual(expect.arrayContaining([0.5, -3]));
    });

    it('5. x^2 + x + 1 = 0 (complex conjugate roots)', () => {
      const res = solvePolynomial('x^2 + x + 1 = 0');
      expect(res.finalAnswer).toContain('i');
    });

    it('6. x^2 + 4 = 0 (pure imaginary roots)', () => {
      const res = solvePolynomial('x^2 + 4 = 0');
      expect(res.finalAnswer).toContain('i');
    });

    it('7. x^2 - 2 = 0 (irrational square root)', () => {
      const res = solvePolynomial('x^2 - 2 = 0');
      expect(res.numericRoots?.[0]).toBeCloseTo(-Math.SQRT2, 4);
      expect(res.numericRoots?.[1]).toBeCloseTo(Math.SQRT2, 4);
    });

    it('8. (1/2)x^2 - 2 = 0 (fractional coefficient)', () => {
      const res = solvePolynomial('(1/2)x^2 - 2 = 0');
      expect(res.numericRoots).toEqual(expect.arrayContaining([2, -2]));
    });

    it('9. x^2 - 6x + 9 = 0 (repeated root 3)', () => {
      const res = solvePolynomial('x^2 - 6x + 9 = 0');
      expect(res.finalAnswer).toContain('3');
      expect(res.numericRoots).toContain(3);
    });

    it('10. 3x^2 - 12 = 0 (monic reduction)', () => {
      const res = solvePolynomial('3x^2 - 12 = 0');
      expect(res.numericRoots).toEqual(expect.arrayContaining([2, -2]));
    });
  });

  // ─── 2. Linear & Fractions (8 tests) ───────────────────────────────────
  describe('Linear & Fractions', () => {
    it('11. 2x + 8 = 20 (simple linear)', () => {
      const res = solvePolynomial('2x + 8 = 20');
      expect(res.finalAnswer).toBe('x = 6');
      expect(res.numericRoots).toContain(6);
    });

    it('12. 5t - 15 = 0 (custom variable t)', () => {
      const res = solvePolynomial('5t - 15 = 0');
      expect(res.finalAnswer).toBe('t = 3');
      expect(res.numericRoots).toContain(3);
    });

    it('13. x/2 + x/3 = 5 (fractions sum)', () => {
      const res = solvePolynomial('x/2 + x/3 = 5');
      expect(res.finalAnswer).toBe('x = 6');
      expect(res.numericRoots).toContain(6);
    });

    it('14. (2/3)x + 4 = 10 (fractional coefficient)', () => {
      const res = solvePolynomial('(2/3)x + 4 = 10');
      expect(res.finalAnswer).toBe('x = 9');
      expect(res.numericRoots).toContain(9);
    });

    it('15. 2/(x - 1) = 4 (rational equation)', () => {
      const res = solvePolynomial('2/(x - 1) = 4');
      expect(res.finalAnswer).toContain('\\frac{3}{2}');
    });

    it('16. 3/(x + 2) = 1 (rational equation simple)', () => {
      const res = solvePolynomial('3/(x + 2) = 1');
      expect(res.finalAnswer).toBe('x = 1');
    });

    it('17. 2x - 4 = 0 (isolate x)', () => {
      const res = solvePolynomial('2x - 4 = 0');
      expect(res.finalAnswer).toBe('x = 2');
    });

    it('18. 7x - 21 = 0', () => {
      const res = solvePolynomial('7x - 21 = 0');
      expect(res.finalAnswer).toBe('x = 3');
    });
  });

  // ─── 3. Cubic & Quartic Higher Order (5 tests) ─────────────────────────
  describe('Cubic & Quartic Polynomials', () => {
    it('19. x^3 - 6x^2 + 11x - 6 = 0 (roots 1, 2, 3)', () => {
      const res = solvePolynomial('x^3 - 6x^2 + 11x - 6 = 0');
      expect(res.finalAnswer).toContain('1');
      expect(res.finalAnswer).toContain('2');
      expect(res.finalAnswer).toContain('3');
    });

    it('20. x^3 - 4x = 0 (roots -2, 0, 2)', () => {
      const res = solvePolynomial('x^3 - 4x = 0');
      expect(res.numericRoots).toEqual(expect.arrayContaining([0, 2, -2]));
    });

    it('21. x^3 - x = 0 (roots -1, 0, 1)', () => {
      const res = solvePolynomial('x^3 - x = 0');
      expect(res.numericRoots).toEqual(expect.arrayContaining([-1, 0, 1]));
    });

    it('22. x^4 - 5x^2 + 4 = 0 (biquadratic substitution u=x^2)', () => {
      const res = solvePolynomial('x^4 - 5x^2 + 4 = 0');
      expect(res.numericRoots).toEqual(expect.arrayContaining([1, -1, 2, -2]));
    });

    it('23. x^4 - 1 = 0 (real and imaginary 4th roots)', () => {
      const res = solvePolynomial('x^4 - 1 = 0');
      expect(res.finalAnswer).toContain('1');
      expect(res.finalAnswer).toContain('-1');
    });
  });

  // ─── 4. Domain & Range Analysis (8 tests) ──────────────────────────────
  describe('Domain and Range', () => {
    it('24. sqrt(4 - x^2) (semi-circle [-2, 2])', () => {
      const res = solveDomainAndRange('sqrt(4 - x^2)');
      expect(res.finalAnswer).toContain('-2');
      expect(res.finalAnswer).toContain('2');
    });

    it('25. 1/(x - 3) (rational excluded point 3)', () => {
      const res = solveDomainAndRange('1/(x - 3)');
      expect(res.finalAnswer).toContain('3');
    });

    it('26. sqrt(x - 5) (radical [5, inf))', () => {
      const res = solveDomainAndRange('sqrt(x - 5)');
      expect(res.finalAnswer).toContain('5');
    });

    it('27. 1/(x^2 - 4) (excluded points -2, 2)', () => {
      const res = solveDomainAndRange('1/(x^2 - 4)');
      expect(res.finalAnswer).toContain('-2');
      expect(res.finalAnswer).toContain('2');
    });

    it('28. x^2 + 1 (polynomial all real numbers)', () => {
      const res = solveDomainAndRange('x^2 + 1');
      expect(res.finalAnswer).toContain('\\infty');
    });

    it('29. ln(x - 2) (logarithm domain (2, inf))', () => {
      const res = solveDomainAndRange('ln(x - 2)');
      expect(res.finalAnswer).toContain('2');
    });

    it('30. sqrt(9 - x^2) (domain [-3, 3])', () => {
      const res = solveDomainAndRange('sqrt(9 - x^2)');
      expect(res.finalAnswer).toContain('-3');
      expect(res.finalAnswer).toContain('3');
    });

    it('31. 1/x (domain x != 0)', () => {
      const res = solveDomainAndRange('1/x');
      expect(res.finalAnswer).toContain('0');
    });
  });

  // ─── 5. Derivatives (Calculus d/dx) (10 tests) ─────────────────────────
  describe('Derivatives (Differentiation)', () => {
    it('32. d/dx(x^2) = 2x', () => {
      const res = solveDerivative('x^2');
      expect(res.finalAnswer).toContain('2');
      expect(res.finalAnswer).toContain('x');
    });

    it('33. d/dx(x^3) = 3x^2', () => {
      const res = solveDerivative('x^3');
      expect(res.finalAnswer).toContain('3');
      expect(res.finalAnswer).toContain('x^{2}');
    });

    it('34. d/dx(sin(x)) = cos(x)', () => {
      const res = solveDerivative('sin(x)');
      expect(res.finalAnswer).toContain('cos');
    });

    it('35. d/dx(cos(x)) = -sin(x)', () => {
      const res = solveDerivative('cos(x)');
      expect(res.finalAnswer).toContain('sin');
      expect(res.finalAnswer).toContain('-');
    });

    it('36. d/dx(e^x) = e^x', () => {
      const res = solveDerivative('e^x');
      expect(res.finalAnswer).toContain('e^{x}');
    });

    it('37. d/dx(ln(x)) = 1/x', () => {
      const res = solveDerivative('ln(x)');
      expect(res.finalAnswer).toContain('\\frac{1}{x}');
    });

    it('38. d/dx(3x^2 + 5x - 4) = 6x + 5', () => {
      const res = solveDerivative('3x^2 + 5x - 4');
      expect(res.finalAnswer).toContain('6');
      expect(res.finalAnswer).toContain('5');
    });

    it('39. d/dx(x * sin(x)) (product rule)', () => {
      const res = solveDerivative('x * sin(x)');
      expect(res.finalAnswer).toContain('sin');
      expect(res.finalAnswer).toContain('cos');
    });

    it('40. d/dx(e^(2x)) (chain rule)', () => {
      const res = solveDerivative('e^(2x)');
      expect(res.finalAnswer).toContain('2');
      expect(res.finalAnswer).toContain('e^{2');
    });

    it('41. d/dx(1/x) = -1/x^2', () => {
      const res = solveDerivative('1/x');
      expect(res.finalAnswer).toContain('-\\frac{1}{x^{2}}');
    });
  });

  // ─── 6. Integrals (Calculus ∫) (8 tests) ────────────────────────────────
  describe('Integrals (Integration)', () => {
    it('42. ∫ x dx = x^2/2 + C', () => {
      const res = solveIntegral('x');
      expect(res.finalAnswer).toContain('x^{2}');
      expect(res.finalAnswer).toContain('+ C');
    });

    it('43. ∫ x^2 dx = x^3/3 + C', () => {
      const res = solveIntegral('x^2');
      expect(res.finalAnswer).toContain('x^{3}');
      expect(res.finalAnswer).toContain('+ C');
    });

    it('44. ∫ cos(x) dx = sin(x) + C', () => {
      const res = solveIntegral('cos(x)');
      expect(res.finalAnswer).toContain('sin');
      expect(res.finalAnswer).toContain('+ C');
    });

    it('45. ∫ sin(x) dx = -cos(x) + C', () => {
      const res = solveIntegral('sin(x)');
      expect(res.finalAnswer).toContain('cos');
      expect(res.finalAnswer).toContain('+ C');
    });

    it('46. ∫ e^x dx = e^x + C', () => {
      const res = solveIntegral('e^x');
      expect(res.finalAnswer).toContain('e^{x}');
      expect(res.finalAnswer).toContain('+ C');
    });

    it('47. ∫ (2x + 3) dx = x^2 + 3x + C', () => {
      const res = solveIntegral('2x + 3');
      expect(res.finalAnswer).toContain('x^{2}');
      expect(res.finalAnswer).toContain('3');
      expect(res.finalAnswer).toContain('+ C');
    });

    it('48. ∫ 3x^2 dx = x^3 + C', () => {
      const res = solveIntegral('3x^2');
      expect(res.finalAnswer).toContain('x^{3}');
      expect(res.finalAnswer).toContain('+ C');
    });

    it('49. ∫ 1/x dx = ln(|x|) + C', () => {
      const res = solveIntegral('1/x');
      expect(res.finalAnswer).toContain('\\ln');
      expect(res.finalAnswer).toContain('+ C');
    });
  });

  // ─── 7. Systems of Equations (4 tests) ─────────────────────────────────
  describe('Systems of Linear Equations', () => {
    it('50. x + y = 5, x - y = 1 -> x=3, y=2', () => {
      const res = solveSystem(['x + y = 5', 'x - y = 1'], ['x', 'y']);
      expect(res.finalAnswer).toContain('x = 3');
      expect(res.finalAnswer).toContain('y = 2');
    });

    it('51. 2x + y = 7, x - y = 2 -> x=3, y=1', () => {
      const res = solveSystem(['2x + y = 7', 'x - y = 2'], ['x', 'y']);
      expect(res.finalAnswer).toContain('x = 3');
      expect(res.finalAnswer).toContain('y = 1');
    });

    it('52. 2x + 3y = 12, x - y = 1 -> x=3, y=2', () => {
      const res = solveSystem(['2x + 3y = 12', 'x - y = 1'], ['x', 'y']);
      expect(res.finalAnswer).toContain('x = 3');
      expect(res.finalAnswer).toContain('y = 2');
    });

    it('53. 3x3 system: x + y + z = 6, 2x - y + z = 3, x + 2y - z = 2', () => {
      const res = solveSystem(
        ['x + y + z = 6', '2x - y + z = 3', 'x + 2y - z = 2'],
        ['x', 'y', 'z']
      );
      expect(res.finalAnswer).toContain('x = 1');
      expect(res.finalAnswer).toContain('y = 2');
      expect(res.finalAnswer).toContain('z = 3');
    });
  });

  // ─── 8. Inequalities & Absolute Values (5 tests) ────────────────────────
  describe('Inequalities & Absolute Value', () => {
    it('54. 2x - 4 > 0 -> x > 2', () => {
      const res = solveInequality('2x - 4 > 0');
      expect(res.finalAnswer).toContain('x > 2');
    });

    it('55. -3x + 9 > 0 -> flips sign to x < 3', () => {
      const res = solveInequality('-3x + 9 > 0');
      expect(res.finalAnswer).toContain('x < 3');
    });

    it('56. x^2 - 4 > 0 -> interval outside [-2, 2]', () => {
      const res = solveInequality('x^2 - 4 > 0');
      expect(res.finalAnswer).toContain('x < -2');
      expect(res.finalAnswer).toContain('x > 2');
    });

    it('57. |2x - 3| = 7 -> x = 5, -2', () => {
      const res = solvePolynomial('|2x - 3| = 7');
      expect(res.finalAnswer).toContain('5');
      expect(res.finalAnswer).toContain('-2');
    });

    it('58. |x - 1| = 4 -> x = 5, -3', () => {
      const res = solvePolynomial('|x - 1| = 4');
      expect(res.finalAnswer).toContain('5');
      expect(res.finalAnswer).toContain('-3');
    });
  });

  // ─── 9. Matrix Operations (5 tests) ────────────────────────────────────
  describe('Matrix Linear Algebra', () => {
    it('59. det([[1, 2], [3, 4]]) = -2', () => {
      const res = matrixDeterminant([[1, 2], [3, 4]]);
      expect(res.result).toBe(-2);
    });

    it('60. det([[2, 0], [0, 5]]) = 10', () => {
      const res = matrixDeterminant([[2, 0], [0, 5]]);
      expect(res.result).toBe(10);
    });

    it('61. matrix addition [[1, 2], [3, 4]] + [[5, 6], [7, 8]]', () => {
      const res = matrixAdd([[1, 2], [3, 4]], [[5, 6], [7, 8]]);
      expect(res.result).toEqual([[6, 8], [10, 12]]);
    });

    it('62. matrix multiplication [[1, 2], [3, 4]] * [[2, 0], [1, 2]]', () => {
      const res = matrixMultiply([[1, 2], [3, 4]], [[2, 0], [1, 2]]);
      expect(res.result).toEqual([[4, 4], [10, 8]]);
    });

    it('63. matrix inverse of [[1, 2], [3, 4]]', () => {
      const res = matrixInverse([[1, 2], [3, 4]]);
      expect(res.result[0][0]).toBeCloseTo(-2);
      expect(res.result[0][1]).toBeCloseTo(1);
      expect(res.result[1][0]).toBeCloseTo(1.5);
      expect(res.result[1][1]).toBeCloseTo(-0.5);
    });
  });

  // ─── 10. Variable-Free Equations (Arithmetic Check) ────────────────────
  describe('Variable-Free Equations (Arithmetic Equality Checks)', () => {
    it('64. 3 = 1 - 2(-7) -> False (3 = 15 -> False, never x = 0)', () => {
      const res = solvePolynomial('3 = 1 - 2(-7)');
      expect(res.equationType).toBe('arithmetic_check');
      expect(res.finalAnswer).toContain('False');
      expect(res.finalAnswer).not.toContain('x = 0');
    });

    it('65. 2 + 3 * 4 = 14 -> True (14 = 14 -> True)', () => {
      const res = solvePolynomial('2 + 3 * 4 = 14');
      expect(res.equationType).toBe('arithmetic_check');
      expect(res.finalAnswer).toContain('True');
    });
  });

  // ─── 11. Two-Variable Linear Equations ─────────────────────────────────
  describe('Two-Variable Linear Equations', () => {
    it('66. y = 10 - 3x -> slope -3, y-intercept 10, x-intercept 10/3', () => {
      const res = solvePolynomial('y = 10 - 3x');
      expect(res.equationType).toBe('linear_2var');
      expect(res.finalAnswer).toContain('-3');
      expect(res.finalAnswer).toContain('10');
      expect(res.finalAnswer).not.toContain('x = 0');
    });

    it('67. 3x + 2y = 12 -> slope -3/2, y-intercept 6, x-intercept 4', () => {
      const res = solvePolynomial('3x + 2y = 12');
      expect(res.equationType).toBe('linear_2var');
      expect(res.finalAnswer).toContain('6');
      expect(res.finalAnswer).toContain('4');
    });
  });

  // ─── 12. Expression Classifier & Badges ────────────────────────────────
  describe('Expression Classifier & Normalizer Badges', () => {
    it('68. sin(2x) is classified as trigonometric (never Linear)', () => {
      expect(classifyEquation('sin(2x)')).toBe('trigonometric');
      const badge = quickDegreeDetect('sin(2x)');
      expect(badge?.label).toContain('Trigonometric');
      expect(badge?.label).not.toContain('Linear');
    });

    it('69. x^2 * e^x is classified as exponential (never Quadratic)', () => {
      expect(classifyEquation('x^2 * e^x')).toBe('exponential');
      const badge = quickDegreeDetect('x^2 * e^x');
      expect(badge?.label).toContain('Exponential');
      expect(badge?.label).not.toContain('Quadratic');
    });

    it('70. 5 * 6^3(x) is classified as exponential (never Linear)', () => {
      expect(classifyEquation('5 * 6^3(x)')).toBe('exponential');
      const badge = quickDegreeDetect('5 * 6^3(x)');
      expect(badge?.label).toContain('Exponential');
      expect(badge?.label).not.toContain('Linear');
    });
  });

  // ─── 13. 2D Graph Plotter Function Analysis ───────────────────────────
  describe('2D Graph Plotter Function Analysis (Range & Asymptotes)', () => {
    it('71. y = sin(x) * cos(x) bounded range [-0.5, 0.5] and no horizontal asymptote', () => {
      const analysis = analyzeFunction('sin(x) * cos(x)');
      expect(analysis.range).toBe('[-0.5, \\; 0.5]');
      expect(analysis.asymptotes.horizontal).toEqual(['\\text{None}']);
    });

    it('72. solveDomainAndRange for sin(x) * cos(x) gives range [-0.5, 0.5]', () => {
      const res = solveDomainAndRange('sin(x) * cos(x)');
      expect(res.finalAnswer).toContain('0.5');
      expect(res.finalAnswer).toContain('-0.5');
    });
  });

  // ─── 14. Student Shorthand Auto-Normalization ───────────────────────────
  describe('Student Shorthand Auto-Normalization', () => {
    it('73. sqrt8 -> sqrt(8)', () => {
      expect(normalizeExpression('sqrt8')).toBe('sqrt(8)');
    });

    it('74. sqrtx -> sqrt(x)', () => {
      expect(normalizeExpression('sqrtx')).toBe('sqrt(x)');
    });

    it('75. 4^sqrtx -> 4^(sqrt(x))', () => {
      expect(normalizeExpression('4^sqrtx')).toBe('4^(sqrt(x))');
    });

    it('76. 2x -> 2*x', () => {
      expect(normalizeExpression('2x')).toBe('2*x');
    });

    it('77. 3(x+1) -> 3*(x+1)', () => {
      expect(normalizeExpression('3(x+1)')).toBe('3*(x+1)');
    });
  });
});
