/**
 * KaTeX/LaTeX to Plain Evaluatable ASCII Math Sanitizer Utility
 * 
 * Transforms mathematical formulas from LaTeX display format into plain,
 * normalized ASCII strings suitable for mathjs, nerdamer, or direct solver/calculator inputs.
 */

export function latexToAscii(latex: string): string {
  if (!latex) return '';
  let str = latex.trim();

  // 1. Remove display formatting and macro wrappers
  str = str.replace(/\\left\(/g, '(')
           .replace(/\\right\)/g, ')')
           .replace(/\\left\[/g, '[')
           .replace(/\\right\]/g, ']')
           .replace(/\\left\\{/g, '{')
           .replace(/\\right\\}/g, '}')
           .replace(/\\left\|/g, 'abs(')
           .replace(/\\right\|/g, ')')
           .replace(/\\mathbf\{([^}]+)\}/g, '$1')
           .replace(/\\mathrm\{([^}]+)\}/g, '$1')
           .replace(/\\text\{([^}]+)\}/g, '$1')
           .replace(/\\operatorname\{([^}]+)\}/g, '$1')
           .replace(/\\[,;:!]/g, ' ')
           .replace(/\\quad/g, ' ')
           .replace(/\\qquad/g, ' ');

  // 2. Normalize multiplication and division operators
  str = str.replace(/\\cdot/g, '*')
           .replace(/\\times/g, '*')
           .replace(/\\div/g, '/')
           .replace(/\\pm/g, '+'); // Default to positive branch for evaluators

  // 3. Handle fractions: \frac{a}{b} or \dfrac{a}{b} -> ((a)/(b))
  // Iterate to handle nested fractions cleanly
  let prev = '';
  while (str !== prev) {
    prev = str;
    str = str.replace(/\\d?frac\{([^{}]+)\}\{([^{}]+)\}/g, '(($1)/($2))');
  }

  // 4. Handle roots: \sqrt{x} -> sqrt(x), \sqrt[n]{x} -> nthRoot(x, n)
  str = str.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, 'nthRoot($2, $1)');
  str = str.replace(/\\sqrt\{([^{}]+)\}/g, 'sqrt($1)');

  // 5. Exponents and subscripts
  str = str.replace(/\^\{([^{}]+)\}/g, '^($1)');
  str = str.replace(/_\{([^{}]+)\}/g, '_$1');

  // 6. Common constants and functions
  str = str.replace(/\\pi/g, 'pi')
           .replace(/\\infty/g, 'Infinity')
           .replace(/\\sin/g, 'sin')
           .replace(/\\cos/g, 'cos')
           .replace(/\\tan/g, 'tan')
           .replace(/\\ln/g, 'ln')
           .replace(/\\log/g, 'log')
           .replace(/\\exp/g, 'exp');

  // 7. Strip backslashes and collapse extra whitespace
  str = str.replace(/\\/g, '');
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

/**
 * Extracts a plotting-friendly function y = f(x) and expected roots from an equation string.
 */
export function extractPlotFunction(equation: string, roots: number[] = []): {
  fn: string;
  roots: number[];
} {
  if (!equation) return { fn: '0', roots: [] };
  let clean = equation.trim();

  // If already in y = f(x) or f(x) = ... format
  if (/^y\s*=/i.test(clean)) {
    clean = clean.replace(/^y\s*=\s*/i, '');
  } else if (/^f\(x\)\s*=/i.test(clean)) {
    clean = clean.replace(/^f\(x\)\s*=\s*/i, '');
  } else if (clean.includes('=')) {
    const [lhs, rhs] = clean.split('=');
    const rhsTrim = (rhs || '').trim();
    if (rhsTrim === '0') {
      clean = lhs.trim();
    } else {
      clean = `(${lhs.trim()}) - (${rhsTrim})`;
    }
  }

  // Ensure implicit coefficients have explicit multiplication first so word boundaries work
  clean = clean.replace(/(\d+)([a-zA-Z])/g, '$1*$2');

  // Reserved math function and constant names that must never be treated as variables
  const RESERVED_WORDS = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'asinh', 'acosh', 'atanh', 'sec', 'csc', 'cot',
    'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs', 'ceil', 'floor', 'round', 'sign',
    'min', 'max', 'pi', 'PI', 'e', 'i'
  ]);

  // Replace alternative single-letter variables (e.g. t, a, n, z) with x for the 2D Cartesian canvas
  // First check if there's no 'x' present as an isolated variable
  if (!/\bx\b/i.test(clean)) {
    const tokens = clean.match(/[a-zA-Z]+/g) || [];
    let detectedVar: string | null = null;
    for (const tok of tokens) {
      if (tok.length === 1 && !RESERVED_WORDS.has(tok.toLowerCase()) && tok.toLowerCase() !== 'x') {
        detectedVar = tok;
        break;
      }
    }
    if (detectedVar) {
      // Replace ONLY whole-word occurrences of this variable with x
      clean = clean.replace(new RegExp(`\\b${detectedVar}\\b`, 'g'), 'x');
    }
  }

  return {
    fn: clean,
    roots: roots.filter(r => typeof r === 'number' && Number.isFinite(r) && !isNaN(r)),
  };
}
