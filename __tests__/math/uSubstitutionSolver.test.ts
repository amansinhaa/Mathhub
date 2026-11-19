import { solvePolynomial } from '@/lib/math/solver';
import { detectUSubstitution, trySolveUSubstitutionEquation } from '@/lib/math/uSubstitutionSolver';
import { trySolveTrigonometricEquation } from '@/lib/math/trigonometricSolver';

describe('U-Substitution (Quadratic-in-Disguise) Solver', () => {
  describe('detectUSubstitution', () => {
    it('detects trigonometric quadratic in disguise: 2sin^2(x) - 3sin(x) + 1 = 0', () => {
      const d = detectUSubstitution('2*sin(x)^(2) - 3*sin(x) + 1 = 0');
      expect(d).not.toBeNull();
      expect(d?.kernelType).toBe('trig');
      expect(d?.trigFunc).toBe('sin');
      expect(d?.A).toBe(2);
      expect(d?.B).toBe(-3);
      expect(d?.C).toBe(1);
    });

    it('detects exponential quadratic in disguise: e^(2x) - 3e^x + 2 = 0', () => {
      const d = detectUSubstitution('exp(2*x) - 3*exp(x) + 2 = 0');
      expect(d).not.toBeNull();
      expect(d?.kernelType).toBe('exponential');
      expect(d?.A).toBe(1);
      expect(d?.B).toBe(-3);
      expect(d?.C).toBe(2);
    });

    it('detects logarithmic quadratic in disguise: (ln(x))^2 - 3ln(x) + 2 = 0', () => {
      const d = detectUSubstitution('(ln(x))^2 - 3*ln(x) + 2 = 0');
      expect(d).not.toBeNull();
      expect(d?.kernelType).toBe('logarithmic');
      expect(d?.A).toBe(1);
      expect(d?.B).toBe(-3);
      expect(d?.C).toBe(2);
    });

    it('detects radical quadratic in disguise: x - 5sqrt(x) + 6 = 0', () => {
      const d = detectUSubstitution('x - 5*sqrt(x) + 6 = 0');
      expect(d).not.toBeNull();
      expect(d?.kernelType).toBe('radical');
      expect(d?.A).toBe(1);
      expect(d?.B).toBe(-5);
      expect(d?.C).toBe(6);
    });
  });

  describe('Trigonometric U-Substitution and Basic Step-by-Step Solving', () => {
    it('solves 2sin^2x - 3sinx + 1 = 0 with exact solutions and >= 4 steps', () => {
      const res = solvePolynomial('2sin^2x - 3sinx + 1 = 0');
      expect(res).toBeDefined();
      expect(res.steps.length).toBeGreaterThanOrEqual(4);

      // Verify exact angles in [0, 2pi]
      expect(res.finalAnswer).toContain('\\frac{\\pi}{6}');
      expect(res.finalAnswer).toContain('\\frac{\\pi}{2}');
      expect(res.finalAnswer).toContain('\\frac{5\\pi}{6}');

      // Step 1: substitution definition
      expect(res.steps[0].explanation).toContain('u = \\sin(x)');
      expect(res.steps[0].math).toContain('2u^2 - 3u + 1 = 0');

      // Step 2: quadratic solving in u
      expect(res.steps[1].explanation).toContain('quadratic formula');
      expect(res.steps[1].math).toContain('u_1');

      // Step 3: back-substitution branches
      expect(res.steps[2].explanation).toContain('Back-substitute');
      expect(res.steps[2].math).toContain('\\sin(x) = 1');
      expect(res.steps[2].math).toContain('\\sin(x) = \\frac{1}{2}');

      // Step 4: collected solution set
      expect(res.steps[3].math).toBe(res.finalAnswer);
    });

    it('solves 2cos(x) - 1 = 0 with exact solutions and >= 4 steps', () => {
      const res = solvePolynomial('2cos(x) - 1 = 0');
      expect(res).toBeDefined();
      expect(res.steps.length).toBeGreaterThanOrEqual(4);

      // Exact roots: pi/3, 5pi/3
      expect(res.finalAnswer).toContain('\\frac{\\pi}{3}');
      expect(res.finalAnswer).toContain('\\frac{5\\pi}{3}');

      // Step 1: isolate trig function
      expect(res.steps[0].explanation).toContain('Isolate');
      // Step 2: range verification
      expect(res.steps[1].explanation).toContain('range');
      // Step 3: reference angle and quadrant analysis
      expect(res.steps[2].explanation).toContain('reference angle');
      // Step 4: primary solutions
      expect(res.steps[3].explanation).toMatch(/domain|interval/);
    });

    it('discards extraneous roots: sin^2(x) - 4sin(x) + 3 = 0', () => {
      // u^2 - 4u + 3 = 0 => (u - 3)(u - 1) = 0 => u=3 (discarded), u=1 => x = pi/2
      const res = solvePolynomial('sin^2(x) - 4sin(x) + 3 = 0');
      expect(res).toBeDefined();
      expect(res.steps.length).toBeGreaterThanOrEqual(4);
      expect(res.finalAnswer).toContain('\\frac{\\pi}{2}');
      expect(res.finalAnswer).not.toContain('3');
      const branchStep = res.steps.find((s) => s.explanation.includes('Back-substitute'));
      expect(branchStep?.math).toContain('No real solution');
    });
  });

  describe('Exponential U-Substitution Step-by-Step Solving', () => {
    it('solves e^(2x) - 3e^x + 2 = 0 with exact solutions and >= 4 steps', () => {
      const res = solvePolynomial('e^(2x) - 3e^x + 2 = 0');
      expect(res).toBeDefined();
      expect(res.steps.length).toBeGreaterThanOrEqual(4);

      // Roots: e^x = 1 => x = 0; e^x = 2 => x = ln(2)
      expect(res.finalAnswer).toContain('0');
      expect(res.finalAnswer).toContain('\\ln(2)');

      // Step 1: substitution definition
      expect(res.steps[0].explanation).toContain('u = e^{x}');
      expect(res.steps[0].math).toContain('u^2 - 3u + 2 = 0');

      // Step 2: quadratic solving in u
      expect(res.steps[1].math).toContain('u_1');

      // Step 3: branch solving
      expect(res.steps[2].explanation).toContain('Back-substitute');
      expect(res.steps[2].math).toContain('e^{x} = 2');
    });

    it('discards non-positive exponential roots: e^(2x) + e^x - 2 = 0', () => {
      // u^2 + u - 2 = 0 => (u + 2)(u - 1) = 0 => u = 1 (x=0), u = -2 (discarded)
      const res = solvePolynomial('e^(2x) + e^x - 2 = 0');
      expect(res).toBeDefined();
      expect(res.steps.length).toBeGreaterThanOrEqual(4);
      expect(res.finalAnswer).toBe('x = 0');
      const branchStep = res.steps.find((s) => s.explanation.includes('Back-substitute'));
      expect(branchStep?.math).toContain('No real solution');
    });
  });

  describe('Biquadratic and Radical Step-by-Step Solving', () => {
    it('solves x^4 - 5x^2 + 4 = 0 with exact solutions and >= 4 steps', () => {
      const res = solvePolynomial('x^4 - 5x^2 + 4 = 0');
      expect(res).toBeDefined();
      expect(res.steps.length).toBeGreaterThanOrEqual(4);

      // Roots: ±1, ±2
      expect(res.finalAnswer).toContain('1');
      expect(res.finalAnswer).toContain('-1');
      expect(res.finalAnswer).toContain('2');
      expect(res.finalAnswer).toContain('-2');

      // Verify substitution u = x^2 step exists
      const substStep = res.steps.find((s) => s.explanation.includes('u = x^2'));
      expect(substStep).toBeDefined();
    });

    it('solves radical quadratic-in-disguise: x - 5sqrt(x) + 6 = 0', () => {
      // u = sqrt(x) => u^2 - 5u + 6 = 0 => u = 2, 3 => x = 4, 9
      const res = solvePolynomial('x - 5sqrt(x) + 6 = 0');
      expect(res).toBeDefined();
      expect(res.steps.length).toBeGreaterThanOrEqual(4);

      expect(res.finalAnswer).toContain('4');
      expect(res.finalAnswer).toContain('9');

      // Step 1: substitution definition
      expect(res.steps[0].explanation).toContain('u = \\sqrt{x}');
      expect(res.steps[0].math).toContain('u^2 - 5u + 6 = 0');
    });
  });

  describe('Logarithmic U-Substitution Step-by-Step Solving', () => {
    it('solves (ln(x))^2 - 3ln(x) + 2 = 0 with exact solutions and >= 4 steps', () => {
      const res = solvePolynomial('(ln(x))^2 - 3ln(x) + 2 = 0');
      expect(res).toBeDefined();
      expect(res.steps.length).toBeGreaterThanOrEqual(4);

      // Roots: ln(x) = 1 => x = e; ln(x) = 2 => x = e^2
      expect(res.finalAnswer).toContain('e');
      expect(res.finalAnswer).toContain('e^{2}');

      // Step 1: substitution definition
      expect(res.steps[0].explanation).toContain('u = \\ln(x)');
      expect(res.steps[0].math).toContain('u^2 - 3u + 2 = 0');
    });
  });
});
