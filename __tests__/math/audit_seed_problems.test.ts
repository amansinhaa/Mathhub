import { ALL_PROBLEMS } from '@/data/problems';
import { solveDerivative, solveIntegral } from '@/lib/math/calculusSolver';
import { solvePolynomial } from '@/lib/math/solver';

describe('Seed Problems Accuracy & Integrity Audit', () => {
  test('ALL_PROBLEMS contains exactly 65 verified problems', () => {
    expect(ALL_PROBLEMS.length).toBe(65);
  });

  test('All slugs are unique and valid URL characters', () => {
    const slugs = new Set<string>();
    for (const p of ALL_PROBLEMS) {
      expect(slugs.has(p.slug)).toBe(false);
      slugs.add(p.slug);
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  describe('Derivatives (22 problems)', () => {
    const derivatives = ALL_PROBLEMS.filter((p) => p.toolType === 'derivative');
    test('Count is 22', () => {
      expect(derivatives.length).toBe(22);
    });

    for (const prob of derivatives) {
      test(`Differentiates ${prob.problemText} (${prob.inputExpression}) without errors`, () => {
        const result = solveDerivative(prob.inputExpression);
        expect(result.error).toBeUndefined();
        expect(result.steps.length).toBeGreaterThan(0);
        expect(result.finalAnswer).toBeDefined();
      });
    }
  });

  describe('Integrals (22 problems)', () => {
    const integrals = ALL_PROBLEMS.filter((p) => p.toolType === 'integral');
    test('Count is 22', () => {
      expect(integrals.length).toBe(22);
    });

    for (const prob of integrals) {
      test(`Integrates ${prob.problemText} (${prob.inputExpression}) without errors`, () => {
        const result = solveIntegral(prob.inputExpression);
        expect(result.error).toBeUndefined();
        expect(result.steps.length).toBeGreaterThan(0);
        expect(result.finalAnswer).toBeDefined();
      });
    }
  });

  describe('Quadratics & Polynomials (21 problems)', () => {
    const polys = ALL_PROBLEMS.filter((p) => p.category === 'algebra');
    test('Count is 21', () => {
      expect(polys.length).toBe(21);
    });

    for (const prob of polys) {
      test(`Solves ${prob.problemText} (${prob.inputExpression}) without errors`, () => {
        const result = solvePolynomial(prob.inputExpression);
        expect(result.error).toBeUndefined();
        expect(result.steps.length).toBeGreaterThan(0);
        expect(result.finalAnswer).toBeDefined();
      });
    }
  });

  test('All problems have requiredFormula and search keywords', () => {
    for (const prob of ALL_PROBLEMS) {
      expect(prob.requiredFormula.name.length).toBeGreaterThan(3);
      expect(prob.requiredFormula.latex.length).toBeGreaterThan(3);
      expect(prob.requiredFormula.explanation.length).toBeGreaterThan(5);
      expect(prob.keywords.length).toBeGreaterThanOrEqual(3);
      expect(prob.faqs.length).toBeGreaterThanOrEqual(1);
      expect(prob.relatedSlugs.length).toBeGreaterThanOrEqual(2);
    }
  });
});
