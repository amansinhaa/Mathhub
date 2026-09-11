/**
 * Exponential Equation Solver
 *
 * Solves equations containing exponential terms with variables in exponents, such as:
 * - Reducible to quadratic via u = b^x: 3^(2x+1) - 10*3^x + 3 = 0, 4^x - 3*2^x + 2 = 0
 * - Single exponential terms: 2^(x+3) = 16, 5^(2x-1) = 25
 * - General exponential equations via analytical solving and step generation
 */

import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import type { SolverResult, SolutionStep } from '@/types/solver';
import { autoBalanceParens, normalizeExpression } from './normalizer';

interface LinearExp {
  c: number;
  d: number;
}

interface ExpTerm {
  full: string;
  baseStr: string;
  baseVal: number;
  expStr: string;
  c: number;
  d: number;
  index: number;
}

/**
 * Parses an exponent expression string to determine if it is linear in the variable: c*x + d
 */
function parseLinearExponent(expStr: string, variable: string): LinearExp | null {
  try {
    const clean = expStr.replace(/^\(|\)$/g, '');
    const cNode = math.parse(clean).compile();
    const g0 = cNode.evaluate({ [variable]: 0 });
    const g1 = cNode.evaluate({ [variable]: 1 });
    const g2 = cNode.evaluate({ [variable]: 2 });
    if (typeof g0 !== 'number' || typeof g1 !== 'number' || typeof g2 !== 'number') return null;
    if (!isFinite(g0) || !isFinite(g1) || !isFinite(g2)) return null;

    const d = g0;
    const c = g1 - g0;
    if (Math.abs(g2 - (2 * c + d)) > 1e-5) return null; // non-linear

    return {
      c: Math.round(c * 1e6) / 1e6,
      d: Math.round(d * 1e6) / 1e6,
    };
  } catch {
    return null;
  }
}

/**
 * Detects whether an equation contains an exponential term with the variable in the exponent.
 */
export function detectExponentialEquation(input: string, specifiedVar?: string): {
  isExponential: boolean;
  variable: string;
  bases: string[];
} {
  const norm = normalizeExpression(input);
  const reserved = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs', 'pi', 'e',
  ]);
  const tokens = norm.match(/[a-zA-Z]+/g) || [];
  const singleVars = tokens.filter((t) => t.length === 1 && !reserved.has(t.toLowerCase()));
  const variable = specifiedVar || singleVars.find((v) => v.toLowerCase() === 'x') || singleVars[0] || 'x';

  // Match (number or e) ^ (exponent containing variable)
  const regex = new RegExp('(?:\\b\\d+|e)\\s*\\^\\s*(?:\\([^)]*\\b' + variable + '\\b[^)]*\\)|' + variable + '\\b)', 'i');
  const hasExp = regex.test(norm);

  const bases: string[] = [];
  const allExpRegex = new RegExp('(\\b\\d+|e)\\s*\\^\\s*(\\([^)]*\\b' + variable + '\\b[^)]*\\)|' + variable + '\\b)', 'gi');
  let m;
  while ((m = allExpRegex.exec(norm)) !== null) {
    if (!bases.includes(m[1])) {
      bases.push(m[1]);
    }
  }

  return {
    isExponential: hasExp,
    variable,
    bases,
  };
}

/**
 * Checks if a value u is an integer or simple rational power of base.
 */
function solveBasePower(base: number, baseStr: string, u: number, variable: string): {
  solvable: boolean;
  xVal?: number;
  exactLatex?: string;
  stepExplanation?: string;
} {
  if (u <= 0) {
    return {
      solvable: false,
      stepExplanation: 'Since $' + baseStr + '^{' + variable + '} > 0$ for all real numbers $' + variable + '$, $' + baseStr + '^{' + variable + '} = ' + formatNum(u) + '$ has no real solution.',
    };
  }

  if (baseStr === 'e') {
    const xVal = Math.log(u);
    const isRound = Math.abs(Math.round(xVal) - xVal) < 1e-6;
    if (Math.abs(u - 1) < 1e-6) {
      return {
        solvable: true,
        xVal: 0,
        exactLatex: '0',
        stepExplanation: 'e^{' + variable + '} = 1 \\implies ' + variable + ' = 0',
      };
    }
    if (Math.abs(u - Math.E) < 1e-6) {
      return {
        solvable: true,
        xVal: 1,
        exactLatex: '1',
        stepExplanation: 'e^{' + variable + '} = e^1 \\implies ' + variable + ' = 1',
      };
    }
    const exactLatex = isRound ? '' + Math.round(xVal) : '\\ln(' + formatNum(u) + ')';
    return {
      solvable: true,
      xVal,
      exactLatex,
      stepExplanation: 'e^{' + variable + '} = ' + formatNum(u) + ' \\implies ' + variable + ' = \\ln(' + formatNum(u) + ') \\approx ' + xVal.toFixed(4),
    };
  }

  const p = Math.log(u) / Math.log(base);

  // Check integer power
  if (Math.abs(Math.round(p) - p) < 1e-5) {
    const intP = Math.round(p);
    return {
      solvable: true,
      xVal: intP,
      exactLatex: '' + intP,
      stepExplanation: baseStr + '^{' + variable + '} = ' + baseStr + '^{' + intP + '} \\implies ' + variable + ' = ' + intP,
    };
  }

  // Check simple fractions
  for (const denom of [2, 3, 4]) {
    const numer = Math.round(p * denom);
    if (Math.abs(p - numer / denom) < 1e-5) {
      const fracLatex = numer < 0 ? '-\\frac{' + Math.abs(numer) + '}{' + denom + '}' : '\\frac{' + numer + '}{' + denom + '}';
      return {
        solvable: true,
        xVal: numer / denom,
        exactLatex: fracLatex,
        stepExplanation: baseStr + '^{' + variable + '} = ' + baseStr + '^{' + fracLatex + '} \\implies ' + variable + ' = ' + fracLatex,
      };
    }
  }

  // General logarithm
  return {
    solvable: true,
    xVal: p,
    exactLatex: '\\frac{\\ln(' + formatNum(u) + ')}{\\ln(' + baseStr + ')}',
    stepExplanation: baseStr + '^{' + variable + '} = ' + formatNum(u) + ' \\implies ' + variable + ' = \\frac{\\ln(' + formatNum(u) + ')}{\\ln(' + baseStr + ')} \\approx ' + p.toFixed(4),
  };
}

function formatNum(n: number): string {
  if (Math.abs(Math.round(n) - n) < 1e-6) {
    return '' + Math.round(n);
  }
  for (let denom = 2; denom <= 16; denom++) {
    const numer = Math.round(n * denom);
    if (Math.abs(n - numer / denom) < 1e-5) {
      return numer < 0 ? '-\\frac{' + Math.abs(numer) + '}{' + denom + '}' : '\\frac{' + numer + '}{' + denom + '}';
    }
  }
  return '' + (Math.round(n * 1e4) / 1e4);
}

/**
 * Attempts to solve an exponential equation step-by-step.
 */
export function trySolveExponentialEquation(
  cleanEq: string,
  rawEquation?: string
): SolverResult | null {
  const norm = normalizeExpression(cleanEq);
  const detection = detectExponentialEquation(norm);
  if (!detection.isExponential) {
    return null;
  }

  const variable = detection.variable;

  // Standardize equation LHS = RHS -> f(x) = LHS - (RHS) = 0
  let lhsStr = norm;
  let rhsStr = '0';
  if (norm.includes('=')) {
    const parts = norm.split('=');
    lhsStr = parts[0].trim();
    rhsStr = parts[1].trim();
  }

  const standardExpr = rhsStr === '0' ? lhsStr : '(' + lhsStr + ') - (' + rhsStr + ')';

  // Extract exponential terms with variable in exponent
  const termRegex = new RegExp('(\\b\\d+|e)\\s*\\^\\s*(\\([^)]*\\b' + variable + '\\b[^)]*\\)|' + variable + '\\b)', 'gi');
  let m;
  const terms: ExpTerm[] = [];

  while ((m = termRegex.exec(standardExpr)) !== null) {
    const baseStr = m[1];
    const baseVal = baseStr === 'e' ? Math.E : parseFloat(baseStr);
    const expStr = m[2];
    const lin = parseLinearExponent(expStr, variable);
    if (lin && lin.c !== 0) {
      terms.push({
        full: m[0],
        baseStr,
        baseVal,
        expStr,
        c: lin.c,
        d: lin.d,
        index: m.index,
      });
    }
  }

  if (terms.length === 0) {
    return null;
  }

  // ─── UNIFY BASES (e.g. 4^x and 2^x -> base 2) ──────────────────────────────
  let targetBaseStr = terms[0].baseStr;
  let targetBaseVal = terms[0].baseVal;

  if (!terms.every((t) => t.baseStr === targetBaseStr)) {
    const numBases = terms
      .map((t) => t.baseVal)
      .filter((b) => !isNaN(b) && b > 1)
      .sort((a, b) => a - b);
    if (numBases.length > 0) {
      const minBase = numBases[0];
      const canUnify = terms.every((t) => {
        if (t.baseVal === minBase) return true;
        const p = Math.log(t.baseVal) / Math.log(minBase);
        return Math.abs(Math.round(p) - p) < 1e-5;
      });
      if (canUnify) {
        targetBaseStr = '' + minBase;
        targetBaseVal = minBase;
        for (const t of terms) {
          if (t.baseVal !== minBase) {
            const p = Math.round(Math.log(t.baseVal) / Math.log(minBase));
            t.c = t.c * p;
            t.d = t.d * p;
            t.baseStr = targetBaseStr;
            t.baseVal = minBase;
          }
        }
      } else {
        return solveGeneralExponential(standardExpr, variable, norm, rawEquation);
      }
    }
  }

  // ─── CHECK FOR QUADRATIC REDUCIBLE PATTERN: u = base^x ────────────────────
  const cValues = Array.from(new Set(terms.map((t) => t.c))).sort((a, b) => a - b);
  const isQuadraticForm =
    (cValues.length === 2 && cValues[0] === 1 && cValues[1] === 2) ||
    (cValues.length === 1 && cValues[0] === 2) ||
    (cValues.length === 1 && cValues[0] === 1);

  if (isQuadraticForm) {
    let uExpr = standardExpr;
    const sortedTerms = [...terms].sort((a, b) => b.index - a.index);

    for (const t of sortedTerms) {
      const coeff = Math.pow(t.baseVal, t.d);
      const replacement = '(' + coeff + ' * u^' + t.c + ')';
      uExpr = uExpr.slice(0, t.index) + replacement + uExpr.slice(t.index + t.full.length);
    }

    try {
      const fNode = math.compile(uExpr);
      const uVals: number[] = [];
      for (let u = 0; u <= 4; u++) {
        uVals.push(fNode.evaluate({ u, [variable]: 0 }));
      }

      const d1 = [uVals[1] - uVals[0], uVals[2] - uVals[1], uVals[3] - uVals[2], uVals[4] - uVals[3]];
      const d2 = [d1[1] - d1[0], d1[2] - d1[1], d1[3] - d1[2]];

      const isDeg2 = d2.every((v) => Math.abs(v - d2[0]) < 1e-4);
      const isDeg1 = d1.every((v) => Math.abs(v - d1[0]) < 1e-4);

      if (isDeg2 && Math.abs(d2[0]) > 1e-5) {
        const A = d2[0] / 2;
        const B = d1[0] - A;
        const C = uVals[0];

        const delta = B * B - 4 * A * C;
        const steps: SolutionStep[] = [];
        let stepNumber = 1;

        let displayEq: string;
        try {
          displayEq = nerdamer(standardExpr).toTeX();
        } catch {
          displayEq = standardExpr;
        }

        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Write the equation in standard form $f(' + variable + ') = 0$:',
          math: displayEq + ' = 0',
        });

        const lawNotes: string[] = [];
        for (const t of terms) {
          if (t.d !== 0 || t.c !== 1) {
            const baseTerm = `${targetBaseStr}^{${variable}}`;
            const expandedTerm = t.d !== 0
              ? `${targetBaseStr}^{${t.d}} \\cdot (${baseTerm})^{${t.c}} = ${formatNum(Math.pow(t.baseVal, t.d))}(${baseTerm})^{${t.c}}`
              : `(${baseTerm})^{${t.c}}`;
            const cleanFull = t.full.replace(/\*/g, '').replace(/\^\(([^)]+)\)/g, '^{$1}');
            lawNotes.push(`${cleanFull} = ${expandedTerm}`);
          }
        }

        if (lawNotes.length > 0) {
          steps.push({
            stepNumber: stepNumber++,
            explanation: `Apply index laws $b^{cx + d} = b^d \\cdot (b^x)^c$ to separate the exponential terms:`,
            math: lawNotes.join(' \\quad \\text{and} \\quad '),
          });
        }

        const aLead = A === 1 ? '' : A === -1 ? '-' : formatNum(A);
        const bPart = B === 0 ? '' : (B > 0 ? '+ ' : '- ') + (Math.abs(B) === 1 ? '' : formatNum(Math.abs(B))) + 'u ';
        const cPart = C === 0 ? '' : (C > 0 ? '+ ' : '- ') + formatNum(Math.abs(C)) + ' ';
        const quadEqU = aLead + 'u^2 ' + bPart + cPart + '= 0';

        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Substitute $u = ' + targetBaseStr + '^{' + variable + '}$ (with $u > 0$) to transform the equation into a quadratic in $u$:',
          math: quadEqU,
        });

        const bStr = B < 0 ? '(-' + formatNum(Math.abs(B)) + ')' : formatNum(B);
        const cStr = C < 0 ? '(-' + formatNum(Math.abs(C)) + ')' : formatNum(C);

        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Calculate the discriminant $\\Delta = B^2 - 4AC$ with coefficients $A = ' + formatNum(A) + '$, $B = ' + formatNum(B) + '$, $C = ' + formatNum(C) + '$:',
          math: '\\Delta = ' + bStr + '^2 - 4(' + formatNum(A) + ')(' + cStr + ') = ' + formatNum(B * B) + ' - ' + formatNum(4 * A * C) + ' = ' + formatNum(delta),
        });

        if (delta < 0) {
          steps.push({
            stepNumber: stepNumber++,
            explanation: 'Since $\\Delta < 0$, the quadratic has no real solutions in $u$. Consequently, there are no real solutions for $' + variable + '$.',
            math: '\\Delta < 0 \\implies \\text{No real solution}',
          });
          return {
            type: 'polynomial',
            steps,
            finalAnswer: '\\text{No real solution}',
            numericRoots: [],
          };
        }

        const sqrtDelta = Math.sqrt(delta);
        const u1 = (-B + sqrtDelta) / (2 * A);
        const u2 = (-B - sqrtDelta) / (2 * A);

        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Apply the quadratic formula $u = \\frac{-B \\pm \\sqrt{\\Delta}}{2A}$ to solve for $u$:',
          math: `u = \\frac{-${bStr} \\pm \\sqrt{${formatNum(delta)}}}{2(${formatNum(A)})} = \\frac{${formatNum(-B)} \\pm ${formatNum(sqrtDelta)}}{${formatNum(2 * A)}} \\implies u_1 = ${formatNum(u1)}, \\quad u_2 = ${formatNum(u2)}`,
        });

        const solvedRoots: { xVal: number; exact: string }[] = [];
        const subSteps: string[] = [];

        const uCandidates = Math.abs(u1 - u2) < 1e-6 ? [u1] : [u1, u2];
        for (let i = 0; i < uCandidates.length; i++) {
          const uVal = uCandidates[i];
          const res = solveBasePower(targetBaseVal, targetBaseStr, uVal, variable);
          const caseLabel = uCandidates.length > 1 ? `\\textbf{Case ${i + 1}: }` : '';
          if (res.solvable && res.xVal !== undefined && res.exactLatex !== undefined) {
            solvedRoots.push({ xVal: res.xVal, exact: res.exactLatex });
            subSteps.push(`&${caseLabel} u = ${formatNum(uVal)} \\implies ${res.stepExplanation}`);
          } else if (res.stepExplanation) {
            subSteps.push(`&${caseLabel} u = ${formatNum(uVal)} \\implies ${res.stepExplanation}`);
          }
        }

        steps.push({
          stepNumber: stepNumber++,
          explanation: `Back-substitute $u = ${targetBaseStr}^{${variable}}$ into each value of $u$ to solve for $${variable}$ (using $a = a^1$ and $\\frac{1}{a} = a^{-1}$):`,
          math: `\\begin{aligned} ${subSteps.join(' \\\\[6pt] ')} \\end{aligned}`,
        });

        if (solvedRoots.length === 0) {
          return {
            type: 'polynomial',
            steps,
            finalAnswer: '\\text{No real solution}',
            numericRoots: [],
          };
        }

        solvedRoots.sort((a, b) => a.xVal - b.xVal);
        const distinctRoots = solvedRoots.filter(
          (r, idx, arr) => idx === 0 || Math.abs(r.xVal - arr[idx - 1].xVal) > 1e-5
        );

        const rootStrs = distinctRoots.map((r, i) =>
          distinctRoots.length === 1 ? variable + ' = ' + r.exact : variable + '_' + (i + 1) + ' = ' + r.exact
        );

        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Collect all valid solutions for $' + variable + '$:',
          math: rootStrs.join(', \\quad '),
        });

        return {
          type: 'polynomial',
          steps,
          finalAnswer: rootStrs.join(', \\quad '),
          numericRoots: distinctRoots.map((r) => r.xVal),
        };
      } else if (isDeg1 && Math.abs(d1[0]) > 1e-5) {
        const A = d1[0];
        const B = uVals[0];
        const u = -B / A;

        const steps: SolutionStep[] = [];
        let stepNumber = 1;

        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Write the equation in standard form:',
          math: nerdamer(standardExpr).toTeX() + ' = 0',
        });

        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Substitute $u = ' + targetBaseStr + '^{' + variable + '}$ to obtain a linear equation in $u$:',
          math: formatNum(A) + 'u ' + (B >= 0 ? '+ ' + formatNum(B) : '- ' + formatNum(Math.abs(B))) + ' = 0 \\implies u = ' + formatNum(u),
        });

        const res = solveBasePower(targetBaseVal, targetBaseStr, u, variable);
        if (!res.solvable || res.xVal === undefined) {
          steps.push({
            stepNumber: stepNumber++,
            explanation: res.stepExplanation || 'No real solution exists.',
            math: '\\text{No real solution}',
          });
          return {
            type: 'polynomial',
            steps,
            finalAnswer: '\\text{No real solution}',
            numericRoots: [],
          };
        }

        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Back-substitute $u = ' + targetBaseStr + '^{' + variable + '}$:',
          math: res.stepExplanation || '',
        });

        const ans = variable + ' = ' + res.exactLatex;
        return {
          type: 'polynomial',
          steps,
          finalAnswer: ans,
          numericRoots: [res.xVal],
        };
      }
    } catch {
      // Fall through to general solver
    }
  }

  return solveGeneralExponential(standardExpr, variable, norm, rawEquation);
}

/**
 * Fallback solver for general exponential equations using nerdamer.solve and step generation.
 */
function solveGeneralExponential(
  standardExpr: string,
  variable: string,
  norm: string,
  rawEquation?: string
): SolverResult | null {
  try {
    const solutions = (nerdamer as any).solve(standardExpr, variable);
    const solStr = String(solutions || '');
    if (!solStr || solStr === '[]' || solStr.includes('solve(')) {
      return null;
    }

    const cleanSols = solStr
      .replace(/^\\[|\\]$/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (cleanSols.length === 0) return null;

    const numericRoots: number[] = [];
    const formattedRoots: string[] = [];

    cleanSols.forEach((sol, idx) => {
      let latex = sol;
      try {
        latex = nerdamer(sol).toTeX();
      } catch {
        latex = sol;
      }

      let numVal = NaN;
      try {
        numVal = parseFloat(math.evaluate(sol));
      } catch {
        numVal = parseFloat(sol);
      }

      if (!isNaN(numVal)) {
        numericRoots.push(numVal);
      }

      formattedRoots.push(
        cleanSols.length === 1 ? variable + ' = ' + latex : variable + '_' + (idx + 1) + ' = ' + latex
      );
    });

    const steps: SolutionStep[] = [
      {
        stepNumber: 1,
        explanation: 'Set the exponential equation in standard form $f(' + variable + ') = 0$:',
        math: nerdamer(standardExpr).toTeX() + ' = 0',
      },
      {
        stepNumber: 2,
        explanation: 'Isolate the exponential terms and solve for $' + variable + '$ using logarithms:',
        math: formattedRoots.join(', \\quad '),
      },
    ];

    return {
      type: 'polynomial',
      steps,
      finalAnswer: formattedRoots.join(', \\quad '),
      numericRoots,
      inputInterpretation: '\\text{Solve: } ' + nerdamer(standardExpr).toTeX() + ' = 0 \\text{ for } ' + variable,
    };
  } catch {
    return null;
  }
}
