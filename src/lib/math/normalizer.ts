/**
 * Normalize mathematical expressions:
 * - Convert Unicode superscripts (x², x³, x⁴, etc.) to caret notation (x^2, x^3, x^4)
 * - Convert Unicode subscripts
 * - Support sqrt, cbrt shorthand
 * - Support common symbols (×, ÷, −, π)
 * - Validate for multi-variable expressions (y in an f(x) context)
 * - Auto-balance parentheses
 * - Auto-interpret expressions without = as = 0
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
 * - Implicit multiplication (4t, x(, )(, )2)
 */
export function normalizeExpression(input: string): string {
  let expr = input.trim();
  if (!expr) return '';

  // 1. Replace Unicode math operators and symbols
  expr = expr.replace(/×/g, '*');
  expr = expr.replace(/÷/g, '/');
  expr = expr.replace(/−/g, '-');    // Unicode minus
  expr = expr.replace(/π/g, 'pi');
  expr = expr.replace(/∛/g, 'cbrt');  // Cube root symbol
  expr = expr.replace(/√/g, 'sqrt');  // Square root symbol

  // Inverse trig and hyperbolic unicode notations
  expr = expr.replace(/sin⁻¹/g, 'asin');
  expr = expr.replace(/cos⁻¹/g, 'acos');
  expr = expr.replace(/tan⁻¹/g, 'atan');
  expr = expr.replace(/sinh⁻¹/g, 'asinh');
  expr = expr.replace(/cosh⁻¹/g, 'acosh');
  expr = expr.replace(/tanh⁻¹/g, 'atanh');

  // Greek and physics symbols
  expr = expr.replace(/θ/g, 'theta');
  expr = expr.replace(/α/g, 'alpha');
  expr = expr.replace(/β/g, 'beta');
  expr = expr.replace(/γ/g, 'gamma');
  expr = expr.replace(/λ/g, 'lambda');
  expr = expr.replace(/μ/g, 'mu');
  expr = expr.replace(/σ/g, 'sigma');
  expr = expr.replace(/ω/g, 'omega');
  expr = expr.replace(/φ/g, 'phi');
  expr = expr.replace(/Δ/g, 'Delta');

  // Natural log
  expr = expr.replace(/\bln\s*\(/g, 'log(');

  // Ensure cbrt and sqrt with adjacent numbers without parens work: ∛27 -> cbrt(27), √16 -> sqrt(16)
  expr = expr.replace(/cbrt\s*([0-9.]+)/g, 'cbrt($1)');
  expr = expr.replace(/sqrt\s*([0-9.]+)/g, 'sqrt($1)');

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

  // 4. Handle implicit multiplication
  // Known function names to preserve before opening parenthesis
  const reservedFuncs = [
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs',
    'ceil', 'floor', 'round', 'sign', 'min', 'max',
    'nthRoot', 'pow', 'mod'
  ];

  // Letter followed by digits followed by letter: i2x → i*2*x, a2x → a*2*x, m3x → m*3*x
  expr = expr.replace(/([a-zA-Z])(\d+)([a-zA-Z])/g, '$1*$2*$3');

  // Letter with space before digit: i 2x → i*2x
  expr = expr.replace(/([a-zA-Z])\s+(\d)/g, '$1*$2');

  // Digit followed by letter: 3x → 3*x
  expr = expr.replace(/(\d)([a-zA-Z])/g, '$1*$2');

  // Letter followed by opening paren (exclude known function names like sin(, cos(, etc.)
  // Match a word preceding '(' and check if it's a known function
  expr = expr.replace(/\b([a-zA-Z]+)\s*\(/g, (match, word) => {
    if (reservedFuncs.includes(word.toLowerCase())) {
      return `${word}(`;
    }
    // E.g. x(x+1) -> x*(x+1) or 2a(b) -> 2a*(b)
    return `${word}*(`;
  });

  // Closing paren followed by letter or opening paren: )(  → )*(, )x → )*x
  expr = expr.replace(/\)([a-zA-Z(])/g, ')*$1');
  // Closing paren followed by digit: )2 → )*2
  expr = expr.replace(/\)(\d)/g, ')*$1');
  // Digit followed by opening paren: 2(x+1) → 2*(x+1)
  expr = expr.replace(/(\d)(\()/g, '$1*$2');

  // 5. Replace common function shorthand
  // "√(expr)" is already handled by step 1 (√ → sqrt)
  // "cbrt(expr)" works natively in mathjs

  return expr;
}

/**
 * Auto-balance unmatched parentheses by appending or prepending as needed.
 */
export function autoBalanceParens(expr: string): string {
  if (!expr) return expr;

  let depth = 0;
  let prependCount = 0;

  for (const ch of expr) {
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      if (depth > 0) {
        depth--;
      } else {
        // Unmatched closing paren
        prependCount++;
      }
    }
  }

  // depth = unmatched opening parens → append closing
  // prependCount = unmatched closing parens → prepend opening
  return '('.repeat(prependCount) + expr + ')'.repeat(depth);
}

/**
 * Auto-interpret an expression without an = sign as = 0.
 * Returns the (possibly modified) expression and metadata about interpretation.
 */
export function autoInterpretEquals(expr: string): {
  expr: string;
  interpreted: boolean;
  interpretedAs?: string;
} {
  const trimmed = expr.trim();
  if (!trimmed) return { expr: trimmed, interpreted: false };

  // If there's already an = sign, no interpretation needed
  if (trimmed.includes('=')) {
    return { expr: trimmed, interpreted: false };
  }

  // Check if it contains a variable (not just a number)
  const reserved = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs',
    'ceil', 'floor', 'round', 'sign', 'min', 'max',
    'pi', 'PI', 'e', 'i',
    'nthRoot', 'pow', 'mod',
  ]);

  const tokens = trimmed.match(/[a-zA-Z]+/g) || [];
  const hasVariable = tokens.some(tok => tok.length === 1 && !reserved.has(tok));

  if (!hasVariable) {
    return { expr: trimmed, interpreted: false };
  }

  return {
    expr: `${trimmed} = 0`,
    interpreted: true,
    interpretedAs: `${trimmed} = 0`,
  };
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
  { input: '(x+1)(x-1)', description: 'auto-multiplied' },
];

/**
 * Quick heuristic equation degree detector for real-time UI badges.
 * Returns degree number: 1 (linear), 2 (quadratic), 3 (cubic), 4+, or null if non-polynomial/unknown.
 * CRITICAL: Only triggers if the input actually contains an algebraic variable (e.g. x, y, t)!
 */
export function quickDegreeDetect(input: string): { degree: number; label: string } | null {
  if (!input || !input.trim()) return null;
  const clean = normalizeExpression(input);

  // Extract variables: must have single-letter variables not part of functions (sin, cos, sqrt, etc.)
  const reserved = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs', 'pi', 'e'
  ]);
  const tokens = clean.match(/[a-zA-Z]+/g) || [];
  const hasVariable = tokens.some((t) => t.length === 1 && !reserved.has(t.toLowerCase()));

  // If there is NO variable, this is just arithmetic numbers, NOT an algebraic equation!
  if (!hasVariable) return null;

  // Check for powers like x^4, x^(3), x^2, x³, x²
  const powerMatches = clean.match(/[a-zA-Z]\s*\^\s*\(?([0-9]+)\)?/g);
  let maxExp = 0;
  if (powerMatches) {
    for (const m of powerMatches) {
      const match = m.match(/[0-9]+/);
      if (match) {
        const p = parseInt(match[0], 10);
        if (!isNaN(p) && p > maxExp) maxExp = p;
      }
    }
  }

  // Also check for Unicode powers like x³, x² (if not normalized)
  if (clean.match(/[a-zA-Z]\s*(\^3|³)/)) maxExp = Math.max(maxExp, 3);
  if (clean.match(/[a-zA-Z]\s*(\^2|²)/)) maxExp = Math.max(maxExp, 2);

  if (maxExp >= 4) return { degree: maxExp, label: `Polynomial (Degree ${maxExp})` };
  if (maxExp === 3) return { degree: 3, label: 'Cubic (3rd Degree)' };
  if (maxExp === 2) return { degree: 2, label: 'Quadratic (2nd Degree)' };
  if (maxExp === 0 && hasVariable) return { degree: 1, label: 'Linear (1st Degree)' };

  return null;
}

/**
 * Convert an ASCII math expression (with sqrt, *, /, ^) into beautiful formatted LaTeX.
 */
export function expressionToLatex(expr: string): string {
  if (!expr || !expr.trim()) return '';
  let tex = expr.trim();

  // If already pure LaTeX
  if (tex.includes('\\frac') || tex.includes('\\sqrt')) return tex;

  const toTexSingle = (s: string) => {
    return s
      .replace(/\*/g, ' \\cdot ')
      .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
      .replace(/cbrt\(([^)]+)\)/g, '\\sqrt[3]{$1}')
      .replace(/\^(\d+)/g, '^{$1}');
  };

  if (tex.includes('=')) {
    const parts = tex.split('=');
    return `${toTexSingle(parts[0].trim())} = ${toTexSingle(parts[1].trim())}`;
  }
  return toTexSingle(tex);
}

/**
 * Format an expression string to always use exact mathematical symbols for human display:
 * Converts cbrt(x) -> ∛(x), sqrt(x) -> √(x), * -> ×, / -> ÷, pi -> π, asin -> sin⁻¹, etc.
 */
export function formatExpressionForDisplay(rawExpr: string): string {
  if (!rawExpr || !rawExpr.trim()) return '';
  let str = rawExpr;

  // Functions to exact unicode symbols
  str = str.replace(/\bcbrt\s*\(/g, '∛(');
  str = str.replace(/\bsqrt\s*\(/g, '√(');
  str = str.replace(/\basin\s*\(/g, 'sin⁻¹(');
  str = str.replace(/\bacos\s*\(/g, 'cos⁻¹(');
  str = str.replace(/\batan\s*\(/g, 'tan⁻¹(');
  str = str.replace(/\basinh\s*\(/g, 'sinh⁻¹(');
  str = str.replace(/\bacosh\s*\(/g, 'cosh⁻¹(');
  str = str.replace(/\batanh\s*\(/g, 'tanh⁻¹(');
  str = str.replace(/\blog10\s*\(/g, 'log(');
  str = str.replace(/\blog\s*\(/g, 'ln(');

  // Greek constants and symbols
  str = str.replace(/\bpi\b/g, 'π');
  str = str.replace(/\btheta\b/g, 'θ');
  str = str.replace(/\balpha\b/g, 'α');
  str = str.replace(/\bbeta\b/g, 'β');
  str = str.replace(/\bgamma\b/g, 'γ');
  str = str.replace(/\blambda\b/g, 'λ');
  str = str.replace(/\bmu\b/g, 'μ');
  str = str.replace(/\bsigma\b/g, 'σ');
  str = str.replace(/\bomega\b/g, 'ω');
  str = str.replace(/\bphi\b/g, 'φ');
  str = str.replace(/\bDelta\b/g, 'Δ');

  // Operators
  str = str.replace(/\s*\*\s*/g, ' × ');
  str = str.replace(/\s*\/\s*/g, ' ÷ ');
  str = str.replace(/\s*−\s*/g, ' − ');

  // Powers
  str = str.replace(/\^2\b/g, '²');
  str = str.replace(/\^3\b/g, '³');
  str = str.replace(/\^-1\b/g, '⁻¹');

  return str;
}


