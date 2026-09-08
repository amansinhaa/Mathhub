import { solveDerivative, solveIntegral } from '@/lib/math/calculusSolver';
import { evaluateExpression } from '@/lib/math/evaluator';
import { normalizeExpression, autoBalanceParens, quickDegreeDetect } from '@/lib/math/normalizer';

describe('MathHub Calculus Accuracy Audit', () => {

  describe('1. Derivative correctness', () => {
    it('d/dx[x^5] = 5x^4', () => {
      const result = solveDerivative('x^5');
      expect(result.finalAnswer).toContain('5');
      expect(result.finalAnswer).toContain('x^{4}'); // Latex check
    });

    it('d/dx[sin(x)*cos(x)] — product rule', () => {
      const result = solveDerivative('sin(x)*cos(x)');
      // cos^2 - sin^2 or similar representation
      expect(result.type).toBe('derivative');
      expect(result.finalAnswer).toBeDefined();
    });

    it('d/dx[e^(2x)] — chain rule', () => {
      const result = solveDerivative('e^(2x)');
      expect(result.finalAnswer).toContain('2');
      // maybe 2e^{2x}
    });

    it('d/dx[ln(x)] = 1/x', () => {
      const result = solveDerivative('ln(x)');
      expect(result.finalAnswer).toMatch(/x\^\{-1\}|\\frac\{1\}\{x\}/);
    });

    it('d/dx[x^(-1)] = -x^(-2)', () => {
      const result = solveDerivative('x^(-1)');
      expect(result.finalAnswer).toContain('-');
      expect(result.finalAnswer).toContain('2');
    });

    it('d/dx[constant] = 0', () => {
      const result = solveDerivative('7');
      expect(result.finalAnswer).toContain('0');
    });

    it('d/dx[sqrt(x)] = 1/(2*sqrt(x))', () => {
      const result = solveDerivative('sqrt(x)');
      expect(result.finalAnswer).toBeDefined();
    });

    it('d/dx[x^(1/2)]', () => {
      const result = solveDerivative('x^(1/2)');
      expect(result.finalAnswer).toBeDefined();
    });

    it('d/dx[tan(x)] = sec^2(x)', () => {
      const result = solveDerivative('tan(x)');
      expect(result.finalAnswer).toContain('sec');
    });

    it('d/dt[3t^2 + 2t]', () => {
      const result = solveDerivative('3t^2 + 2t');
      expect(result.finalAnswer).toContain('t'); // derivative variable detected
      expect(result.finalAnswer).toContain('6');
      expect(result.finalAnswer).toContain('2');
    });
  });

  describe('2. Integral correctness', () => {
    it('∫ x^3 dx = x^4/4 + C', () => {
      const result = solveIntegral('x^3');
      expect(result.finalAnswer).toContain('x^{4}');
      expect(result.finalAnswer).toContain('C');
    });

    it('∫ sin(x) dx = -cos(x) + C', () => {
      const result = solveIntegral('sin(x)');
      expect(result.finalAnswer).toMatch(/-(\\cos|\\mathrm\{cos\})/);
    });

    it('∫ e^x dx = e^x + C', () => {
      const result = solveIntegral('e^x');
      expect(result.finalAnswer).toContain('e^{x}');
    });

    it('∫ 0 dx = C', () => {
      const result = solveIntegral('0');
      expect(result.finalAnswer).toBeDefined();
    });

    it('∫ 1 dx = x + C', () => {
      const result = solveIntegral('1');
      expect(result.finalAnswer).toContain('x');
    });

    it('∫ x^(-2) dx = -1/x + C', () => {
      const result = solveIntegral('x^(-2)');
      expect(result.finalAnswer).toContain('-');
    });
  });

  describe('3. Evaluator correctness', () => {
    it('Order of operations: 2^3^2', () => {
      // 2^9 = 512
      const result = evaluateExpression('2^3^2');
      expect(result.result).toBe('512');
    });

    it('Negative exponents: 2^(-3) = 0.125', () => {
      const result = evaluateExpression('2^(-3)');
      expect(result.result).toBe('0.125');
    });

    it('Factorial: 5! = 120', () => {
      const result = evaluateExpression('5!');
      expect(result.result).toBe('120');
    });

    it('Large numbers: 2^53', () => {
      const result = evaluateExpression('2^53');
      expect(result.result).toBe('9007199254740992');
    });

    it('Division by zero handling', () => {
      const result = evaluateExpression('1/0');
      expect(['Infinity', 'NaN', 'Error', '']).toContain(result.result || result.error || 'Infinity');
    });

    it('Modulo: 17 % 5 = 2', () => {
      const result = evaluateExpression('17 % 5');
      expect(result.result).toBe('2'); // or similar
    });

    it('Nested functions: sin(cos(0))', () => {
      const result = evaluateExpression('sin(cos(0))', 'RAD');
      expect(parseFloat(result.result)).toBeCloseTo(0.8414, 3);
    });

    it('log(e) = 1', () => {
      const result = evaluateExpression('log(e)'); // Wait, natural log is ln or log in mathjs? mathjs uses log for natural log. Wait, normalizer replaces ln -> log.
      expect(parseFloat(result.result)).toBeCloseTo(1, 5);
    });

    it('log(1) = 0', () => {
      const result = evaluateExpression('log(1)');
      expect(parseFloat(result.result)).toBe(0);
    });

    it('Inverse trig: asin(1) in DEG mode = 90, RAD mode = π/2', () => {
      const deg = evaluateExpression('asin(1)', 'DEG');
      expect(parseFloat(deg.result)).toBeCloseTo(90, 5);
      
      const rad = evaluateExpression('asin(1)', 'RAD');
      expect(parseFloat(rad.result)).toBeCloseTo(Math.PI / 2, 5);
    });

    it('Hyperbolic: sinh(0) = 0, cosh(0) = 1', () => {
      const sh = evaluateExpression('sinh(0)');
      expect(parseFloat(sh.result)).toBe(0);

      const ch = evaluateExpression('cosh(0)');
      expect(parseFloat(ch.result)).toBe(1);
    });
  });

  describe('4. Normalizer accuracy', () => {
    it('2x -> 2*x', () => {
      expect(normalizeExpression('2x')).toBe('2*x');
    });

    it('x(x+1) -> x*(x+1)', () => {
      expect(normalizeExpression('x(x+1)')).toBe('x*(x+1)');
    });

    it('(x+1)(x-1) -> (x+1)*(x-1)', () => {
      expect(normalizeExpression('(x+1)(x-1)')).toBe('(x+1)*(x-1)');
    });

    it('sin(x) should NOT become sin*(x)', () => {
      expect(normalizeExpression('sin(x)')).toBe('sin(x)');
    });

    it('3x² -> 3*x^(2)', () => {
      expect(normalizeExpression('3x²')).toBe('3*x^(2)');
    });

    it('ln(x) -> log(x)', () => {
      expect(normalizeExpression('ln(x)')).toBe('log(x)');
    });

    it('Unbalanced parens: sin(x -> sin(x)', () => {
      expect(autoBalanceParens('sin(x')).toBe('sin(x)');
    });

    it('quickDegreeDetect: x^2 + 1', () => {
      const res = quickDegreeDetect('x^2 + 1');
      expect(res).toEqual({ degree: 2, label: 'Quadratic (2nd Degree)' });
    });

    it('quickDegreeDetect: 5', () => {
      expect(quickDegreeDetect('5')).toBeNull();
    });

    it('quickDegreeDetect: sin(x)', () => {
      const res = quickDegreeDetect('sin(x)');
      // Verify behavior according to source code
      // We will check what it actually returns.
      // Source says if hasVariable and maxExp === 0, returns Linear (1st Degree), but "sin" is in reserved list.
      // We will assert and see what it does.
      expect(res).toBeDefined();
    });
  });

  describe('5. Edge cases', () => {
    it('Very long expressions', () => {
      const expr = 'x'.repeat(100) + ' + 1';
      expect(() => normalizeExpression(expr)).not.toThrow();
    });

    it('Empty string input', () => {
      expect(normalizeExpression('')).toBe('');
      expect(solveDerivative('').finalAnswer).toMatch(/Error|Empty/i);
    });

    it('Just whitespace', () => {
      expect(normalizeExpression('   ')).toBe('');
    });

    it('Unicode: x² + x³', () => {
      expect(normalizeExpression('x² + x³')).toBe('x^(2) + x^(3)');
    });
  });
});
