import { FormulaEntry } from '@/types/formula';

export const calculus: FormulaEntry[] = [
  { id: 'calc-1', name: 'Power Rule (Derivative)', latex: '\\frac{d}{dx}[x^n] = n x^{n-1}', description: 'Derivative of a power function', category: 'calculus', level: 'higher_ed', tags: ['derivative', 'power'] },
  { id: 'calc-2', name: 'Product Rule', latex: '\\frac{d}{dx}[u \\cdot v] = u\'v + uv\'', description: 'Derivative of product of two functions', category: 'calculus', level: 'higher_ed', tags: ['derivative', 'product'] },
  { id: 'calc-3', name: 'Quotient Rule', latex: '\\frac{d}{dx}\\left[\\frac{u}{v}\\right] = \\frac{u\'v - uv\'}{v^2}', description: 'Derivative of quotient of two functions', category: 'calculus', level: 'higher_ed', tags: ['derivative', 'quotient'] },
  { id: 'calc-4', name: 'Chain Rule', latex: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)', description: 'Derivative of composite functions', category: 'calculus', level: 'higher_ed', tags: ['derivative', 'chain'] },
  { id: 'calc-5', name: 'Derivative of Exponential', latex: '\\frac{d}{dx}[e^x] = e^x, \\quad \\frac{d}{dx}[a^x] = a^x \\ln a', description: 'Derivative of natural and base-a exponential functions', category: 'calculus', level: 'higher_ed', tags: ['derivative', 'exponential'] },
  { id: 'calc-6', name: 'Derivative of Logarithm', latex: '\\frac{d}{dx}[\\ln x] = \\frac{1}{x}, \\quad \\frac{d}{dx}[\\log_a x] = \\frac{1}{x \\ln a}', description: 'Derivative of natural and base-a logarithms', category: 'calculus', level: 'higher_ed', tags: ['derivative', 'logarithm'] },
  { id: 'calc-7', name: 'Standard Trig Derivatives', latex: '\\frac{d}{dx}[\\sin x] = \\cos x, \\quad \\frac{d}{dx}[\\cos x] = -\\sin x, \\quad \\frac{d}{dx}[\\tan x] = \\sec^2 x', description: 'Derivatives of basic trigonometric functions', category: 'calculus', level: 'higher_ed', tags: ['derivative', 'trigonometry'] },
  { id: 'calc-8', name: 'Power Rule (Integral)', latex: '\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)', description: 'Indefinite integral of power function', category: 'calculus', level: 'higher_ed', tags: ['integral', 'power'] },
  { id: 'calc-9', name: 'Reciprocal Integral', latex: '\\int \\frac{1}{x} \\, dx = \\ln|x| + C', description: 'Integral of 1/x yielding natural logarithm', category: 'calculus', level: 'higher_ed', tags: ['integral', 'logarithm'] },
  { id: 'calc-10', name: 'Integration by Parts', latex: '\\int u \\, dv = uv - \\int v \\, du', description: 'Standard integration technique for products', category: 'calculus', level: 'higher_ed', tags: ['integral', 'parts'] },
  { id: 'calc-11', name: 'Fundamental Theorem of Calculus', latex: '\\int_a^b f(x) \\, dx = F(b) - F(a)', description: 'Evaluating definite integral from antiderivative F(x)', category: 'calculus', level: 'higher_ed', tags: ['integral', 'theorem'] },
  { id: 'calc-12', name: "L'Hôpital's Rule", latex: '\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f\'(x)}{g\'(x)}', description: 'Evaluating indeterminate forms (0/0 or ∞/∞)', category: 'calculus', level: 'higher_ed', tags: ['limit', 'lhopital'] },
];
