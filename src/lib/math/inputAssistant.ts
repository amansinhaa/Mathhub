import { SolverType } from '@/types/solver';

export interface AutoFix {
  id: string;
  label: string;
  explanation: string;
  fixedEquation: string;
  targetMode?: SolverType;
  systemEqs?: string[];
}

export interface SuggestedAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  targetMode: SolverType;
  targetEquation?: string;
  systemEqs?: string[];
  variable?: string;
}

export interface AssistantAnalysis {
  hasFix: boolean;
  fix?: AutoFix;
  suggestions: SuggestedAction[];
}

/**
 * Analyzes the user's current math input string and active mode to:
 * 1. Proactively detect syntax errors or typos and provide 1-tap auto-fixes.
 * 2. Suggest contextually relevant operations ("What can you do with this?").
 */
export function analyzeInput(rawInput: string, currentMode: SolverType): AssistantAnalysis {
  const text = rawInput.trim();

  if (!text || text.length < 2) {
    return { hasFix: false, suggestions: [] };
  }

  const fix = detectFix(text, currentMode);
  const suggestions = generateSuggestions(text, currentMode, fix);

  return {
    hasFix: !!fix,
    fix,
    suggestions: suggestions.slice(0, 4), // Top 4 high-value suggestions
  };
}

// ─── 1. Error Detection & Auto-Fixes ──────────────────────────────────────────

// ─── 1. Error Detection & Auto-Fixes ──────────────────────────────────────────

/**
 * Common typo dictionary for functions.
 * Maps common mistypings or alternate spellings to their canonical function names.
 */
const FUNCTION_TYPO_MAP: Record<string, string> = {
  sqt: 'sqrt',
  sqr: 'sqrt',
  squrt: 'sqrt',
  squareroot: 'sqrt',
  sn: 'sin',
  sinn: 'sin',
  sni: 'sin',
  sine: 'sin',
  cs: 'cos',
  coz: 'cos',
  coss: 'cos',
  cosine: 'cos',
  tn: 'tan',
  tna: 'tan',
  tann: 'tan',
  tg: 'tan',
  tga: 'tan',
  tangent: 'tan',
  itn: 'int',
  integ: 'int',
  integral: 'int',
  logg: 'log',
  logarithm: 'log',
  lnn: 'ln',
  abss: 'abs',
  cbrtt: 'cbrt',
  cuberoot: 'cbrt',
  arcsin: 'asin',
  arccos: 'acos',
  arctan: 'atan',
};

function detectFix(text: string, currentMode: SolverType): AutoFix | undefined {
  // RULE 0: If user is actively typing an operator or delimiter at the very end,
  // they are clearly mid-keystroke. Do NOT trigger alarm banners.
  if (/[+\-*/^,(]$/.test(text)) {
    return undefined;
  }

  // 1. Function typo detection:
  // e.g. "sqt", "sqt(x)", "sqt 4", "sn(x)", "coz(x)", "logg(x)"
  // Case A: Standalone typo token alone (e.g. "sqt", "squrt", "sinn")
  const lowerTrimmed = text.toLowerCase().trim();
  if (FUNCTION_TYPO_MAP[lowerTrimmed]) {
    const canonical = FUNCTION_TYPO_MAP[lowerTrimmed];
    return {
      id: 'function-typo-standalone',
      label: `Did you mean: ${canonical}(x)?`,
      explanation: `Correct '${lowerTrimmed}' to function '${canonical}'`,
      fixedEquation: `${canonical}(x)`,
    };
  }

  // Case B: Function typo prefix within expression (e.g. "sqt(x + 2)" or "2*sn(x)")
  for (const [typo, canonical] of Object.entries(FUNCTION_TYPO_MAP)) {
    const regex = new RegExp(`\\b${typo}\\b(?=\\s*[\\(\\d[a-zA-Z])`, 'i');
    if (regex.test(text)) {
      const fixed = text.replace(regex, canonical);
      return {
        id: `function-typo-${typo}`,
        label: `Did you mean: ${fixed}?`,
        explanation: `Correct '${typo}' to '${canonical}'`,
        fixedEquation: fixed,
      };
    }
  }

  // 2. Comma-separated simultaneous equations typed into a single field
  // e.g. "2x + y = 7, x - y = 2" or "x + y = 10 ; 2x - y = 5"
  if (text.includes(',') || text.includes(';')) {
    const parts = text.split(/[,;]/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2 && parts.every(p => p.includes('=') || /[<>≤≥]/.test(p))) {
      return {
        id: 'comma-system',
        label: `Switch to 2×2 System Mode?`,
        explanation: 'Multiple simultaneous equations detected',
        fixedEquation: parts[0],
        targetMode: 'system',
        systemEqs: parts,
      };
    }
  }

  // 3. Trailing equals sign: e.g. "x^2 - 5x + 6 =" or "2x + 8 ="
  if (/=\s*$/.test(text)) {
    const fixed = `${text} 0`;
    return {
      id: 'trailing-equals',
      label: `Did you mean: ${fixed}?`,
      explanation: 'Incomplete equation set to 0',
      fixedEquation: fixed,
      targetMode: currentMode === 'inequality' ? 'polynomial' : currentMode,
    };
  }

  // 4. Leading equals sign: e.g. "= 2x + 8"
  if (/^=\s*(.+)$/.test(text)) {
    const match = text.match(/^=\s*(.+)$/);
    if (match) {
      return {
        id: 'leading-equals',
        label: `Did you mean: ${match[1]} = 0?`,
        explanation: 'Leading equals sign moved to end',
        fixedEquation: `${match[1]} = 0`,
        targetMode: 'polynomial',
      };
    }
  }

  // 5. Unbalanced parentheses (only if the string has at least some substance)
  const openCount = (text.match(/\(/g) || []).length;
  const closeCount = (text.match(/\)/g) || []).length;
  if (openCount > closeCount && text.length >= 4) {
    const diff = openCount - closeCount;
    const fixed = text + ')'.repeat(diff);
    return {
      id: 'unclosed-parens',
      label: `Did you mean: ${fixed}?`,
      explanation: `Missing ${diff} closing parenthesis`,
      fixedEquation: fixed,
    };
  } else if (closeCount > openCount) {
    const diff = closeCount - openCount;
    const fixed = '('.repeat(diff) + text;
    return {
      id: 'unopened-parens',
      label: `Did you mean: ${fixed}?`,
      explanation: `Missing ${diff} opening parenthesis`,
      fixedEquation: fixed,
    };
  }

  // 6. Function missing parentheses: e.g. "sin x", "cos 2x", "ln x", "sqrt x"
  // Note: Only match when followed by an argument like "x" or a number
  const missingFuncParen = /\b(sin|cos|tan|cot|sec|csc|log|ln|sqrt)\s+([a-zA-Z0-9]+)\b(?!\()/i;
  if (missingFuncParen.test(text)) {
    const fixed = text.replace(missingFuncParen, '$1($2)');
    return {
      id: 'missing-func-parens',
      label: `Did you mean: ${fixed}?`,
      explanation: 'Added parentheses around function argument',
      fixedEquation: fixed,
    };
  }

  // 7. Mode Mismatch: Inequality typed in Solve mode
  if (currentMode === 'polynomial' && /[<>≤≥]/.test(text)) {
    return {
      id: 'mode-mismatch-inequality',
      label: 'Switch to Inequality Solver?',
      explanation: 'Inequality symbols (<, >, ≤, ≥) detected',
      fixedEquation: text,
      targetMode: 'inequality',
    };
  }

  // 8. Mode Mismatch: Standard equation typed in Inequality mode
  if (currentMode === 'inequality' && text.includes('=') && !/[<>≤≥]/.test(text)) {
    return {
      id: 'mode-mismatch-equation',
      label: 'Switch to Equation Solver?',
      explanation: 'Equals sign (=) detected instead of inequality (<, >)',
      fixedEquation: text,
      targetMode: 'polynomial',
    };
  }

  // 9. Missing equals sign between expression and trailing number
  // e.g. "2x + 8 20" or "3x - 5 10" (space between two non-operator tokens)
  const missingEqMatch = text.match(/^(.+?[a-zA-Z0-9)])\s+([0-9]+)$/);
  if (missingEqMatch && !text.includes('=') && !/[<>≤≥]/.test(text)) {
    const lhs = missingEqMatch[1].trim();
    const rhs = missingEqMatch[2].trim();
    if (!/[+\-*/^=]$/.test(lhs) && /[a-zA-Z]/.test(lhs) && /[+\-*/^]/.test(lhs)) {
      return {
        id: 'missing-equals',
        label: `Did you mean: ${lhs} = ${rhs}?`,
        explanation: `Missing equals sign before ${rhs}`,
        fixedEquation: `${lhs} = ${rhs}`,
        targetMode: 'polynomial',
      };
    }
  }

  // 10. Duplicate equals signs: e.g. "2x = 4 = 8"
  if ((text.match(/=/g) || []).length > 1) {
    const parts = text.split('=');
    const fixed = `${parts[0].trim()} = ${parts[1].trim()}`;
    return {
      id: 'duplicate-equals',
      label: `Did you mean: ${fixed}?`,
      explanation: 'Removed extra equals sign',
      fixedEquation: fixed,
    };
  }

  return undefined;
}

// ─── 2. Smart Action Suggestions ("What can you do with this?") ─────────────

function generateSuggestions(
  text: string,
  currentMode: SolverType,
  activeFix?: AutoFix
): SuggestedAction[] {
  const suggestions: SuggestedAction[] = [];
  const hasEquals = text.includes('=');
  const hasInequality = /[<>≤≥]/.test(text);
  const hasVar = /[a-zA-Z]/.test(text);

  // Extract pure function part (LHS if equation, or text itself)
  const pureExpr = hasEquals ? text.split('=')[0].trim() : text;

  // 1. Radical expressions (e.g. sqrt(4 - x^2), sqrt(x - 2))
  if (/sqrt|cbrt|√/.test(text)) {
    if (currentMode !== 'domain_range') {
      suggestions.push({
        id: 'suggest-dr-radical',
        label: 'Find Domain & Range',
        description: 'Find real intervals where square root is non-negative',
        icon: '[a,b]',
        targetMode: 'domain_range',
        targetEquation: pureExpr,
      });
    }
    if (currentMode !== 'derivative') {
      suggestions.push({
        id: 'suggest-deriv-radical',
        label: 'Differentiate',
        description: 'Calculate rate of change using chain rule',
        icon: 'd⁄dx',
        targetMode: 'derivative',
        targetEquation: pureExpr,
      });
    }
  }

  // 2. Rational fractions with variable in denominator (e.g. 1/(x-3), (2x+1)/(x-1))
  if (/\/\s*\(?[^)]*[a-zA-Z]/.test(text)) {
    if (currentMode !== 'domain_range') {
      suggestions.push({
        id: 'suggest-dr-rational',
        label: 'Find Domain & Range',
        description: 'Find vertical & horizontal asymptotes',
        icon: '[a,b]',
        targetMode: 'domain_range',
        targetEquation: pureExpr,
      });
    }
    if (currentMode !== 'derivative') {
      suggestions.push({
        id: 'suggest-deriv-rational',
        label: 'Quotient Rule Derivative',
        description: 'Calculate d/dx using quotient rule',
        icon: 'd⁄dx',
        targetMode: 'derivative',
        targetEquation: pureExpr,
      });
    }
  }

  // 3. Trigonometric expressions (e.g. sin(x), cos(x), tan(x))
  if (/\b(sin|cos|tan|sec|csc|cot)\b/i.test(text)) {
    if (currentMode !== 'derivative') {
      suggestions.push({
        id: 'suggest-deriv-trig',
        label: 'Differentiate (d/dx)',
        description: 'Find trigonometric derivative',
        icon: 'd⁄dx',
        targetMode: 'derivative',
        targetEquation: pureExpr,
      });
    }
    if (currentMode !== 'integral') {
      suggestions.push({
        id: 'suggest-integral-trig',
        label: 'Integrate (∫)',
        description: 'Find trigonometric antiderivative',
        icon: '∫',
        targetMode: 'integral',
        targetEquation: pureExpr,
      });
    }
    if (currentMode !== 'domain_range') {
      suggestions.push({
        id: 'suggest-dr-trig',
        label: 'Domain & Range',
        description: 'Find amplitude bounds and periodic asymptotes',
        icon: '[a,b]',
        targetMode: 'domain_range',
        targetEquation: pureExpr,
      });
    }
  }

  // 4. Logarithmic expressions (e.g. ln(x - 2), log(x))
  if (/\b(ln|log)\b/i.test(text)) {
    if (currentMode !== 'domain_range') {
      suggestions.push({
        id: 'suggest-dr-log',
        label: 'Domain & Range',
        description: 'Find domain where argument is strictly positive (x > 0)',
        icon: '[a,b]',
        targetMode: 'domain_range',
        targetEquation: pureExpr,
      });
    }
    if (currentMode !== 'derivative') {
      suggestions.push({
        id: 'suggest-deriv-log',
        label: 'Differentiate',
        description: 'Calculate 1/x derivative',
        icon: 'd⁄dx',
        targetMode: 'derivative',
        targetEquation: pureExpr,
      });
    }
  }

  // 5. Quadratic / Polynomial expression without equals sign (e.g. "x^2 - 5x + 6", "2x + 8")
  // Only suggest when it is a substantial mathematical expression (degree >= 1 with operators or powers,
  // NOT a single word or partial identifier like "sqt", "foo", "x").
  const isSubstantialPoly = hasVar && !hasEquals && !hasInequality && 
    (text.includes('^') || /[+\-*/]/.test(text) || (text.length >= 3 && /\d[a-zA-Z]|[a-zA-Z]\d/.test(text)));

  if (isSubstantialPoly) {
    if (currentMode !== 'polynomial') {
      suggestions.push({
        id: 'suggest-solve-eq',
        label: 'Solve for x (= 0)',
        description: 'Set expression to 0 and find roots',
        icon: '=',
        targetMode: 'polynomial',
        targetEquation: `${text} = 0`,
      });
    }
    if (currentMode !== 'domain_range') {
      suggestions.push({
        id: 'suggest-dr-poly',
        label: 'Domain & Range',
        description: 'Analyze parabola vertex & range bounds',
        icon: '[a,b]',
        targetMode: 'domain_range',
        targetEquation: pureExpr,
      });
    }
    if (currentMode !== 'derivative') {
      suggestions.push({
        id: 'suggest-deriv-poly',
        label: 'Derivative (d/dx)',
        description: 'Find slope formula using power rule',
        icon: 'd⁄dx',
        targetMode: 'derivative',
        targetEquation: pureExpr,
      });
    }
    if (currentMode !== 'integral') {
      suggestions.push({
        id: 'suggest-int-poly',
        label: 'Integrate (∫ dx)',
        description: 'Find area under curve & antiderivative',
        icon: '∫',
        targetMode: 'integral',
        targetEquation: pureExpr,
      });
    }
  }

  // 6. Formula with multiple variables (e.g. "v = u + a*t" or "E = m*c^2")
  const distinctLetters = Array.from(new Set(text.match(/[a-zA-Z]/g) || []));
  if (hasEquals && distinctLetters.length >= 2) {
    if (currentMode !== 'symbolic') {
      suggestions.push({
        id: 'suggest-rearrange',
        label: `Rearrange Formula (Solve for ${distinctLetters[distinctLetters.length - 1]})`,
        description: 'Make a specific variable the subject',
        icon: 'a=',
        targetMode: 'symbolic',
        targetEquation: text,
        variable: distinctLetters[distinctLetters.length - 1],
      });
    }
  }

  // 7. Inequality (e.g. 2x - 3 > 5)
  if (hasInequality && currentMode !== 'inequality') {
    suggestions.push({
      id: 'suggest-switch-ineq',
      label: 'Solve Inequality Range',
      description: 'Plot continuous intervals on number line',
      icon: '>',
      targetMode: 'inequality',
      targetEquation: text,
    });
  }

  return suggestions;
}
