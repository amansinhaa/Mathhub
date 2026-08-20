/**
 * Normalize mathematical expressions:
 * - Convert Unicode superscripts (x², x³, x⁴, etc.) to caret notation (x^2, x^3, x^4)
 * - Convert Unicode subscripts
 * - Support sqrt, cbrt shorthand
 * - Support common symbols (×, ÷, −, π)
 * - Validate for multi-variable expressions (y in an f(x) context)
 */

/** Map of Unicode superscript characters to their digit values. */
const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁻': '-', '⁺': '+',
};

/** Map of Unicode subscript characters to their digit values. */
const SUBSCRIPT_MAP: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
};

/**
 * Normalize a mathematical expression string:
 * - Unicode superscripts → ^n
 * - Unicode math symbols → ASCII equivalents
 * - Common shorthand expansions
 */
export function normalizeExpression(input: string): string {
  let expr = input.trim();
  if (!expr) return '';

  // 1. Replace Unicode math operators
  expr = expr.replace(/×/g, '*');
  expr = expr.replace(/÷/g, '/');
  expr = expr.replace(/−/g, '-');    // Unicode minus
  expr = expr.replace(/π/g, 'pi');
  expr = expr.replace(/√/g, 'sqrt');

  // 2. Convert Unicode superscripts to ^(digits)
  // Match: a letter/digit/closing paren followed by one or more superscript chars
  expr = expr.replace(
    /([a-zA-Z0-9\)])((?:[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺])+)/g,
    (_, prefix, supers) => {
      let exponent = '';
      for (const ch of supers) {
        exponent += SUPERSCRIPT_MAP[ch] || ch;
      }
      return `${prefix}^(${exponent})`;
    }
  );

  // Also handle standalone superscripts at start (unlikely but safe)
  expr = expr.replace(
    /((?:[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺])+)/g,
    (supers) => {
      let exponent = '';
      for (const ch of supers) {
        exponent += SUPERSCRIPT_MAP[ch] || ch;
      }
      return `^(${exponent})`;
    }
  );

  // 3. Convert Unicode subscripts (for display, less critical)
  for (const [sub, digit] of Object.entries(SUBSCRIPT_MAP)) {
    expr = expr.replace(new RegExp(sub, 'g'), digit);
  }

  // 4. Handle implicit multiplication: "2x" → "2*x", "x(..." → "x*("
  // Letter preceded by digit: 3x → 3*x
  expr = expr.replace(/(\d)([a-zA-Z])/g, '$1*$2');
  // Closing paren followed by letter or opening paren: )(  → )*(
  expr = expr.replace(/\)([a-zA-Z(])/g, ')*$1');

  // 5. Replace common function shorthand
  // "√(expr)" is already handled by step 1 (√ → sqrt)
  // "cbrt(expr)" works natively in mathjs

  return expr;
}

/**
 * Detect if an expression contains variables other than the primary one.
 * Returns the set of extra variable names found (e.g., {'y'} for "x^2 + y^2").
 */
export function detectExtraVariables(expr: string, primaryVar: string = 'x'): string[] {
  // Remove known function names and constants
  const reserved = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs',
    'ceil', 'floor', 'round', 'sign', 'min', 'max',
    'pi', 'PI', 'e', 'i',
    'nthRoot', 'pow', 'mod',
  ]);

  // Find all alphabetic tokens
  const tokens = expr.match(/[a-zA-Z]+/g) || [];
  const extraVars = new Set<string>();

  for (const tok of tokens) {
    if (tok !== primaryVar && !reserved.has(tok) && tok.length === 1) {
      extraVars.add(tok);
    }
  }

  return Array.from(extraVars);
}

/**
 * Available syntax reference for display in help tooltips.
 */
export const SYNTAX_HELP = [
  { input: 'x²  or  x^2', description: 'x squared' },
  { input: 'x³  or  x^3', description: 'x cubed' },
  { input: 'x^(1/3)', description: 'cube root of x' },
  { input: 'sqrt(x)  or  √x', description: 'square root' },
  { input: 'cbrt(x)', description: 'cube root' },
  { input: 'sin(x), cos(x), tan(x)', description: 'trig functions' },
  { input: 'asin(x), acos(x), atan(x)', description: 'inverse trig' },
  { input: 'log(x)  or  ln(x)', description: 'natural log' },
  { input: 'log(x, 10)', description: 'log base 10' },
  { input: 'exp(x)', description: 'e^x' },
  { input: 'abs(x)', description: 'absolute value' },
  { input: 'pi  or  π', description: '3.14159...' },
  { input: '2x  →  2*x', description: 'implicit multiplication' },
];
