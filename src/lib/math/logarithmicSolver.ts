/**
 * Logarithmic Equation Solver
 *
 * Solves equations containing logarithms with variables inside arguments:
 * - Sum/difference of logs: log_2(x-1) + log_2(x+1) = 3
 * - One-to-one property: log(2x+3) = log(x+7)
 * - Single log: log_5(2x-3) = 2, ln(3x-1) = 4
 *
 * Provides complete step-by-step solutions including:
 * 1. Domain restrictions (arguments must be > 0)
 * 2. Log rules (product, quotient, power)
 * 3. Conversion to exponential form (b^c) or equating arguments
 * 4. Solving the resulting algebraic equation
 * 5. Checking for extraneous solutions against domain restrictions
 */

import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import type { SolverResult, SolutionStep } from '@/types/solver';
import { autoBalanceParens, normalizeExpression } from './normalizer';

interface LogTerm {
  coeff: number;
  baseStr: string;
  baseVal: number;
  arg: string;
  full: string;
  isLHS: boolean;
}

/**
 * Detects whether an equation contains logarithmic terms with variable arguments.
 */
export function detectLogarithmicEquation(input: string, specifiedVar?: string): {
  isLogarithmic: boolean;
  variable: string;
} {
  const norm = normalizeExpression(input);
  const reserved = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'exp', 'sqrt', 'cbrt', 'abs', 'pi', 'e',
  ]);
  const tokens = norm.match(/[a-zA-Z]+/g) || [];
  const singleVars = tokens.filter((t) => t.length === 1 && !reserved.has(t.toLowerCase()));
  const variable = specifiedVar || singleVars.find((v) => v.toLowerCase() === 'x') || singleVars[0] || 'x';

  const hasLog = /(?:^|[^a-zA-Z])(?:\\?log(?:_\{?[0-9a-zA-Z]+\}?|\d+)?|\\?ln)\s*\(/i.test(norm);
  return {
    isLogarithmic: hasLog,
    variable,
  };
}

function cleanArg(arg: string): string {
  return arg.replace(/\s+/g, '');
}

function formatBaseSubscript(baseStr: string): string {
  if (baseStr === 'e') return '\\ln';
  if (baseStr === '10') return '\\log';
  return '\\log_{' + baseStr + '}';
}

/**
 * Solves a logarithmic equation step-by-step.
 */
export function trySolveLogarithmicEquation(
  cleanEq: string,
  rawEquation?: string
): SolverResult | null {
  const norm = normalizeExpression(cleanEq);
  const detection = detectLogarithmicEquation(norm);
  if (!detection.isLogarithmic) {
    return null;
  }

  const variable = detection.variable;

  // Split into LHS and RHS
  let lhsStr = norm;
  let rhsStr = '0';
  if (norm.includes('=')) {
    const parts = norm.split('=');
    lhsStr = parts[0].trim();
    rhsStr = parts[1].trim();
  }

  // Regex to match log terms: coeff * log_b(arg) or ln(arg)
  const logTermRegex = /([+-]?\s*\d*\.?\d*)\s*\*?\s*(?:\\?log(?:_\{?([0-9a-zA-Z]+)\}?|(\d+))?|ln)\s*\(([^)]+)\)/gi;

  // Determine if input used natural log (ln)
  const sourceStr = rawEquation || cleanEq;
  const originallyHadLn = /(?:^|[^a-zA-Z])\\?ln\s*\(/i.test(sourceStr);

  const extractTerms = (sideStr: string, isLHS: boolean): LogTerm[] => {
    const terms: LogTerm[] = [];
    let m: RegExpExecArray | null;
    logTermRegex.lastIndex = 0;
    while ((m = logTermRegex.exec(sideStr)) !== null) {
      const rawCoeff = m[1].replace(/\s+/g, '');
      let coeff = 1;
      if (rawCoeff === '-' || rawCoeff === '-1') coeff = -1;
      else if (rawCoeff === '+' || rawCoeff === '+1') coeff = 1;
      else if (rawCoeff) {
        const parsed = parseFloat(rawCoeff);
        if (!isNaN(parsed)) coeff = parsed;
      }

      const isLn = m[0].toLowerCase().includes('ln') || originallyHadLn;
      const baseStr = m[2] || m[3] || (isLn ? 'e' : '10');
      const baseVal = baseStr === 'e' ? Math.E : parseFloat(baseStr);
      const arg = m[4].trim();

      terms.push({
        coeff,
        baseStr,
        baseVal,
        arg,
        full: m[0].trim(),
        isLHS,
      });
    }
    return terms;
  };

  const lhsTerms = extractTerms(lhsStr, true);
  const rhsTerms = extractTerms(rhsStr, false);

  if (lhsTerms.length === 0 && rhsTerms.length === 0) {
    return null;
  }

  // Check that all log terms have arguments containing the variable or can be combined
  const allTerms = [...lhsTerms, ...rhsTerms];
  const bases = Array.from(new Set(allTerms.map((t) => t.baseStr)));

  // If there are multiple different bases that cannot be directly combined, fall through
  if (bases.length > 1) {
    return null;
  }

  const commonBaseStr = bases[0];
  const commonBaseVal = allTerms[0].baseVal;

  const steps: SolutionStep[] = [];
  let stepNumber = 1;

  // Step 1: Initial Equation & Domain Restrictions
  let displayEq: string;
  try {
    displayEq = nerdamer(cleanEq).toTeX().replace(/\\log_\{([^}]+)\}\s*\\cdot\s*/g, '\\log_{$1}');
  } catch {
    displayEq = cleanEq;
  }

  steps.push({
    stepNumber: stepNumber++,
    explanation: 'Write the logarithmic equation and state the domain restrictions (arguments of logarithms must be strictly positive, $g(' + variable + ') > 0$):',
    math: displayEq,
  });

  const domainConditions: string[] = [];
  allTerms.forEach((t) => {
    if (t.arg.includes(variable)) {
      domainConditions.push(t.arg + ' > 0');
    }
  });

  if (domainConditions.length > 0) {
    steps.push({
      stepNumber: stepNumber++,
      explanation: 'Identify the domain restrictions for all logarithmic terms:',
      math: '\\text{Domain requirements: } \\quad ' + domainConditions.join(', \\quad '),
    });
  }

  // ─── CASE A: log_b(f(x)) = log_b(g(x)) (One-to-One Property) ──────────────────
  if (lhsTerms.length === 1 && rhsTerms.length === 1 && lhsTerms[0].coeff === 1 && rhsTerms[0].coeff === 1) {
    const fArg = lhsTerms[0].arg;
    const gArg = rhsTerms[0].arg;

    steps.push({
      stepNumber: stepNumber++,
      explanation: 'Apply the One-to-One Property of Logarithms: if $\\log_b(A) = \\log_b(B)$, then $A = B$:',
      math: fArg + ' = ' + gArg,
    });

    const algEq = '(' + fArg + ') - (' + gArg + ') = 0';
    return finishLogSolution(algEq, allTerms, variable, steps, stepNumber);
  }

  // ─── CASE B: Sum / Difference of logs equal to a constant or combined form ────
  // Move all log terms to LHS: if term was on RHS, flip its sign
  const unifiedTerms: { coeff: number; arg: string }[] = [];
  for (const t of lhsTerms) {
    unifiedTerms.push({ coeff: t.coeff, arg: t.arg });
  }
  for (const t of rhsTerms) {
    unifiedTerms.push({ coeff: -t.coeff, arg: t.arg });
  }

  // If RHS had a constant (non-log part)
  let constantRhs = 0;
  const rhsWithoutLogs = rhsStr.replace(logTermRegex, '').trim();
  if (rhsWithoutLogs) {
    try {
      constantRhs = parseFloat(math.evaluate(rhsWithoutLogs));
    } catch {
      constantRhs = parseFloat(rhsWithoutLogs) || 0;
    }
  }

  // Separate positive and negative terms for product & quotient rules
  const numerators: string[] = [];
  const denominators: string[] = [];

  for (const t of unifiedTerms) {
    if (t.coeff === 1) {
      numerators.push('(' + t.arg + ')');
    } else if (t.coeff === -1) {
      denominators.push('(' + t.arg + ')');
    } else if (t.coeff > 0) {
      numerators.push('((' + t.arg + ')^' + t.coeff + ')');
    } else if (t.coeff < 0) {
      denominators.push('((' + t.arg + ')^' + Math.abs(t.coeff) + ')');
    }
  }

  const numExpr = numerators.length > 0 ? numerators.join(' * ') : '1';
  const denExpr = denominators.length > 0 ? denominators.join(' * ') : '1';
  const combinedArg = denExpr === '1' ? numExpr : '(' + numExpr + ') / (' + denExpr + ')';

  const baseSymbol = formatBaseSubscript(commonBaseStr);

  // Step 2: Combine using log laws
  let expandedCombinedArg: string;
  try {
    expandedCombinedArg = nerdamer(combinedArg).expand().toString();
  } catch {
    expandedCombinedArg = combinedArg;
  }

  steps.push({
    stepNumber: stepNumber++,
    explanation: 'Apply the product rule $\\log_b(A) + \\log_b(B) = \\log_b(A \\cdot B)$ and quotient rule $\\log_b(A) - \\log_b(B) = \\log_b(A / B)$ to condense into a single logarithm:',
    math: baseSymbol + '\\left(' + nerdamer(combinedArg).toTeX() + '\\right) = ' + constantRhs,
  });

  // Step 3: Convert from logarithmic to exponential form
  // log_b(Y) = c <=> Y = b^c
  let rhsPowerVal: number;
  let rhsPowerLatex: string;
  if (commonBaseStr === 'e') {
    rhsPowerVal = Math.exp(constantRhs);
    rhsPowerLatex = constantRhs === 0 ? '1' : 'e^{' + constantRhs + '}';
  } else {
    rhsPowerVal = Math.pow(commonBaseVal, constantRhs);
    rhsPowerLatex = constantRhs === 0 ? '1' : commonBaseStr + '^{' + constantRhs + '} = ' + rhsPowerVal;
  }

  steps.push({
    stepNumber: stepNumber++,
    explanation: 'Convert from logarithmic form to exponential form using $\\log_b(Y) = c \\iff Y = b^c$:',
    math: nerdamer(combinedArg).toTeX() + ' = ' + rhsPowerLatex,
  });

  // Step 4: Solve the resulting algebraic equation
  // If combinedArg is of the form P(x)/Q(x) = rhsPowerVal, cross-multiply: P(x) - rhsPowerVal * Q(x) = 0
  let algEquation = '';
  if (denExpr !== '1') {
    algEquation = `(${numExpr}) - (${rhsPowerVal}) * (${denExpr}) = 0`;
  } else {
    algEquation = `(${numExpr}) - (${rhsPowerVal}) = 0`;
  }
  return finishLogSolution(algEquation, allTerms, variable, steps, stepNumber);
}

/**
 * Solves the resulting algebraic equation and performs domain validation to discard extraneous roots.
 */
function finishLogSolution(
  algEquation: string,
  allTerms: LogTerm[],
  variable: string,
  steps: SolutionStep[],
  startStepNumber: number
): SolverResult | null {
  let stepNumber = startStepNumber;

  // Solve algebraic equation
  const candidateRoots: { latex: string; num: number }[] = [];

  // Check if algEquation is quadratic in variable: a*x^2 + b*x + c = 0
  let isQuadraticSolved = false;
  try {
    const exprStandard = algEquation.replace(/=\s*0\s*$/, '').trim();
    const cObj = (nerdamer as any).coeffs(exprStandard, variable);
    const cStr = cObj.toString();
    if (cStr.startsWith('[') && cStr.endsWith(']')) {
      const arr = cStr.slice(1, -1).split(',').map((s: string) => {
        const val = Number((nerdamer as any)(s.trim()).evaluate().text());
        return isNaN(val) ? 0 : val;
      });
      // arr is [c, b, a]
      if (arr.length === 3 && Math.abs(arr[2]) > 1e-9) {
        const c = arr[0];
        const b = arr[1];
        const a = arr[2];
        const delta = b * b - 4 * a * c;
        if (delta >= 0) {
          isQuadraticSolved = true;
          const sqrtD = Math.sqrt(delta);
          const r1 = (-b + sqrtD) / (2 * a);
          const r2 = (-b - sqrtD) / (2 * a);

          // Format roots: check if delta is a perfect square
          const isSq = Math.abs(Math.round(sqrtD) - sqrtD) < 1e-6;
          if (isSq) {
            candidateRoots.push({ latex: (nerdamer as any)(r1.toString()).toTeX(), num: r1 });
            if (Math.abs(r1 - r2) > 1e-6) {
              candidateRoots.push({ latex: (nerdamer as any)(r2.toString()).toTeX(), num: r2 });
            }
          } else {
            // Simplify radical \sqrt{delta} = outside * \sqrt{inside}
            let outside = 1;
            let inside = Math.round(delta);
            for (let i = Math.floor(Math.sqrt(inside)); i >= 2; i--) {
              if (inside % (i * i) === 0) {
                outside = i;
                inside = Math.round(inside / (i * i));
                break;
              }
            }

            const radStr = outside === 1 ? `\\sqrt{${inside}}` : `${outside}\\sqrt{${inside}}`;
            const bStr = b === 0 ? '' : `${-b}`;
            const den = 2 * a;

            if (den === 2) {
              candidateRoots.push({
                latex: bStr ? `\\frac{${bStr} + ${radStr}}{2}` : `\\frac{${radStr}}{2}`,
                num: r1,
              });
              candidateRoots.push({
                latex: bStr ? `\\frac{${bStr} - ${radStr}}{2}` : `-\\frac{${radStr}}{2}`,
                num: r2,
              });
            } else if (den === -2) {
              candidateRoots.push({
                latex: bStr ? `\\frac{${-Number(bStr)} - ${radStr}}{2}` : `-\\frac{${radStr}}{2}`,
                num: r1,
              });
              candidateRoots.push({
                latex: bStr ? `\\frac{${-Number(bStr)} + ${radStr}}{2}` : `\\frac{${radStr}}{2}`,
                num: r2,
              });
            } else {
              candidateRoots.push({
                latex: `\\frac{${bStr ? bStr + ' + ' : ''}${radStr}}{${den}}`,
                num: r1,
              });
              candidateRoots.push({
                latex: `\\frac{${bStr ? bStr + ' - ' : ''}${radStr}}{${den}}`,
                num: r2,
              });
            }
          }
        }
      }
    }
  } catch {
    // fallback
  }

  if (!isQuadraticSolved) {
    let rawSolStr: string;
    try {
      const sol = (nerdamer as any).solve(algEquation, variable);
      rawSolStr = String(sol || '');
    } catch {
      return null;
    }

    if (!rawSolStr || rawSolStr === '[]' || rawSolStr.includes('solve(')) {
      return null;
    }

    const rawRoots: string[] = rawSolStr
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (rawRoots.length === 0) return null;

    for (const rStr of rawRoots) {
      let num = NaN;
      try {
        const evalRes = math.evaluate(rStr);
        num = typeof evalRes === 'number' ? evalRes : parseFloat(rStr);
      } catch {
        num = parseFloat(rStr);
      }

      let latex = rStr;
      try {
        latex = nerdamer(rStr).toTeX();
      } catch {
        latex = rStr;
      }

      if (!isNaN(num)) {
        candidateRoots.push({ latex, num });
      }
    }
  }

  if (candidateRoots.length === 0) return null;

  // Step: Show candidate algebraic solutions
  const candidateStrs = candidateRoots.map((c, i) =>
    candidateRoots.length === 1 ? variable + ' = ' + c.latex : variable + '_' + (i + 1) + ' = ' + c.latex
  );

  steps.push({
    stepNumber: stepNumber++,
    explanation: 'Solve the resulting algebraic equation for candidate solutions:',
    math: candidateStrs.join(', \\quad '),
  });

  // Step: Check each candidate against domain restrictions
  const validRoots: { latex: string; num: number }[] = [];
  const extraneousRoots: { latex: string; num: number; reason: string }[] = [];
  const checkSteps: string[] = [];

  for (const cand of candidateRoots) {
    let isValid = true;
    let failedArg = '';
    let failedVal = 0;

    for (const t of allTerms) {
      if (!t.arg.includes(variable)) continue;
      try {
        const val = math.evaluate(t.arg, { [variable]: cand.num });
        if (typeof val === 'number' && val <= 0) {
          isValid = false;
          failedArg = t.arg;
          failedVal = val;
          break;
        }
      } catch {
        isValid = false;
        break;
      }
    }

    if (isValid) {
      validRoots.push(cand);
      checkSteps.push(
        '\\textbf{Test } ' + variable + ' = ' + cand.latex + ': \\quad \\text{All arguments are } > 0 \\implies \\checkmark \\text{ (Valid)}'
      );
    } else {
      extraneousRoots.push({
        latex: cand.latex,
        num: cand.num,
        reason: failedArg + ' = ' + failedVal + ' \\le 0',
      });
      checkSteps.push(
        '\\textbf{Test } ' + variable + ' = ' + cand.latex + ': \\quad ' + failedArg + ' = ' + (Math.round(failedVal * 100) / 100) + ' \\le 0 \\implies \\times \\text{ (Extraneous, discarded)}'
      );
    }
  }

  steps.push({
    stepNumber: stepNumber++,
    explanation: 'Check candidate solutions against the domain restrictions (arguments must be $> 0$):',
    math: '\\begin{aligned} ' + checkSteps.join(' \\\\[6pt] ') + ' \\end{aligned}',
  });

  if (validRoots.length === 0) {
    steps.push({
      stepNumber: stepNumber++,
      explanation: 'Since all candidate solutions are extraneous, the equation has no real solution.',
      math: '\\text{No real solution}',
    });
    return {
      type: 'logarithmic',
      steps,
      finalAnswer: '\\text{No real solution}',
      numericRoots: [],
    };
  }

  const finalStrs = validRoots.map((v, i) =>
    validRoots.length === 1 ? variable + ' = ' + v.latex : variable + '_' + (i + 1) + ' = ' + v.latex
  );

  steps.push({
    stepNumber: stepNumber++,
    explanation: 'Collect the final valid real solution' + (validRoots.length > 1 ? 's' : '') + ':',
    math: finalStrs.join(', \\quad '),
  });

  return {
    type: 'logarithmic',
    steps,
    finalAnswer: finalStrs.join(', \\quad '),
    numericRoots: validRoots.map((v) => v.num),
  };
}
