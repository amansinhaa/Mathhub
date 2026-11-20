import type { EquationType } from '@/types/solver';
import { normalizeExpression } from './normalizer';
import { detectVariable } from './solver';

/**
 * Classifies an equation string into one of the mathematical families:
 * - linear
 * - quadratic
 * - polynomial (degree 3+)
 * - rational (variable in denominator)
 * - radical (variable inside sqrt/nth-root)
 * - trigonometric (sin, cos, tan, etc.)
 * - exponential (variable in exponent)
 * - logarithmic (log, ln with variable)
 * - system (multiple simultaneous equations)
 * - inequality
 * - ode
 */
export function classifyEquation(rawInput: string, specifiedVar?: string): EquationType {
  const norm = normalizeExpression(rawInput);
  const v = specifiedVar || detectVariable(rawInput);

  // 1. Variable-free arithmetic evaluation or equality check (e.g. 8/(2/3) or 3 = 1 - 2(-7))
  const reservedLetters = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs', 'pi', 'e', 'i']);
  const allLetterTokens = (rawInput.match(/[a-zA-Z]+/g) || []).filter(t => !reservedLetters.has(t.toLowerCase()));
  if (allLetterTokens.length === 0) {
    if (rawInput.includes('=')) {
      return 'arithmetic_check';
    }
    return 'arithmetic';
  }

  // 2. System of equations (commas or semicolons separating equations with =)
  if (/[,;\n]/.test(rawInput) && (rawInput.match(/=/g) || []).length > 1) {
    return 'system';
  }

  // 3. Inequality
  if (/[<>]=?|<=|>=/.test(rawInput)) {
    return 'inequality';
  }

  // 4. ODE (contains derivatives like y', y'', dy/dx)
  if (/(?:y'+|d[a-zA-Z]\/d[a-zA-Z])/.test(rawInput)) {
    return 'ode';
  }

  // 5. Trigonometric (sin, cos, tan, sec, csc, cot with variable)
  const trigRegex = new RegExp(`\\b(?:sin|cos|tan|sec|csc|cot)\\b`, 'i');
  if (trigRegex.test(norm)) {
    return 'trigonometric';
  }

  // 6. Logarithmic (log, ln with variable)
  const logRegex = new RegExp(`(?:\\blog(?:_\\{?\\w+\\}?|\\d+)?|\\bln)\\s*\\(`, 'i');
  if (logRegex.test(norm) || /\b(?:log|ln)\b/i.test(norm)) {
    return 'logarithmic';
  }

  // 7. Exponential (variable in exponent: a^x, e^x, 2^(...), 6^3(x), 5 * 6^(3x), or product with e^x like x^2 * e^x)
  const expRegex = new RegExp(`(?:[0-9.]+|e|pi)\\s*\\^\\s*(?:\\(?\\s*[^)]*${v}[^)]*\\)?|\\d*\\s*\\(?\\s*[^)]*${v}[^)]*\\)?)|\\bexp\\s*\\(|e\\s*\\^\\s*|\\*\\s*e\\^`, 'i');
  if (expRegex.test(norm) || expRegex.test(rawInput) || /(?:[0-9.]+|e|pi)\s*\^\s*\d*\s*\(?[^)]*[a-zA-Z]/i.test(rawInput)) {
    return 'exponential';
  }

  // 8. Radical (sqrt, cbrt, root, or fractional power with variable inside)
  const radRegex = new RegExp(`(?:\\bsqrt|\\bcbrt|\\broot)\\s*\\(|\\^\\s*\\(?\\s*\\d+\\s*\\/\\s*\\d+\\s*\\)?`, 'i');
  if (radRegex.test(norm)) {
    return 'radical';
  }

  // 9. Rational (variable in denominator or negative power: /x, /(x+1), x^(-1))
  const rationalRegex = new RegExp(`\\/\\s*\\(?\\s*[^)]*${v}[^)]*\\)?|\\^\\s*\\(?\\s*-\\d+`, 'i');
  if (rationalRegex.test(norm)) {
    return 'rational';
  }

  // 10. Absolute value equations
  if (/\|[^|]+\||\\?abs\s*\(/.test(norm)) {
    return 'absolute_value';
  }

  // 11. Two-variable linear equation (e.g. y = 10 - 3x, 3x + 2y = 12, Ax + By = C)
  const distinctVars = Array.from(new Set(allLetterTokens.filter(t => t.length === 1)));
  if (distinctVars.length === 2 && rawInput.includes('=')) {
    const hasPowers = /\^[2-9]|\^\([^)]+\)/.test(norm);
    const hasProductVars = new RegExp(`${distinctVars[0]}\\s*\\*?\\s*${distinctVars[1]}|${distinctVars[1]}\\s*\\*?\\s*${distinctVars[0]}`).test(norm);
    if (!hasPowers && !hasProductVars) {
      return 'linear_2var';
    }
  }

  // 12. Polynomial Family (linear, quadratic, polynomial 3+)
  const clean = norm.replace(/\s+/g, '');
  const powerMatches = Array.from(clean.matchAll(new RegExp(`${v}\\^(\\d+)`, 'g')));
  let maxDegree = 0;
  if (clean.includes(v)) maxDegree = 1;
  for (const m of powerMatches) {
    const deg = parseInt(m[1], 10);
    if (!isNaN(deg) && deg > maxDegree) {
      maxDegree = deg;
    }
  }

  if (maxDegree === 1) return 'linear';
  if (maxDegree === 2) return 'quadratic';
  if (maxDegree >= 3) return 'polynomial';

  return 'polynomial';
}
