import { evaluateExpression } from '../../src/lib/math/evaluator';
import { normalizeExpression, autoBalanceParens, autoInterpretEquals } from '../../src/lib/math/normalizer';

describe('Evaluator correctness', () => {
  test('Basic arithmetic', () => {
    expect(evaluateExpression('2 + 3').result).toBe('5');
    expect(evaluateExpression('2 * 3 + 4').result).toBe('10');
    expect(evaluateExpression('2 * (3 + 4)').result).toBe('14');
  });

  test('Exponents', () => {
    expect(evaluateExpression('2^3').result).toBe('8');
    expect(evaluateExpression('2^3^2').result).toBe('512');
    expect(evaluateExpression('2^(-3)').result).toBe('0.125');
    expect(evaluateExpression('-3^2').result).toBe('-9');
    expect(evaluateExpression('2^53').result).toBe(String(Math.pow(2, 53)));
  });

  test('Functions', () => {
    expect(evaluateExpression('sqrt(16)').result).toBe('4');
    expect(Number(evaluateExpression('sqrt(2)').result)).toBeCloseTo(1.4142, 3);
    
    expect(evaluateExpression('sin(0)').result).toBe('0');
    expect(evaluateExpression('cos(0)').result).toBe('1');
    expect(Number(evaluateExpression('sin(90)', 'DEG').result)).toBeCloseTo(1, 10);
    expect(Number(evaluateExpression('sin(pi/2)', 'RAD').result)).toBeCloseTo(1, 10);
    
    // Natural log
    expect(evaluateExpression('log(e)').result).toBe('1');
    expect(evaluateExpression('log(1)').result).toBe('0');
    
    // Base 10 log - wait, evaluateExpression uses mathjs which means log10 for base 10?
    // User requested: "log(10) (base 10) — check if this returns 1 or 2.302..."
    // Let's assume log is natural log if we use 'log' or 'ln', but what does mathjs do?
    // Actually math.log(x) is natural. So log(10) should be 2.302...
    expect(Number(evaluateExpression('log(10)').result)).toBeCloseTo(2.302585, 5);

    expect(evaluateExpression('abs(-5)').result).toBe('5');
    expect(evaluateExpression('5!').result).toBe('120');
    expect(evaluateExpression('17 % 5').result).toBe('2');
    expect(Number(evaluateExpression('sin(cos(0))').result)).toBeCloseTo(0.84147, 4);
  });

  test('Division by zero and invalid', () => {
    // 1/0
    const div0 = evaluateExpression('1/0');
    expect(['Infinity', 'Error', '']).toContain(div0.result === '' ? 'Error' : div0.result);
    // 0/0
    const zero0 = evaluateExpression('0/0');
    expect(['NaN', 'Error', '']).toContain(zero0.result === '' ? 'Error' : zero0.result);
    
    expect(evaluateExpression('').result).toBe('');
    expect(evaluateExpression('   ').result).toBe('');
  });

  test('Unicode symbols', () => {
    expect(evaluateExpression('2 × 3').result).toBe('6');
    expect(evaluateExpression('6 ÷ 2').result).toBe('3');
    expect(evaluateExpression('5 − 2').result).toBe('3');
    expect(Number(evaluateExpression('pi').result)).toBeCloseTo(Math.PI, 10);
    expect(Number(evaluateExpression('e').result)).toBeCloseTo(Math.E, 10);
  });
});

describe('Normalizer correctness', () => {
  test('Implicit multiplication', () => {
    expect(normalizeExpression('2x')).toBe('2*x');
    expect(normalizeExpression('3x^2')).toBe('3*x^(2)');
    expect(normalizeExpression('x(x+1)')).toBe('x*(x+1)');
    expect(normalizeExpression('(x+1)(x-1)')).toBe('(x+1)*(x-1)');
    expect(normalizeExpression('2(x+1)')).toBe('2*(x+1)');
  });

  test('Function calls should not be implicitly multiplied', () => {
    expect(normalizeExpression('sin(x)')).toBe('sin(x)');
    expect(normalizeExpression('cos(2x)')).toBe('cos(2*x)');
    expect(normalizeExpression('ln(x)')).toBe('log(x)');
  });

  test('Unicode handling', () => {
    expect(normalizeExpression('3x² + 2x')).toBe('3*x^(2) + 2*x');
    expect(normalizeExpression('x³')).toBe('x^(3)');
  });

  test('Auto-balance parens', () => {
    expect(autoBalanceParens('sin(x')).toBe('sin(x)');
  });

  test('Auto interpret equals', () => {
    expect(autoInterpretEquals('2x + 3 = 0').expr).toBe('2x + 3 = 0'); // assuming this stays same
    expect(autoInterpretEquals('2x + 3').expr).toBe('2x + 3 = 0');
  });
});
