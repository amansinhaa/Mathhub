import { FormulaEntry } from '@/types/formula';

export const logarithms: FormulaEntry[] = [
  { id: 'log-1', name: 'Product Rule for Logs', latex: '\\log_b(xy) = \\log_b(x) + \\log_b(y)', description: 'Logarithm of a product equals sum of logarithms', category: 'logarithms', tags: ['product', 'logarithm'] },
  { id: 'log-2', name: 'Quotient Rule for Logs', latex: '\\log_b\\left(\\frac{x}{y}\\right) = \\log_b(x) - \\log_b(y)', description: 'Logarithm of a quotient equals difference of logarithms', category: 'logarithms', tags: ['quotient', 'logarithm'] },
  { id: 'log-3', name: 'Power Rule for Logs', latex: '\\log_b(x^k) = k \\log_b(x)', description: 'Exponent comes out as a multiplier', category: 'logarithms', tags: ['power', 'exponent', 'logarithm'] },
  { id: 'log-4', name: 'Change of Base Formula', latex: '\\log_b(x) = \\frac{\\log_k(x)}{\\log_k(b)} = \\frac{\\ln x}{\\ln b} = \\frac{\\log_{10} x}{\\log_{10} b}', description: 'Converting logarithm to a different base k', category: 'logarithms', tags: ['base', 'conversion'] },
  { id: 'log-5', name: 'Identity & Zero Properties', latex: '\\log_b(b) = 1, \\quad \\log_b(1) = 0', description: 'Basic identity properties of logarithms', category: 'logarithms', tags: ['identity', 'logarithm'] },
  { id: 'log-6', name: 'Inverse Properties', latex: 'b^{\\log_b x} = x, \\quad \\log_b(b^x) = x', description: 'Logarithms and exponentials are inverse functions', category: 'logarithms', tags: ['inverse', 'exponential'] },
  { id: 'log-7', name: 'Natural Log & Euler Constant', latex: '\\ln(x) = \\log_e(x), \\quad e = \\lim_{n \\to \\infty}\\left(1 + \\frac{1}{n}\\right)^n \\approx 2.71828', description: 'Definition of natural logarithm and base e', category: 'logarithms', tags: ['natural', 'euler'] },
  { id: 'log-8', name: 'Exponential Laws', latex: 'a^m \\cdot a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}, \\quad (a^m)^n = a^{mn}', description: 'Fundamental laws of exponent arithmetic', category: 'logarithms', tags: ['exponential', 'powers'] },
];
