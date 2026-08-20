import { evaluateExpression, toLatex } from '@/lib/math/evaluator';

describe('MathHub Evaluator', () => {
  describe('Basic arithmetic', () => {
    it('evaluates addition and subtraction', () => {
      const res = evaluateExpression('2 + 3 * 4');
      expect(res.error).toBeUndefined();
      expect(res.result).toBe('14');
    });

    it('evaluates parentheses and powers', () => {
      const res = evaluateExpression('(2 + 3) ^ 2');
      expect(res.error).toBeUndefined();
      expect(res.result).toBe('25');
    });

    it('handles floating point calculations', () => {
      const res = evaluateExpression('10 / 4');
      expect(res.error).toBeUndefined();
      expect(res.result).toBe('2.5');
    });
  });

  describe('Trigonometry and Angle Modes', () => {
    it('evaluates sin in RAD mode (default)', () => {
      const res = evaluateExpression('sin(pi / 2)', 'RAD');
      expect(res.error).toBeUndefined();
      expect(parseFloat(res.result)).toBeCloseTo(1, 5);
    });

    it('evaluates sin in DEG mode', () => {
      const res = evaluateExpression('sin(90)', 'DEG');
      expect(res.error).toBeUndefined();
      expect(parseFloat(res.result)).toBeCloseTo(1, 5);
    });

    it('evaluates cos in DEG mode', () => {
      const res = evaluateExpression('cos(60)', 'DEG');
      expect(res.error).toBeUndefined();
      expect(parseFloat(res.result)).toBeCloseTo(0.5, 5);
    });

    it('evaluates tan in GRAD mode', () => {
      const res = evaluateExpression('tan(50)', 'GRAD');
      expect(res.error).toBeUndefined();
      expect(parseFloat(res.result)).toBeCloseTo(1, 5);
    });
  });

  describe('Complex numbers', () => {
    it('evaluates complex addition and multiplication', () => {
      const res = evaluateExpression('(2 + 3i) * (1 - 2i)');
      expect(res.error).toBeUndefined();
      // (2*1 - 3*(-2)) + (3*1 + 2*(-2))i = 8 - i
      expect(res.result).toContain('8');
      expect(res.result).toContain('i');
    });

    it('evaluates square root of negative numbers', () => {
      const res = evaluateExpression('sqrt(-16)');
      expect(res.error).toBeUndefined();
      expect(res.result).toContain('4');
      expect(res.result).toContain('i');
    });
  });

  describe('LaTeX generation & error handling', () => {
    it('generates LaTeX from expressions', () => {
      const tex = toLatex('sqrt(x^2 + y^2)');
      expect(tex).toBeDefined();
      expect(tex).toContain('\\sqrt');
    });

    it('gracefully handles syntax errors', () => {
      const res = evaluateExpression('2 + * 3');
      expect(res.error).toBeDefined();
    });
  });
});
