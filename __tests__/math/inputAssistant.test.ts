import { analyzeInput } from '@/lib/math/inputAssistant';

describe('Input Assistant & Smart Suggestions', () => {
  describe('Error Detection & Auto-Fixes', () => {
    test('detects missing equals sign between expression and number: "2x + 8 20"', () => {
      const res = analyzeInput('2x + 8 20', 'polynomial');
      expect(res.hasFix).toBe(true);
      expect(res.fix?.fixedEquation).toBe('2x + 8 = 20');
      expect(res.fix?.id).toBe('missing-equals');
    });

    test('detects trailing equals sign: "x^2 - 5x + 6 ="', () => {
      const res = analyzeInput('x^2 - 5x + 6 =', 'polynomial');
      expect(res.hasFix).toBe(true);
      expect(res.fix?.fixedEquation).toBe('x^2 - 5x + 6 = 0');
    });

    test('detects unbalanced opening parentheses: "3*(x + 1"', () => {
      const res = analyzeInput('3*(x + 1', 'polynomial');
      expect(res.hasFix).toBe(true);
      expect(res.fix?.fixedEquation).toBe('3*(x + 1)');
    });

    test('detects function missing parentheses: "sin x"', () => {
      const res = analyzeInput('sin x', 'derivative');
      expect(res.hasFix).toBe(true);
      expect(res.fix?.fixedEquation).toBe('sin(x)');
    });

    test('detects comma-separated equations: "2x + y = 7, x - y = 2"', () => {
      const res = analyzeInput('2x + y = 7, x - y = 2', 'polynomial');
      expect(res.hasFix).toBe(true);
      expect(res.fix?.targetMode).toBe('system');
      expect(res.fix?.systemEqs).toEqual(['2x + y = 7', 'x - y = 2']);
    });

    test('detects inequality symbol in solve mode: "2x - 3 > 5"', () => {
      const res = analyzeInput('2x - 3 > 5', 'polynomial');
      expect(res.hasFix).toBe(true);
      expect(res.fix?.targetMode).toBe('inequality');
    });

    test('detects equals sign in inequality mode: "x^2 - 4 = 0"', () => {
      const res = analyzeInput('x^2 - 4 = 0', 'inequality');
      expect(res.hasFix).toBe(true);
      expect(res.fix?.targetMode).toBe('polynomial');
    });

    test('suggests setting expression to 0 in solve mode: "x^2 - 5x + 6"', () => {
      const res = analyzeInput('x^2 - 5x + 6', 'polynomial');
      expect(res.hasFix).toBe(true);
      expect(res.fix?.fixedEquation).toBe('x^2 - 5x + 6 = 0');
    });
  });

  describe('Smart Action Suggestions', () => {
    test('suggests relevant actions for quadratic expression: "x^2 - 4x + 3"', () => {
      const res = analyzeInput('x^2 - 4x + 3', 'polynomial');
      const targetModes = res.suggestions.map(s => s.targetMode);
      expect(targetModes).toContain('domain_range');
      expect(targetModes).toContain('derivative');
      expect(targetModes).toContain('integral');
    });

    test('suggests domain & range for square root radical: "sqrt(4 - x^2)"', () => {
      const res = analyzeInput('sqrt(4 - x^2)', 'polynomial');
      const dr = res.suggestions.find(s => s.targetMode === 'domain_range');
      expect(dr).toBeDefined();
      expect(dr?.label).toBe('Find Domain & Range');
    });

    test('suggests differentiation and integration for trig: "sin(x)"', () => {
      const res = analyzeInput('sin(x)', 'polynomial');
      const targetModes = res.suggestions.map(s => s.targetMode);
      expect(targetModes).toContain('derivative');
      expect(targetModes).toContain('integral');
    });

    test('suggests rearrange for multi-variable physics formula: "v = u + a*t"', () => {
      const res = analyzeInput('v = u + a*t', 'polynomial');
      const rearrange = res.suggestions.find(s => s.targetMode === 'symbolic');
      expect(rearrange).toBeDefined();
    });
  });
});
