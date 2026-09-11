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
  expr = expr.replace(/[×·⋅∙•]/g, '*');
  expr = expr.replace(/\\div\b/g, '÷');
  if (expr.includes('÷')) {
    const divParts = expr.split('÷');
    if (divParts.length === 2) {
      expr = `(${divParts[0].trim()})/(${divParts[1].trim()})`;
    } else {
      expr = expr.replace(/÷/g, '/');
    }
  }
  expr = expr.replace(/[−–—]/g, '-');    // Unicode minus, en-dash, em-dash
  expr = expr.replace(/＝/g, '=');       // Fullwidth equals
  expr = expr.replace(/π/g, 'pi');
  expr = expr.replace(/∛/g, 'cbrt');  // Cube root symbol
  expr = expr.replace(/√/g, 'sqrt');  // Square root symbol

  // LaTeX conversions
  expr = expr.replace(/\\sqrt\s*\{([^\}]+)\}/g, 'sqrt($1)');
  expr = expr.replace(/\\sqrt\s*\(/g, 'sqrt(');
  expr = expr.replace(/\\cbrt\s*\{([^\}]+)\}/g, 'cbrt($1)');
  expr = expr.replace(/\\cbrt\s*\(/g, 'cbrt(');
  expr = expr.replace(/\\sqrt\b/g, 'sqrt');
  expr = expr.replace(/\\cdot\b/g, '*');
  expr = expr.replace(/\\times\b/g, '*');
  expr = expr.replace(/\\ast\b/g, '*');
  expr = expr.replace(/\\bullet\b/g, '*');
  expr = expr.replace(/\\left\b/g, '');
  expr = expr.replace(/\\right\b/g, '');

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

  // 4. FIRST: Normalize trig notation BEFORE implicit multiplication
  //    (otherwise implicit mul rules mangle sin^2(x) → sin^2*(x))
  const trigNames = 'sin|cos|tan|sec|csc|cot|sinh|cosh|tanh|asin|acos|atan';

  // 4a. Convert trig powers: sin^2(x) → (sin(x))^2, sin^(2)(x) → (sin(x))^2
  //     Use (?<![a-zA-Z]) instead of \b because \b doesn't fire between digit+letter (e.g. "2sin")
  expr = expr.replace(new RegExp(`(?<![a-zA-Z])(${trigNames})\\^\\(?([0-9.]+)\\)?\\s*\\(([^)]+)\\)`, 'gi'), '($1($3))^$2');
  // Without parentheses on argument: sin^2x → (sin(x))^2, sin^2 x → (sin(x))^2
  expr = expr.replace(new RegExp(`(?<![a-zA-Z])(${trigNames})\\^\\(?([0-9.]+)\\)?\\s*([a-zA-Z])(?![a-zA-Z(])`, 'gi'), '($1($3))^$2');

  // 4b. Handle bare trig without parentheses: sinx → sin(x), cos 2x → cos(2x), cot x → cot(x)
  //     Match trig name followed by optional space + argument (letter or digit+letter)
  //     Only when NOT already followed by '(' or '^'
  expr = expr.replace(new RegExp(`(?<![a-zA-Z])(${trigNames})\\s*([0-9]*[a-zA-Z])(?![a-zA-Z(^])`, 'gi'), (match, fn, arg) => {
    // Don't match if arg itself forms a longer reserved word (e.g. 'sine' shouldn't match 'sin' + 'e')
    const remaining = match.slice(fn.length).trim();
    if (remaining.length > 2) return match; // likely not a single-var argument
    return `${fn}(${arg})`;
  });

  // 5. Handle implicit multiplication
  // Known function names to preserve before opening parenthesis
  const reservedFuncs = [
    'sin', 'cos', 'tan', 'sec', 'csc', 'cot',
    'asin', 'acos', 'atan', 'asec', 'acsc', 'acot',
    'sinh', 'cosh', 'tanh', 'sech', 'csch', 'coth',
    'asinh', 'acosh', 'atanh',
    'log', 'ln', 'log2', 'log10', 'exp', 'sqrt', 'cbrt', 'abs',
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
  expr = expr.replace(/\b([a-zA-Z0-9_]+)\s*\(/g, (match, word) => {
    if (reservedFuncs.includes(word.toLowerCase()) || /^log_\d+$/i.test(word) || /^log_\{\d+\}$/i.test(word)) {
      return `${word}(`;
    }
    // E.g. x(x+1) → x*(x+1) or 2a(b) → 2a*(b)
    return `${word}*(`;
  });

  // Closing paren followed by letter or opening paren: )(  → )*(, )x → )*x
  expr = expr.replace(/\)([a-zA-Z(])/g, ')*$1');
  // Closing paren followed by digit: )2 → )*2
  expr = expr.replace(/\)(\d)/g, ')*$1');
  // Digit followed by opening paren: 2(x+1) → 2*(x+1) (except subscript bases like log_2(x))
  expr = expr.replace(/(\d+)\s*\(/g, (m, digits, offset, str) => {
    if (offset > 0 && str[offset - 1] === '_') {
      return `${digits}(`;
    }
    return `${digits}*(`;
  });

  // 6. Replace common function shorthand
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

  // Detect ODEs (y', dy/dx, y'')
  if (/y''|y'|dy\/dx|d\^2y\/dx\^2/i.test(input)) {
    return { degree: 0, label: 'Differential Equation (ODE)' };
  }

  // Detect radical expressions/equations
  if (/sqrt|cbrt|√|∛/.test(clean)) {
    if (clean.includes('=')) {
      return { degree: 0, label: 'Radical Equation' };
    }
    return { degree: 0, label: 'Radical Expression' };
  }

  // Detect transcendental equations (exponential, trig, log with equals)
  if (/(?:exp\b|e\^|\bsin\b|\bcos\b|\btan\b|\bln\b|\blog\b)/i.test(clean) && clean.includes('=')) {
    return { degree: 0, label: 'Transcendental Equation' };
  }

  // Detect parametric equations (e.g. 2x^2 + 3x - m + 2)
  const alphaTokens = (clean.match(/[a-zA-Z]+/g) || []).filter(
    (t) => t.length === 1 && !/^(sin|cos|tan|log|ln|exp|sqrt|abs|pi|e|i)$/i.test(t)
  );
  const uniqueVars = Array.from(new Set(alphaTokens));
  if (uniqueVars.length > 1) {
    return { degree: 0, label: 'Parametric Equation' };
  }

  // Extract variables: must have single-letter variables not part of functions (sin, cos, sqrt, etc.)
  const reserved = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs', 'pi', 'e'
  ]);
  const tokens = clean.match(/[a-zA-Z]+/g) || [];
  const varsFound = new Set(tokens.filter((t) => t.length === 1 && !reserved.has(t.toLowerCase())));
  const hasVariable = varsFound.size > 0;

  // If there is NO variable, this is just arithmetic numbers, NOT an algebraic equation!
  if (!hasVariable) return null;

  // Detect multivariate or algebraic expressions without equals
  if (!clean.includes('=')) {
    if (varsFound.size > 1) {
      return { degree: 0, label: 'Algebraic Expression' };
    }
    if (/\(\s*[+-]\s*\d*[a-zA-Z]?\s*\)/.test(clean) || /\d+\s*\*?\s*\([^()]+\)/.test(clean)) {
      return { degree: 0, label: 'Algebraic Simplification' };
    }
  }

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

function convertBalancedFunctions(s: string): string {
  let result = '';
  let i = 0;
  while (i < s.length) {
    if (s.startsWith('sqrt(', i) || s.startsWith('\\sqrt(', i)) {
      const isBackslash = s.startsWith('\\sqrt(', i);
      const startIdx = i + (isBackslash ? 6 : 5);
      let depth = 1;
      let j = startIdx;
      while (j < s.length && depth > 0) {
        if (s[j] === '(') depth++;
        else if (s[j] === ')') depth--;
        j++;
      }
      if (depth === 0) {
        const inner = s.slice(startIdx, j - 1);
        result += '\\sqrt{' + convertBalancedFunctions(inner) + '}';
        i = j;
        continue;
      }
    } else if (s.startsWith('cbrt(', i) || s.startsWith('\\cbrt(', i)) {
      const isBackslash = s.startsWith('\\cbrt(', i);
      const startIdx = i + (isBackslash ? 6 : 5);
      let depth = 1;
      let j = startIdx;
      while (j < s.length && depth > 0) {
        if (s[j] === '(') depth++;
        else if (s[j] === ')') depth--;
        j++;
      }
      if (depth === 0) {
        const inner = s.slice(startIdx, j - 1);
        result += '\\sqrt[3]{' + convertBalancedFunctions(inner) + '}';
        i = j;
        continue;
      }
    }
    result += s[i];
    i++;
  }
  return result;
}

/**
 * Convert an ASCII math expression (with sqrt, *, /, ^) into beautiful formatted LaTeX.
 */
export function expressionToLatex(expr: string): string {
  if (!expr || !expr.trim()) return '';
  let tex = expr.trim();

  const toTexSingle = (s: string) => {
    let res = convertBalancedFunctions(s);
    // Format trig powers: sin^2(x) -> \sin^2(x), sin^2 x -> \sin^2(x)
    res = res.replace(/(?<![a-zA-Z])(sin|cos|tan|sec|csc|cot)\^(\d+)\s*\(([^)]+)\)/gi, '\\$1^{$2}($3)');
    res = res.replace(/(?<![a-zA-Z])(sin|cos|tan|sec|csc|cot)\^(\d+)\s*([a-zA-Z])(?![a-zA-Z])/gi, '\\$1^{$2}($3)');
    res = res.replace(/(?<![a-zA-Z])(sin|cos|tan|sec|csc|cot)\s*\(([^)]+)\)/gi, '\\$1($2)');
    res = res.replace(/(?<![a-zA-Z])(sin|cos|tan|sec|csc|cot)\s*([a-zA-Z])(?![a-zA-Z])/gi, '\\$1($2)');
    // Powers with parentheses: ^(-2) or ^(7) -> ^{...}
    res = res.replace(/\^\(([^)]+)\)/g, '^{$1}');
    // Powers with single token / number / var without braces: x^2, y^12 -> ^{...}
    res = res.replace(/\^([0-9a-zA-Z]+)/g, '^{$1}');
    // Fix double braces if any e.g. ^{{7}}
    res = res.replace(/\^\{\{([^}]+)\}\}/g, '^{$1}');
    // Multiplication
    res = res.replace(/\*/g, ' \\cdot ');
    res = res.replace(/\\times/g, ' \\cdot ');
    return res;
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

/**
 * Clean and normalize copied/pasted mathematical text into standard caret/math notation:
 * - Detects equations pasted from web/LaTeX/Word where powers lost carets:
 *   e.g. "2x4 - 9x3 + 14x2 - 9x + 2 = 0" -> "2x^4 - 9x^3 + 14x^2 - 9x + 2 = 0"
 * - Converts HTML <sup>...</sup> and <sub>...</sub>
 * - Converts LaTeX ^{...} braces
 * - Converts Unicode superscripts (x², x³, x⁴)
 */
export function cleanPastedMath(rawText: string): string {
  if (!rawText) return '';
  let text = rawText;

  // 1. Clean HTML markup if pasted from rich text (Google Docs, Wikipedia, Web pages)
  text = text.replace(/<sup[^>]*>([\s\S]*?)<\/sup>/gi, (_m, g1) => `^(${g1.trim()})`);
  text = text.replace(/<sub[^>]*>([\s\S]*?)<\/sub>/gi, (_m, g1) => `_(${g1.trim()})`);
  text = text.replace(/<[^>]+>/g, ' ');

  // 2. Convert LaTeX superscript braces: x^{4} -> x^4, x^{12} -> x^(12)
  text = text.replace(/([a-zA-Z0-9\)])\s*\^\s*\{([^{}]+)\}/g, (_m, p1, p2) => {
    const trimmed = p2.trim();
    return trimmed.length === 1 ? `${p1}^${trimmed}` : `${p1}^(${trimmed})`;
  });

  // 3. Convert Unicode superscripts to ^(digits)
  text = text.replace(/([a-zA-Z0-9\)])([⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+)/g, (_, prefix, supers) => {
    let exp = '';
    for (const ch of supers) exp += SUPERSCRIPT_MAP[ch] || ch;
    return exp.length === 1 ? `${prefix}^${exp}` : `${prefix}^(${exp})`;
  });

  // 4. Handle pasted plaintext math where powers lost their caret/superscript:
  // e.g. "2x4 - 9x3 + 14x2 - 9x + 2 = 0" or "x2 - 5x + 6 = 0"
  // When an algebraic variable (single letter like x, y, z, t, etc.) is directly
  // followed by digits (degree/power) without an exponent sign:
  text = text.replace(/(^|[^a-zA-Z])([a-zA-Z])(\d+)(?=[^a-zA-Z0-9]|$)/g, (match, prefix, letter, power) => {
    if (prefix === '^' || prefix === '_') return match;
    return `${prefix}${letter}^${power}`;
  });

  return text;
}


