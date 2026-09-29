import { solveDerivative, solveIntegral } from '../../src/lib/math/calculusSolver';

describe('Calculus Solver Tests', () => {
  describe('Derivative correctness', () => {
    it('d/dx[x^5] = 5x^4', () => {
      const res = solveDerivative('x^5');
      expect(res.finalAnswer).toContain('5 \\cdot x^{4}');
    });
    
    it('d/dx[3x^2 + 5x - 4] = 6x + 5', () => {
      const res = solveDerivative('3x^2 + 5x - 4');
      expect(res.finalAnswer).toMatch(/6 \\cdot x\+5/);
    });

    it('d/dx[sin(x)*cos(x)] product rule', () => {
      const res = solveDerivative('sin(x)*cos(x)');
      expect(res.finalAnswer).toMatch(/-\\mathrm\{sin\}\\left\(x\\right\)\^\{2\}\+\\mathrm\{cos\}\\left\(x\\right\)\^\{2\}|\\mathrm\{cos\}\^\{2\}\\left\(x\\right\)-\\mathrm\{sin\}\^\{2\}\\left\(x\\right\)/);
      expect(JSON.stringify(res.steps)).toContain('Product Rule');
    });

    it('d/dx[e^(2x)] chain rule', () => {
      const res = solveDerivative('e^(2x)');
      expect(res.finalAnswer).toContain('2 \\cdot e^{2 \\cdot x}');
      expect(JSON.stringify(res.steps)).toContain('Chain Rule');
    });

    it('d/dx[ln(x)] = 1/x', () => {
      const res = solveDerivative('ln(x)');
      expect(res.finalAnswer).toMatch(/\\frac\{1\}\{x\}|x\^\{-1\}/);
    });

    it('d/dx[1/x] = -1/x^2', () => {
      const res = solveDerivative('1/x');
      expect(res.finalAnswer).toMatch(/-\\frac\{1\}\{x\^\{2\}\}|-x\^\{-2\}/);
    });

    it('d/dx[sqrt(x)]', () => {
      const res = solveDerivative('sqrt(x)');
      expect(res.finalAnswer).toMatch(/\\frac\{1\}\{2 \\cdot x\^\{\\frac\{1\}\{2\}\}\}|\\frac\{1\}\{2\} \\cdot x\^\{-\\frac\{1\}\{2\}\}/);
    });

    it('d/dx[tan(x)] = sec^2(x)', () => {
      const res = solveDerivative('tan(x)');
      expect(res.finalAnswer).toMatch(/\\mathrm\{sec\}\\left\(x\\right\)\^\{2\}|\\mathrm\{cos\}\\left\(x\\right\)\^\{-2\}/);
    });

    it('d/dx[x^2 * e^x] product rule', () => {
      const res = solveDerivative('x^2 * e^x');
      expect(res.finalAnswer).toMatch(/2 \\cdot e\^\{x\} \\cdot x\+e\^\{x\} \\cdot x\^\{2\}|e\^\{x\} \\cdot x\^\{2\}\+2 \\cdot e\^\{x\} \\cdot x/); 
      expect(JSON.stringify(res.steps)).toContain('Product Rule');
    });

    it('d/dx[sin(x^2)] chain rule', () => {
      const res = solveDerivative('sin(x^2)');
      expect(res.finalAnswer).toContain('2 \\cdot \\mathrm{cos}\\left(x^{2}\\right) \\cdot x');
      expect(JSON.stringify(res.steps)).toContain('Chain Rule');
    });

    it('d/dx[ln(sin(x))] chain rule', () => {
      const res = solveDerivative('ln(sin(x))');
      expect(res.finalAnswer).toContain('\\frac{\\mathrm{cos}\\left(x\\right)}{\\mathrm{sin}\\left(x\\right)}');
      expect(JSON.stringify(res.steps)).toContain('Chain Rule');
    });

    it('d/dx[7] = 0', () => {
      const res = solveDerivative('7');
      expect(res.finalAnswer).toContain('0');
    });

    it('d/dx[0] = 0', () => {
      const res = solveDerivative('0');
      expect(res.finalAnswer).toContain('0');
    });
  });

  describe('Integral correctness', () => {
    it('∫ x^3 dx = x^4/4 + C', () => {
      const res = solveIntegral('x^3');
      expect(res.finalAnswer).toContain('\\frac{x^{4}}{4} + C');
    });

    it('∫ sin(x) dx = -cos(x) + C', () => {
      const res = solveIntegral('sin(x)');
      expect(res.finalAnswer).toContain('-\\mathrm{cos}\\left(x\\right) + C');
    });

    it('∫ cos(x) dx = sin(x) + C', () => {
      const res = solveIntegral('cos(x)');
      expect(res.finalAnswer).toContain('\\mathrm{sin}\\left(x\\right) + C');
    });

    it('∫ e^x dx = e^x + C', () => {
      const res = solveIntegral('e^x');
      expect(res.finalAnswer).toContain('e^{x} + C');
    });

    it('∫ 1/x dx = ln|x| + C', () => {
      const res = solveIntegral('1/x');
      expect(res.finalAnswer).toContain('\\ln|x| + C');
    });

    it('∫ 0 dx = C', () => {
      const res = solveIntegral('0');
      expect(res.finalAnswer).toMatch(/C|0 \+ C/);
    });

    it('∫ 1 dx = x + C', () => {
      const res = solveIntegral('1');
      expect(res.finalAnswer).toMatch(/x \+ C/);
    });

    it('∫ x^(-2) dx = -1/x + C', () => {
      const res = solveIntegral('x^(-2)');
      expect(res.finalAnswer).toMatch(/-\\frac\{1\}\{x\} \+ C/);
    });

    it('∫ (2x + 3) dx = x^2 + 3x + C', () => {
      const res = solveIntegral('2x + 3');
      expect(res.finalAnswer).toContain('x^{2}+3 \\cdot x + C');
    });

    it('∫ sec^2(x) dx = tan(x) + C', () => {
      const res = solveIntegral('sec^2(x)');
      expect(res.finalAnswer).toContain('\\mathrm{tan}\\left(x\\right) + C');
    });

    it('∫ cos(2x) dx = sin(2x)/2 + C', () => {
      const res = solveIntegral('cos(2x)');
      expect(res.finalAnswer).toContain('\\frac{\\mathrm{sin}\\left(2 \\cdot x\\right)}{2} + C');
    });

    it('∫ e^(3x) dx = e^(3x)/3 + C', () => {
      const res = solveIntegral('e^(3x)');
      expect(res.finalAnswer).toContain('\\frac{e^{3 \\cdot x}}{3} + C');
    });
  });

  describe('Edge cases', () => {
    it('Empty expression', () => {
      const res = solveDerivative('');
      expect(res.finalAnswer).toContain('Empty expression');
    });

    it('Just a number', () => {
      const res = solveDerivative('42');
      expect(res.finalAnswer).toContain('0');
    });

    it('Custom variable d/dt[3t^2]', () => {
      const res = solveDerivative('3t^2');
      expect(res.finalAnswer).toContain("f'(t) = 6 \\cdot t");
    });

    it('Nested d/dx[sin(cos(x^2))]', () => {
      const res = solveDerivative('sin(cos(x^2))');
      expect(res.finalAnswer).not.toContain('Error');
      expect(JSON.stringify(res.steps)).toContain('Chain Rule');
    });
  });
});
