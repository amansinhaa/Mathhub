import { FormulaEntry } from '@/types/formula';

export const algebra: FormulaEntry[] = [
  { id: 'alg-1', name: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', description: 'Roots of a quadratic equation ax^2 + bx + c = 0', category: 'algebra', tags: ['roots', 'equations', 'quadratic'] },
  { id: 'alg-2', name: 'Difference of Squares', latex: 'a^2 - b^2 = (a - b)(a + b)', description: 'Factoring difference of two squares', category: 'algebra', tags: ['factoring', 'polynomials'] },
  { id: 'alg-3', name: 'Sum of Cubes', latex: 'a^3 + b^3 = (a + b)(a^2 - ab + b^2)', description: 'Factoring sum of two cubes', category: 'algebra', tags: ['factoring', 'cubes'] },
  { id: 'alg-4', name: 'Difference of Cubes', latex: 'a^3 - b^3 = (a - b)(a^2 + ab + b^2)', description: 'Factoring difference of two cubes', category: 'algebra', tags: ['factoring', 'cubes'] },
  { id: 'alg-5', name: 'Binomial Theorem', latex: '(x+y)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^{n-k} y^k', description: 'Expansion of a binomial power', category: 'algebra', tags: ['expansion', 'series', 'binomial'] },
  { id: 'alg-6', name: 'Arithmetic Progression (nth Term)', latex: 'a_n = a_1 + (n-1)d', description: 'nth term of an AP with common difference d', category: 'algebra', tags: ['sequences', 'ap'] },
  { id: 'alg-7', name: 'Arithmetic Progression (Sum)', latex: 'S_n = \\frac{n}{2}(2a_1 + (n-1)d) = \\frac{n}{2}(a_1 + a_n)', description: 'Sum of first n terms of an AP', category: 'algebra', tags: ['series', 'ap'] },
  { id: 'alg-8', name: 'Geometric Progression (nth Term)', latex: 'a_n = a_1 r^{n-1}', description: 'nth term of a GP with common ratio r', category: 'algebra', tags: ['sequences', 'gp'] },
  { id: 'alg-9', name: 'Geometric Progression (Sum)', latex: 'S_n = \\frac{a_1(1-r^n)}{1-r} \\quad (r \\neq 1)', description: 'Sum of first n terms of a GP', category: 'algebra', tags: ['series', 'gp'] },
  { id: 'alg-10', name: 'Infinite Geometric Series', latex: 'S_\\infty = \\frac{a_1}{1-r} \\quad (|r| < 1)', description: 'Sum of infinite GP when ratio is strictly between -1 and 1', category: 'algebra', tags: ['series', 'infinite'] },
  { id: 'alg-11', name: "Vieta's Formulas (Quadratic)", latex: 'x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 x_2 = \\frac{c}{a}', description: 'Sum and product of roots of ax^2 + bx + c = 0', category: 'algebra', tags: ['roots', 'vieta', 'polynomials'] },
  { id: 'alg-12', name: 'Completing the Square', latex: 'ax^2 + bx + c = a\\left(x + \\frac{b}{2a}\\right)^2 + \\left(c - \\frac{b^2}{4a}\\right)', description: 'Rewriting quadratic into vertex form', category: 'algebra', tags: ['quadratic', 'factoring'] },
];
