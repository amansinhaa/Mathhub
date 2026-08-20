import { FormulaEntry } from '@/types/formula';

export const probability: FormulaEntry[] = [
  { id: 'prob-1', name: 'Permutations Formula', latex: 'P(n, r) = {}^n P_r = \\frac{n!}{(n-r)!}', description: 'Number of ordered arrangements of r elements from n', category: 'probability', tags: ['combinatorics', 'permutations'] },
  { id: 'prob-2', name: 'Combinations Formula', latex: 'C(n, r) = {}^n C_r = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}', description: 'Number of unordered selections of r elements from n', category: 'probability', tags: ['combinatorics', 'combinations'] },
  { id: 'prob-3', name: 'Addition Rule of Probability', latex: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)', description: 'Probability of union of two events', category: 'probability', tags: ['probability', 'union'] },
  { id: 'prob-4', name: 'Multiplication Rule', latex: 'P(A \\cap B) = P(A) \\cdot P(B|A)', description: 'Probability of simultaneous occurrence of two events', category: 'probability', tags: ['probability', 'intersection'] },
  { id: 'prob-5', name: 'Conditional Probability', latex: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)} \\quad (P(B) > 0)', description: 'Probability of event A occurring given event B has occurred', category: 'probability', tags: ['probability', 'conditional'] },
  { id: 'prob-6', name: "Bayes' Theorem", latex: 'P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)} = \\frac{P(B|A) P(A)}{\\sum P(B|A_i) P(A_i)}', description: 'Calculates posterior probability based on prior knowledge', category: 'probability', tags: ['probability', 'bayes'] },
  { id: 'prob-7', name: 'Binomial Distribution PMF', latex: 'P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}', description: 'Probability of k successes in n independent Bernoulli trials', category: 'probability', tags: ['distribution', 'binomial'] },
  { id: 'prob-8', name: 'Poisson Distribution PMF', latex: 'P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}', description: 'Probability of k events in a fixed interval with average rate λ', category: 'probability', tags: ['distribution', 'poisson'] },
  { id: 'prob-9', name: 'Expected Value (Discrete)', latex: 'E[X] = \\sum_{i} x_i \\cdot P(X = x_i)', description: 'Weighted average of all possible values of discrete random variable', category: 'probability', tags: ['statistics', 'mean', 'expectation'] },
  { id: 'prob-10', name: 'Variance & Standard Deviation', latex: '\\text{Var}(X) = E[X^2] - (E[X])^2, \\quad \\sigma = \\sqrt{\\text{Var}(X)}', description: 'Measure of dispersion of a random variable', category: 'probability', tags: ['statistics', 'variance'] },
  { id: 'prob-11', name: 'Standard Normal Distribution (PDF)', latex: 'f(z) = \\frac{1}{\\sqrt{2\\pi}} e^{-z^2/2}, \\quad z = \\frac{x - \\mu}{\\sigma}', description: 'Probability density function of standard normal variable', category: 'probability', tags: ['distribution', 'normal', 'z-score'] },
];
