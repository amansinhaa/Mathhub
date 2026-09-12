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

  // 1. System of equations (commas or semicolons separating equations with =)
  if (/[,;\n]/.test(rawInput) && (rawInput.match(/=/g) || []).length > 1) {
    return 'system';
  }

  // 2. Inequality
  if (/[<>]=?|<=|>=/.test(rawInput)) {
    return 'inequality';
  }

  // 3. ODE (contains derivatives like y', y'', dy/dx)
  if (/(?:y'+|d[a-zA-Z]\/d[a-zA-Z])/.test(rawInput)) {
    return 'ode';
  }

  // 4. Trigonometric (sin, cos, tan, sec, csc, cot with variable)
  const trigRegex = new RegExp(`\\b(?:sin|cos|tan|sec|csc|cot)\\b`, 'i');
  if (trigRegex.test(norm)) {
    return 'trigonometric';
  }

  // 5. Logarithmic (log, ln with variable)
  const logRegex = new RegExp(`(?:\\blog(?:_\\{?\\w+\\}?|\\d+)?|\\bln)\\s*\\(`, 'i');
  if (logRegex.test(norm) || /\b(?:log|ln)\b/i.test(norm)) {
    return 'logarithmic';
  }

  // 6. Exponential (variable in exponent: a^x, e^x, 2^(...))
  const expRegex = new RegExp(`(?:[0-9.]+|e|pi)\\s*\\^\\s*\\(?\\s*[^)]*${v}[^)]*\\)?|\\bexp\\s*\\(`, 'i');
  if (expRegex.test(norm)) {
    return 'exponential';
  }

  // 7. Radical (sqrt, cbrt, root, or fractional power with variable inside)
  const radRegex = new RegExp(`(?:\\bsqrt|\\bcbrt|\\broot)\\s*\\(|\\^\\s*\\(?\\s*\\d+\\s*\\/\\s*\\d+\\s*\\)?`, 'i');
  if (radRegex.test(norm)) {
    return 'radical';
  }

  // 8. Rational (variable in denominator or negative power: /x, /(x+1), x^(-1))
  const rationalRegex = new RegExp(`\\/\\s*\\(?\\s*[^)]*${v}[^)]*\\)?|\\^\\s*\\(?\\s*-\\d+`, 'i');
  if (rationalRegex.test(norm)) {
    return 'rational';
  }

  // 9. Absolute value equations
  if (/\|[^|]+\||\\?abs\s*\(/.test(norm)) {
    return 'absolute_value';
  }

  // 10. Polynomial Family (linear, quadratic, polynomial 3+)
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
