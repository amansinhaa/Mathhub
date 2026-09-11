import { solvePolynomial, solveSystem, solveInequality, solveSymbolic, extractCoefficients, solvePolynomialNumerical } from '@/lib/math/solver';
import { parseNumberLineData } from '@/components/solver/NumberLine';

describe('Math Solver Accuracy Audit', () => {

  describe('1. solvePolynomial accuracy', () => {
    test('Linear: fractional roots and large coefficients', () => {
      const res = solvePolynomial('3x + 7 = 0');
      expect(res.finalAnswer).toBe('x = -\\frac{7}{3}');
      expect(res.decimalAnswer).toBe('x = -2.333333');
      
      const res2 = solvePolynomial('1000000x - 500000 = 0');
      expect(res2.finalAnswer).toBe('x = \\frac{1}{2}');
      expect(res2.decimalAnswer).toBe('x = 0.5');
    });

    test('Quadratic: discriminant = 0', () => {
      const res = solvePolynomial('x^2 - 4x + 4 = 0');
      expect(res.finalAnswer).toBe('x = 2');
    });

    test('Quadratic: complex root sign bug check', () => {
      const res1 = solvePolynomial('2x^2 + 2x + 1 = 0');
      expect(res1.finalAnswer).toBe('x = -0.5 \\pm 0.5\\,i');

      const res2 = solvePolynomial('-2x^2 - 2x - 1 = 0');
      // Should be identical roots
      expect(res2.finalAnswer).toBe('x = -0.5 \\pm 0.5\\,i');
    });

    test('Cubic: 3 real roots', () => {
      const res = solvePolynomial('x^3 - 6x^2 + 11x - 6 = 0');
      expect(res.finalAnswer).toContain('x = 1, \\; 2, \\; 3');
    });

    test('Cubic: case where d=0', () => {
      const res = solvePolynomial('x^3 - x = 0');
      expect(res.finalAnswer).toContain('x = -1, \\; 0, \\; 1');
    });

    test('Quartic: roots ±2, ±2i', () => {
      const res = solvePolynomial('x^4 - 16 = 0');
      expect(res.finalAnswer).toContain('x = -2, \\; 2, \\; \\pm 2\\,i');
    });

    test('Quartic with fractional roots and multiplicity: 2x^4 - 9x^3 + 14x^2 - 9x + 2 = 0', () => {
      const res = solvePolynomial('2x^4 - 9x^3 + 14x^2 - 9x + 2 = 0');
      expect(res.finalAnswer).toBe('x = \\frac{1}{2}, \\; 1, \\; 2');
      expect(res.decimalAnswer).toBe('x = 0.5, \\; 1, \\; 2');
      expect(res.numericRoots).toEqual([0.5, 1, 2]);
    });

    test('Higher: roots of unity', () => {
      const res = solvePolynomial('x^6 - 1 = 0');
      expect(res.finalAnswer).toContain('x = -1, \\; 1');
    });
  });

  describe('2. extractCoefficients accuracy', () => {
    test('Standard polynomial', () => {
      const res = extractCoefficients('2*x^2 - 3*x + 1', 'x');
      expect(res).not.toBeNull();
      expect(res!.degree).toBe(2);
      expect(res!.coeffs).toEqual([2, -3, 1]);
    });

    test('Variable t with missing terms', () => {
      const res = extractCoefficients('5*t^3 - t', 't');
      expect(res).not.toBeNull();
      expect(res!.degree).toBe(3);
      expect(res!.coeffs).toEqual([5, 0, -1, 0]);
    });

    test('Expressions with parentheses', () => {
      const res = extractCoefficients('(x-1)*(x+1)', 'x');
      expect(res).not.toBeNull();
      expect(res!.degree).toBe(2);
      expect(res!.coeffs).toEqual([1, 0, -1]);
    });
  });

  describe('3. solvePolynomialNumerical accuracy', () => {
    test('Known roots', () => {
      const res1 = solvePolynomialNumerical([1, 0, -4]); // x^2 - 4
      expect(res1.real).toEqual([-2, 2]);

      const res2 = solvePolynomialNumerical([1, 0, 0, -1]); // x^3 - 1
      expect(res2.real).toEqual([1]);
      expect(res2.complex.length).toBe(1); // one conjugate pair
      expect(res2.complex[0].re).toBeCloseTo(-0.5, 4);
      expect(res2.complex[0].im).toBeCloseTo(0.866025, 4);
    });

    test('Wilkinsons polynomial (x-1)(x-2)(x-3)(x-4)(x-5)', () => {
      // expanded: x^5 - 15x^4 + 85x^3 - 225x^2 + 274x - 120
      const res = solvePolynomialNumerical([1, -15, 85, -225, 274, -120]);
      expect(res.real.length).toBe(5);
      expect(res.real[0]).toBeCloseTo(1, 1);
      expect(res.real[4]).toBeCloseTo(5, 1);
    });
  });

  describe('4. solveSystem accuracy', () => {
    test('3x3 system with known solution', () => {
      const res = solveSystem(['x + y + z = 6', '2x - y + z = 3', 'x + 2y - z = 2'], ['x', 'y', 'z']);
      expect(res.finalAnswer).toBe('x = 1, \\quad y = 2, \\quad z = 3');
    });

    test('Singular system', () => {
      const res = solveSystem(['x + y = 2', '2x + 2y = 4'], ['x', 'y']);
      // Cramer's det=0 fallback usually hits "No unique solution"
      expect(res.finalAnswer).toContain('No unique solution');
    });
  });

  describe('5. solveInequality accuracy', () => {
    test('Linear inequality', () => {
      const res = solveInequality('2x - 4 >= 0');
      expect(res.finalAnswer).toBe('x >= 2');
    });

    test('Quadratic inequality', () => {
      const res = solveInequality('x^2 - 4 > 0');
      // roots -2, 2, a > 0, > 0 => x < -2 or x > 2
      expect(res.finalAnswer).toContain('x < -2 \\quad \\text{or} \\quad x > 2');
    });

    test('Negative leading coefficient', () => {
      const res = solveInequality('-x^2 + 4 > 0');
      // roots -2, 2, a < 0, > 0 => -2 < x < 2
      expect(res.finalAnswer).toBe('-2 < x < 2');
    });
  });

  describe('6. NumberLine data parsing accuracy', () => {
    test('correctly parses fractions in single-variable notation: x = \\frac{1}{2}, \\; 1, \\; 2', () => {
      const data = parseNumberLineData('polynomial', 'x = \\frac{1}{2}, \\; 1, \\; 2');
      expect(data.roots).toEqual([0.5, 1, 2]);
      expect(data.intervals).toHaveLength(0);
    });

    test('correctly parses and deduplicates old subscript format with fractions: x_1 = \\frac{1}{2}, \\quad x_2 = 1, \\quad x_3 = 1, \\quad x_4 = 2', () => {
      const data = parseNumberLineData(
        'polynomial',
        'x_1 = \\frac{1}{2}, \\quad x_2 = 1, \\quad x_3 = 1, \\quad x_4 = 2'
      );
      expect(data.roots).toEqual([0.5, 1, 2]);
    });

    test('correctly parses negative fractions: x = -\\frac{3}{4}, \\; 2', () => {
      const data = parseNumberLineData('polynomial', 'x = -\\frac{3}{4}, \\; 2');
      expect(data.roots).toEqual([-0.75, 2]);
    });

    test('ignores complex numbers with imaginary i', () => {
      const data = parseNumberLineData('polynomial', 'x = 1, \\; -0.5 \\pm 0.866\\,i');
      expect(data.roots).toEqual([1]);
    });
  });

});
