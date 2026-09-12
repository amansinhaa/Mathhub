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

  describe('PDF 20 Equations Suite - E2E Diagnostic', () => {
    test('trace normalizer output and solver dispatch for all questions', () => {
      const fs = require('fs');
      const { normalizeExpression, autoBalanceParens, autoInterpretEquals } = require('@/lib/math/normalizer');
      const { solvePolynomial, solveSystem } = require('@/lib/math/solver');
      const { solveNonlinearSystem } = require('@/lib/math/nonlinearSystemSolver');
      const { trySolveTrigonometricEquation } = require('@/lib/math/trigonometricSolver');

      // Raw inputs exactly as a user would type them on the site
      const rawInputs = [
        { id: 1, raw: '2x^4 - 9x^3 + 14x^2 - 9x + 2 = 0', expected: 'x = 1/2, 1, 2' },
        { id: 2, raw: 'x^3 - 6x^2 + 11x - 6 = 0', expected: 'x = 1, 2, 3' },
        { id: 3, raw: 'sqrt(x+7) - sqrt(x-5) = 2', expected: 'x = 9' },
        { id: 4, raw: '3/(x-2) + 2/(x+1) = 7/(x^2 - x - 2)', expected: 'x = 8/5' },
        { id: 5, raw: 'x^4 - 5x^2 + 4 = 0', expected: 'x = -2, -1, 1, 2' },
        { id: 6, raw: '3^(2x+1) - 10*3^x + 3 = 0', expected: 'x = -1, 1' },
        { id: 7, raw: 'log_2(x-1) + log_2(x+1) = 3', expected: 'x = 3' },
        { id: 8, raw: '5^x = 2^(x+3)', expected: 'x ≈ 2.269' },
        { id: 9, raw: 'ln(x^2) - ln(x+2) = ln(3)', expected: 'x ≈ 4.37, -1.37' },
        { id: 10, raw: '2^x + 2^(-x) = 5/2', expected: 'x = ±1' },
        { id: 11, raw: '2sin^2(x) - 3sin(x) + 1 = 0', expected: 'π/6, π/2, 5π/6' },
        { id: 12, raw: 'cos(2x) + sin(x) = 0', expected: 'π/2, 7π/6, 11π/6' },
        { id: 13, raw: 'tan(x) + cot(x) = 2', expected: 'π/4, 5π/4' },
        { id: 17, raw: 'sqrt(2x+3) = x - 3', expected: 'x = 4+√10' },
        { id: 18, raw: '(x+1)/(x-1) - (x-1)/(x+1) = 5/6', expected: 'x = -1/5, 5' },
        { id: 19, raw: 'x^2 + 4x + 13 = 0', expected: 'x = -2 ± 3i' },
        { id: 20, raw: '4^x - 3*2^(x+2) + 32 = 0', expected: 'x = 2, 3' },
      ];

      // Also test user-typed variants
      const userVariants = [
        { id: '11a', raw: '2*sin(x)^2 - 3*sin(x) + 1 = 0', expected: 'with explicit mul' },
        { id: '11b', raw: '2sin²(x) - 3sin(x) + 1 = 0', expected: 'unicode superscript' },
        { id: '11c', raw: '2sin^2x - 3sinx + 1 = 0', expected: 'no-paren shorthand' },
        { id: '13a', raw: 'tanx + cotx = 2', expected: 'no-paren shorthand' },
      ];

      const report: any[] = [];

      for (const item of [...rawInputs, ...userVariants]) {
        const entry: any = { id: item.id, raw: item.raw, expected: item.expected };

        // Trace normalizer pipeline (same as solvePolynomial internals)
        const balanced = autoBalanceParens(item.raw.trim());
        entry.balanced = balanced;

        const interp = autoInterpretEquals(balanced);
        const preNorm = interp.interpreted ? interp.expr : balanced;
        entry.interpreted = interp.interpreted;

        const normalized = normalizeExpression(preNorm);
        entry.normalized = normalized;

        // Check trig solver claim on the normalized input
        try {
          const trigResult = trySolveTrigonometricEquation(normalized, item.raw);
          entry.trigClaimed = trigResult !== null;
          if (trigResult) {
            entry.trigFinalAnswer = trigResult.finalAnswer;
            entry.trigNumericRoots = trigResult.numericRoots;
          }
        } catch (e: any) {
          entry.trigClaimed = 'error: ' + e.message;
        }

        // Full pipeline
        try {
          const result = solvePolynomial(item.raw);
          entry.finalAnswer = result.finalAnswer;
          entry.numericRoots = result.numericRoots;
          entry.stepCount = result.steps.length;
        } catch (e: any) {
          entry.error = e.message;
        }

        report.push(entry);
      }

      // Write results
      fs.writeFileSync(
        'C:/Users/amans/.gemini/antigravity/scratch/mathhub/e2e_diagnostic.json',
        JSON.stringify(report, null, 2),
        'utf-8'
      );

      // Print summary
      for (const r of report) {
        console.log(`Q${r.id} | norm="${(r.normalized || '').substring(0,60)}" | answer="${(r.finalAnswer || r.error || 'N/A').substring(0,60)}" | expected="${r.expected}"`);
      }

      expect(report.length).toBe(rawInputs.length + userVariants.length);
    });
  });

  describe('7. Trigonometric Equation Solver Tests', () => {
    test('sin(x) = 1/2 returns pi/6 and 5pi/6 on [0, 2pi]', () => {
      const res = solvePolynomial('sin(x) = 1/2');
      expect(res.equationType).toBe('trigonometric');
      expect(res.finalAnswer).toContain('\\frac{\\pi}{6}');
      expect(res.finalAnswer).toContain('\\frac{5\\pi}{6}');
      expect(res.numericRoots).toBeDefined();
      expect(res.numericRoots?.some(r => Math.abs(r - Math.PI / 6) < 1e-3)).toBe(true);
      expect(res.numericRoots?.some(r => Math.abs(r - 5 * Math.PI / 6) < 1e-3)).toBe(true);
    });

    test('sin(x) + cos(x) = 1 returns 0, pi/2, and 2pi on [0, 2pi]', () => {
      const res = solvePolynomial('sin(x) + cos(x) = 1');
      expect(res.equationType).toBe('trigonometric');
      expect(res.finalAnswer).toContain('0');
      expect(res.finalAnswer).toContain('\\frac{\\pi}{2}');
      expect(res.finalAnswer).toContain('2\\pi');
      expect(res.numericRoots?.some(r => Math.abs(r - 0) < 1e-3)).toBe(true);
      expect(res.numericRoots?.some(r => Math.abs(r - Math.PI / 2) < 1e-3)).toBe(true);
      expect(res.numericRoots?.some(r => Math.abs(r - 2 * Math.PI) < 1e-3)).toBe(true);
      // Ensure it NEVER returns a negative single root branch like -6.283185
      expect(res.finalAnswer).not.toContain('-6.28');
    });

    test('2*sin(x)^2 + 3*sin(x) - 2 = 0 returns pi/6 and 5pi/6 on [0, 2pi]', () => {
      const res = solvePolynomial('2*sin(x)^2 + 3*sin(x) - 2 = 0');
      expect(res.equationType).toBe('trigonometric');
      expect(res.finalAnswer).toContain('\\frac{\\pi}{6}');
      expect(res.finalAnswer).toContain('\\frac{5\\pi}{6}');
      expect(res.numericRoots?.some(r => Math.abs(r - Math.PI / 6) < 1e-3)).toBe(true);
      expect(res.numericRoots?.some(r => Math.abs(r - 5 * Math.PI / 6) < 1e-3)).toBe(true);
    });

    test('tan(x) = 1 returns pi/4 and 5pi/4 on [0, 2pi]', () => {
      const res = solvePolynomial('tan(x) = 1');
      expect(res.equationType).toBe('trigonometric');
      expect(res.finalAnswer).toContain('\\frac{\\pi}{4}');
      expect(res.finalAnswer).toContain('\\frac{5\\pi}{4}');
      expect(res.numericRoots?.some(r => Math.abs(r - Math.PI / 4) < 1e-3)).toBe(true);
      expect(res.numericRoots?.some(r => Math.abs(r - 5 * Math.PI / 4) < 1e-3)).toBe(true);
    });
  });
});
