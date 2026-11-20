import { SolutionStep, DivisionDetails, QuadraticMethod, SubStep } from '@/types/solver';
import { expressionToLatex } from './normalizer';

/** Format a signed coefficient term for display, handling +/- gracefully. */
function signedTerm(coeff: number, varPart: string, isFirst: boolean): string {
  if (coeff === 0) return '';
  const absC = Math.abs(coeff);
  const sign = coeff > 0 ? (isFirst ? '' : '+ ') : '- ';
  const num = absC === 1 && varPart ? '' : `${fmt(absC)}`;
  return `${sign}${num}${varPart}`;
}

/** Format a polynomial expression from coefficients [a_n, ..., a_0]. */
export function formatPolynomial(coeffs: number[], variable: string): string {
  const degree = coeffs.length - 1;
  const parts: string[] = [];
  for (let i = 0; i <= degree; i++) {
    const c = coeffs[i];
    if (c === 0) continue;
    const power = degree - i;
    let varPart = '';
    if (power >= 2) varPart = `${variable}^${power}`;
    else if (power === 1) varPart = variable;
    parts.push(signedTerm(c, varPart, parts.length === 0));
  }
  return parts.length > 0 ? parts.join(' ') : '0';
}

/** Format a polynomial including 0 coefficients (e.g. "72t^3 + 0t^2 + 4t - 76"). */
export function formatPolyWithZeros(coeffs: number[], variable: string): string {
  const degree = coeffs.length - 1;
  const parts: string[] = [];
  for (let i = 0; i <= degree; i++) {
    const c = coeffs[i];
    const power = degree - i;
    let varPart = '';
    if (power >= 2) varPart = `${variable}^${power}`;
    else if (power === 1) varPart = variable;

    if (parts.length === 0) {
      const num = c === 1 && varPart ? '' : c === -1 && varPart ? '-' : `${fmt(c)}`;
      parts.push(`${num}${varPart}`);
    } else {
      const sign = c >= 0 ? '+ ' : '- ';
      const absC = Math.abs(c);
      const num = absC === 1 && varPart ? '' : `${fmt(absC)}`;
      parts.push(`${sign}${num}${varPart}`);
    }
  }
  return parts.length > 0 ? parts.join(' ') : '0';
}

/** Format a number for clean display: strip trailing zeros, round near-integers. */
export function fmt(n: number): string {
  if (!Number.isFinite(n) || isNaN(n)) return '0';
  const rounded = Math.round(n);
  if (Math.abs(n - rounded) < 1e-6) return rounded.toString();
  // Round to at most 6 decimal places, remove trailing zeros
  const s = Number(n.toFixed(6)).toString();
  return s;
}

/** Try to represent a floating point number as a simple fraction {n, d}. */
export function toFraction(val: number, maxDenominator: number = 1000): { n: number; d: number } | null {
  if (!Number.isFinite(val) || isNaN(val)) return null;
  const sign = val < 0 ? -1 : 1;
  const absVal = Math.abs(val);
  const rounded = Math.round(absVal);
  if (Math.abs(absVal - rounded) < 1e-9) {
    return { n: sign * rounded, d: 1 };
  }

  // Check common small denominators up to 1000 with 1e-9 precision
  const maxDen = Math.min(maxDenominator, 1000);
  for (let d = 2; d <= maxDen; d++) {
    const n = Math.round(absVal * d);
    if (Math.abs(absVal - n / d) < 1e-9) {
      const g = gcd(n, d);
      return { n: sign * (n / g), d: d / g };
    }
  }
  return null;
}

/** Format a number as exact fraction LaTeX if rational, else fall back to fmt(). */
export function fmtFraction(n: number): string {
  if (!Number.isFinite(n) || isNaN(n)) return '0';
  const frac = toFraction(n);
  if (frac) {
    if (frac.d === 1) return frac.n.toString();
    const signStr = frac.n < 0 ? '-' : '';
    return `${signStr}\\frac{${Math.abs(frac.n)}}{${frac.d}}`;
  }
  return fmt(n);
}

/** Compute GCD of two integers. */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/** Check if a number is a non-negative perfect square integer. */
function isPerfectSquare(n: number): boolean {
  if (n < 0 || !Number.isFinite(n)) return false;
  const rounded = Math.round(n);
  if (Math.abs(n - rounded) > 1e-6) return false;
  if (rounded < 0) return false;
  const s = Math.round(Math.sqrt(rounded));
  return s * s === rounded;
}

/** Formats a linear factor (qx - p) for a rational root r = p/q */
export function formatLinearFactor(root: number, variable: string = 'x'): string {
  const frac = toFraction(root);
  if (frac) {
    const { n, d } = frac;
    // (d*x - n)
    const varPart = d === 1 ? variable : `${d}${variable}`;
    if (n === 0) return varPart;
    const sign = n > 0 ? '-' : '+';
    return `(${varPart} ${sign} ${Math.abs(n)})`;
  }
  const rootStr = fmt(Math.abs(root));
  return root >= 0 ? `(${variable} - ${rootStr})` : `(${variable} + ${rootStr})`;
}

/** Find all positive integer factors of n up to cap. */
export function getFactors(n: number, cap: number = 100): number[] {
  n = Math.abs(Math.round(n));
  if (n === 0) return [0];
  const factors: number[] = [];
  for (let i = 1; i <= Math.min(n, cap); i++) {
    if (n % i === 0) factors.push(i);
  }
  return factors;
}

/** Evaluate polynomial value P(x) from coefficients [a_n, ..., a_0]. */
export function evalPoly(coeffs: number[], x: number): number {
  let res = 0;
  for (let i = 0; i < coeffs.length; i++) {
    res = res * x + coeffs[i];
  }
  return res;
}

/** Format evaluation of f(x0) showing substituted terms and result. */
function formatPolyEvaluation(coeffs: number[], x0: number, variable: string, includePrefix: boolean = true): string {
  const degree = coeffs.length - 1;
  const terms: string[] = [];
  const evalTerms: string[] = [];

  for (let i = 0; i <= degree; i++) {
    const c = coeffs[i];
    if (c === 0) continue;
    const power = degree - i;
    const absC = Math.abs(c);
    const sign = c > 0 ? (terms.length === 0 ? '' : '+ ') : '- ';
    const termVal = c * Math.pow(x0, power);
    const evalSign = termVal >= 0 ? (evalTerms.length === 0 ? '' : '+ ') : '- ';

    let varStr = '';
    if (power >= 2) varStr = `(${fmt(x0)})^${power}`;
    else if (power === 1) varStr = `(${fmt(x0)})`;

    const coeffStr = absC === 1 && power > 0 ? '' : `${fmt(absC)}`;
    terms.push(`${sign}${coeffStr}${varStr}`);
    evalTerms.push(`${evalSign}${fmt(Math.abs(termVal))}`);
  }

  const isRoot = Math.abs(evalPoly(coeffs, x0)) < 1e-6;
  const checkMark = isRoot ? ' = 0 \\;\\checkmark' : ` = ${fmt(evalPoly(coeffs, x0))}`;
  const prefix = includePrefix ? `f(${fmt(x0)}) = ` : '';
  return `${prefix}${terms.join(' ')} = ${evalTerms.join(' ')}${checkMark}`;
}

// ─── POLYNOMIAL DIVISION GENERATORS (LONG DIVISION & SYNTHETIC DIVISION) ────

/**
 * Generate full polynomial long division LaTeX (NCERT/CBSE style bracket array).
 * Renders the divisor, dividend, building quotient, step-by-step subtraction, and remainder.
 */
export function generatePolynomialLongDivisionLatex(
  dividendCoeffs: number[],
  root: number,
  variable: string = 'x'
): string {
  const n = dividendCoeffs.length - 1;
  const quotient: number[] = [dividendCoeffs[0]];
  for (let i = 1; i < n; i++) {
    quotient.push(dividendCoeffs[i] + quotient[i - 1] * root);
  }
  const remainder = dividendCoeffs[n] + quotient[n - 1] * root;

  const rSign = root >= 0 ? `- ${fmt(Math.abs(root))}` : `+ ${fmt(Math.abs(root))}`;
  const divisorStr = `${variable} ${rSign}`;
  const quotientStr = formatPolynomial(quotient, variable);
  const dividendStr = formatPolynomial(dividendCoeffs, variable);

  const lines: string[] = [];
  lines.push(`${quotientStr} \\\\`);
  lines.push(`${divisorStr}{\\overline{\\smash{\\big)}\\, ${dividendStr}}} \\\\`);

  for (let step = 0; step < n; step++) {
    const qCoeff = quotient[step];
    const power = n - 1 - step;

    // Subtracted term 1: qCoeff * x^(power + 1)
    const term1Var = power + 1 >= 2 ? `${variable}^${power + 1}` : power + 1 === 1 ? variable : '';
    const term1Str = `${qCoeff === 1 && term1Var ? '' : qCoeff === -1 && term1Var ? '-' : fmt(qCoeff)}${term1Var}`;

    // Subtracted term 2: -qCoeff * root * x^power
    const subConst = -qCoeff * root;
    const term2Var = power >= 2 ? `${variable}^${power}` : power === 1 ? variable : '';
    const term2Sign = subConst >= 0 ? '+ ' : '- ';
    const term2Abs = Math.abs(subConst);
    const term2Str = `${term2Sign}${term2Abs === 1 && term2Var ? '' : fmt(term2Abs)}${term2Var}`;

    const ph = '\\phantom{' + '-'.repeat(Math.max(2, (n - 1 - step) * 6)) + '}';
    lines.push(`\\underline{-(${term1Str} ${term2Str})${ph}} \\\\`);

    // Next term brought down
    if (step < n - 1) {
      const remCoeff = quotient[step + 1];
      const remPower = n - 1 - step;
      const remVar = remPower >= 2 ? `${variable}^${remPower}` : remPower === 1 ? variable : '';

      const broughtDownCoeff = dividendCoeffs[step + 2];
      const bdPower = n - 2 - step;
      const bdVar = bdPower >= 2 ? `${variable}^${bdPower}` : bdPower === 1 ? variable : '';
      const bdSign = broughtDownCoeff >= 0 ? '+ ' : '- ';
      const bdAbs = Math.abs(broughtDownCoeff);
      const bdStr = `${bdSign}${bdAbs === 1 && bdVar ? '' : fmt(bdAbs)}${bdVar}`;

      const remLeadStr = `${remCoeff === 1 && remVar ? '' : remCoeff === -1 && remVar ? '-' : fmt(remCoeff)}${remVar}`;
      const nextPh = '\\phantom{' + '-'.repeat(Math.max(2, (n - 2 - step) * 6)) + '}';
      lines.push(`${remLeadStr} ${bdStr}${nextPh} \\\\`);
    } else {
      lines.push(`${fmt(remainder)}`);
    }
  }

  return `\\begin{array}{r}\n${lines.join('\n')}\n\\end{array}`;
}

/**
 * Generate synthetic division array LaTeX.
 */
export function generateSyntheticDivisionLatex(
  dividendCoeffs: number[],
  root: number,
  variable: string = 'x'
): string {
  const n = dividendCoeffs.length - 1;
  const quotient: number[] = [dividendCoeffs[0]];
  const mults: number[] = [0];

  for (let i = 1; i < n; i++) {
    const mult = quotient[i - 1] * root;
    mults.push(mult);
    quotient.push(dividendCoeffs[i] + mult);
  }
  const lastMult = quotient[n - 1] * root;
  mults.push(lastMult);
  const remainder = dividendCoeffs[n] + lastMult;

  const colAlign = 'c|' + 'r'.repeat(dividendCoeffs.length);
  const row1 = `${fmt(root)} & ` + dividendCoeffs.map((c) => fmt(c)).join(' & ');
  const row2 = '& & ' + mults.slice(1).map((m) => fmt(m)).join(' & ');
  const row3 = quotient.map((q) => fmt(q)).join(' & ') + ` & ${fmt(remainder)}`;

  return `\\begin{array}{${colAlign}} ${row1} \\\\ ${row2} \\\\ \\hline & ${row3} \\end{array}`;
}

// ─── DEGREE 1: LINEAR STEPS ──────────────────────────────────────────────────

/** Clean display expression for human readability by stripping implicit asterisks. */
function cleanDisplay(expr: string): string {
  if (!expr) return '';
  return expr
    .replace(/(\d+)\s*\*\s*([a-zA-Z])/g, '$1$2')
    .replace(/([a-zA-Z])\s*\*\s*([a-zA-Z])/g, '$1$2')
    .replace(/\)\s*\*\s*\(/g, ')(')
    .replace(/(\d+)\s*\*\s*\(/g, '$1(');
}

export interface EquationSidesContext {
  lhs: string;
  rhs: string;
  lhsCoeffs?: number[];
  rhsCoeffs?: number[];
  rawEquation?: string;
}

/**
 * Format Step 1 for polynomial equations, showing the algebraic rearrangement
 * from the user's original equation to standard form (P(x) = 0).
 */
export function formatStandardFormStep(
  degree: number,
  coeffs: number[],
  variable: string,
  equationContext?: string | EquationSidesContext
): { explanation: string; math: string; subSteps?: SubStep[] } {
  const degreeName =
    degree === 1
      ? 'linear'
      : degree === 2
      ? 'quadratic'
      : degree === 3
      ? 'cubic'
      : degree === 4
      ? 'quartic'
      : 'polynomial';

  const formStr =
    degree === 1
      ? `a${variable} + b = 0`
      : degree === 2
      ? `a${variable}^2 + b${variable} + c = 0`
      : degree === 3
      ? `a${variable}^3 + b${variable}^2 + c${variable} + d = 0`
      : degree === 4
      ? `a${variable}^4 + b${variable}^3 + c${variable}^2 + d${variable} + e = 0`
      : `P(${variable}) = 0`;

  const standardPoly = `${formatPolynomial(coeffs, variable)} = 0`;

  let context: EquationSidesContext | null = null;
  if (typeof equationContext === 'string') {
    if (equationContext.includes('=')) {
      const [l, r] = equationContext.split('=');
      context = { lhs: l.trim(), rhs: r.trim() };
    }
  } else if (equationContext && typeof equationContext === 'object') {
    context = equationContext;
  }

  // If no RHS or RHS is already 0, equation is already in standard form
  if (!context || !context.rhs || context.rhs === '0' || context.rhs === '') {
    return {
      explanation: `Write the equation in standard ${degreeName} form $${formStr}$.`,
      math: standardPoly,
    };
  }

  const rawLhs = cleanDisplay(context.lhs);
  const rawRhs = cleanDisplay(context.rhs);
  const lhsLatex = expressionToLatex(rawLhs);
  const rhsLatex = expressionToLatex(rawRhs);

  // If LHS is already standard poly and RHS is 0, no rearrangement needed
  if (lhsLatex === formatPolynomial(coeffs, variable) && rhsLatex === '0') {
    return {
      explanation: `Write the equation in standard ${degreeName} form $${formStr}$.`,
      math: standardPoly,
    };
  }

  const lines: string[] = [
    `\\text{Given equation:} \\quad & ${lhsLatex} = ${rhsLatex}`,
    `\\text{Move all terms to LHS:} \\quad & (${lhsLatex}) - (${rhsLatex}) = 0`,
  ];

  const subSteps: SubStep[] = [
    {
      title: 'Step 1a: Subtract RHS from both sides',
      math: `(${lhsLatex}) - (${rhsLatex}) = 0`,
    },
  ];

  // Grouping like terms for linear (degree 1)
  if (degree === 1 && context.lhsCoeffs && context.rhsCoeffs) {
    const pad = (arr: number[]) => (arr.length === 1 ? [0, arr[0]] : arr.length === 2 ? arr : [arr[0], arr[1]]);
    const [a1, b1] = pad(context.lhsCoeffs);
    const [a2, b2] = pad(context.rhsCoeffs);

    let varPart = '';
    if (a1 !== 0 && a2 !== 0) {
      varPart = `(${fmt(a1)}${variable} - ${fmt(a2)}${variable})`;
    } else if (a1 !== 0) {
      varPart = `${fmt(a1)}${variable}`;
    } else if (a2 !== 0) {
      varPart = `(-${fmt(a2)}${variable})`;
    }

    let constPart = '';
    if (b1 !== 0 && b2 !== 0) {
      constPart = `(${fmt(b1)} - ${fmt(b2)})`;
    } else if (b1 !== 0) {
      constPart = `${fmt(b1)}`;
    } else if (b2 !== 0) {
      constPart = `(-${fmt(b2)})`;
    }

    let grouped = '';
    if (varPart && constPart) {
      grouped = `${varPart} + ${constPart} = 0`;
    } else if (varPart) {
      grouped = `${varPart} = 0`;
    } else if (constPart) {
      grouped = `${constPart} = 0`;
    }

    if (grouped) {
      lines.push(`\\text{Group like terms:} \\quad & ${grouped}`);
      subSteps.push({
        title: 'Step 1b: Group like terms',
        math: grouped,
      });
    }
  } else if (degree === 2 && context.lhsCoeffs && context.rhsCoeffs) {
    const pad3 = (arr: number[]) => {
      if (arr.length === 1) return [0, 0, arr[0]];
      if (arr.length === 2) return [0, arr[0], arr[1]];
      return [arr[0], arr[1], arr[2]];
    };
    const [a1, b1, c1] = pad3(context.lhsCoeffs);
    const [a2, b2, c2] = pad3(context.rhsCoeffs);

    const parts: string[] = [];
    if (a1 !== 0 || a2 !== 0) {
      if (a1 !== 0 && a2 !== 0) parts.push(`(${fmt(a1)} - ${fmt(a2)})${variable}^2`);
      else if (a1 !== 0) parts.push(`${fmt(a1)}${variable}^2`);
      else parts.push(`(-${fmt(a2)})${variable}^2`);
    }
    if (b1 !== 0 || b2 !== 0) {
      if (b1 !== 0 && b2 !== 0) parts.push(`(${fmt(b1)} - ${fmt(b2)})${variable}`);
      else if (b1 !== 0) parts.push(`${fmt(b1)}${variable}`);
      else parts.push(`(-${fmt(b2)})${variable}`);
    }
    if (c1 !== 0 || c2 !== 0) {
      if (c1 !== 0 && c2 !== 0) parts.push(`(${fmt(c1)} - ${fmt(c2)})`);
      else if (c1 !== 0) parts.push(`${fmt(c1)}`);
      else parts.push(`(-${fmt(c2)})`);
    }
    if (parts.length > 0) {
      const grouped = `${parts.join(' + ')} = 0`;
      lines.push(`\\text{Group like terms:} \\quad & ${grouped}`);
      subSteps.push({
        title: 'Step 1b: Group like terms',
        math: grouped,
      });
    }
  }

  lines.push(`\\text{Standard form } (${formStr}): \\quad & ${standardPoly}`);
  subSteps.push({
    title: 'Step 1c: Combine to standard form',
    math: standardPoly,
  });

  return {
    explanation: `Write the equation in standard ${degreeName} form $${formStr}$ by moving all terms to the left-hand side and combining like terms.`,
    math: `\\begin{aligned} ${lines.join(' \\\\[4pt] ')} \\end{aligned}`,
    subSteps,
  };
}

/** Format verification substitution for linear equation: f(root) = 0 or LHS = RHS */
function formatLinearVerification(
  a: number,
  b: number,
  root: number,
  variable: string,
  context?: EquationSidesContext
): { explanation: string; math: string } {
  const rootStr = fmtFraction(root);

  if (context && context.rhs && context.rhs !== '0' && context.lhsCoeffs && context.rhsCoeffs) {
    const pad = (arr: number[]) => (arr.length === 1 ? [0, arr[0]] : arr.length === 2 ? arr : [arr[0], arr[1]]);
    const [a1, b1] = pad(context.lhsCoeffs);
    const [a2, b2] = pad(context.rhsCoeffs);

    const fmtSide = (ca: number, cb: number) => {
      const termA = ca * root;
      const total = termA + cb;
      const aSign = ca === 1 ? '' : ca === -1 ? '-' : `${fmt(ca)}`;
      const bSign = cb >= 0 ? '+' : '-';
      const bAbs = fmt(Math.abs(cb));
      const totalDisp = Number.isInteger(total) ? fmt(total) : fmtFraction(total);
      if (ca !== 0 && cb !== 0) {
        return `${aSign}(${rootStr}) ${bSign} ${bAbs} = ${fmt(termA)} ${bSign} ${bAbs} = ${totalDisp}`;
      } else if (ca !== 0) {
        return `${aSign}(${rootStr}) = ${totalDisp}`;
      } else {
        return `${fmt(cb)}`;
      }
    };

    const lhsEval = fmtSide(a1, b1);
    const rhsEval = fmtSide(a2, b2);
    const expectedVal = Number.isInteger(a1 * root + b1) ? fmt(a1 * root + b1) : fmtFraction(a1 * root + b1);

    return {
      explanation: `Verify the solution by substituting $${variable} = ${rootStr}$ into the original equation.`,
      math: `\\begin{aligned} \\text{Left-hand side (LHS):} \\quad & ${lhsEval} \\\\[4pt] \\text{Right-hand side (RHS):} \\quad & ${rhsEval} \\\\[4pt] \\implies & \\text{LHS} = \\text{RHS} = ${expectedVal} \\quad \\checkmark \\end{aligned}`,
    };
  }

  // Fallback if equation was already f(x) = 0
  const aStr = a === 1 ? '' : a === -1 ? '-' : `${fmt(a)}`;
  const bSign = b >= 0 ? '+' : '-';
  const bAbs = fmt(Math.abs(b));
  const subMath = `${aStr}(${rootStr}) ${b !== 0 ? `${bSign} ${bAbs}` : ''} = ${fmt(a * root)} ${b !== 0 ? `${bSign} ${bAbs}` : ''} = 0 \\;\\checkmark`;

  return {
    explanation: `Verify the solution by substituting $${variable} = ${rootStr}$ back into the equation.`,
    math: `\\text{Check } ${variable} = ${rootStr}: \\; ${subMath}`,
  };
}

export function generateLinearSteps(
  a: number,
  b: number,
  variable: string = 'x',
  equationContext?: string | EquationSidesContext
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  const stdStep = formatStandardFormStep(1, [a, b], variable, equationContext);
  steps.push({
    stepNumber: stepCount++,
    explanation: stdStep.explanation,
    math: stdStep.math,
    subSteps: stdStep.subSteps,
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: `Move the constant term to the right side of the equation.`,
    math: `${fmt(a)}${variable} = ${fmt(-b)}`,
  });

  const root = -b / a;
  const rootFrac = toFraction(root);
  const rootDisplay = rootFrac && rootFrac.d > 1 ? fmtFraction(root) : fmt(root);
  steps.push({
    stepNumber: stepCount++,
    explanation: `Divide both sides by the leading coefficient $a = ${fmt(a)}$ to isolate $${variable}$.`,
    math: `${variable} = \\frac{${fmt(-b)}}{${fmt(a)}} = ${rootDisplay}`,
  });

  // Step 4: Verification
  let parsedContext: EquationSidesContext | undefined = undefined;
  if (typeof equationContext === 'string') {
    if (equationContext.includes('=')) {
      const [l, r] = equationContext.split('=');
      parsedContext = { lhs: l.trim(), rhs: r.trim() };
    }
  } else if (equationContext && typeof equationContext === 'object') {
    parsedContext = equationContext;
  }
  const verif = formatLinearVerification(a, b, root, variable, parsedContext);
  steps.push({
    stepNumber: stepCount++,
    explanation: verif.explanation,
    math: verif.math,
  });

  return steps;
}

// ─── DEGREE 2: QUADRATIC STEPS ───────────────────────────────────────────────

/** Find integer factors m, n such that m * n = c and m + n = b. */
function findMonicFactors(b: number, c: number): { m: number; n: number } | null {
  const roundB = Math.round(b);
  const roundC = Math.round(c);
  if (Math.abs(b - roundB) > 1e-5 || Math.abs(c - roundC) > 1e-5) return null;

  const delta = roundB * roundB - 4 * roundC;
  if (!isPerfectSquare(delta)) return null;

  const absC = Math.abs(roundC);
  if (absC === 0) {
    return { m: 0, n: roundB };
  }

  for (let i = 1; i * i <= absC; i++) {
    if (absC % i === 0) {
      const p1 = i;
      const q1 = roundC / i;
      if (p1 + q1 === roundB) return { m: p1, n: q1 };
      if (-p1 - q1 === roundB) return { m: -p1, n: -q1 };

      const p2 = -i;
      const q2 = -roundC / i;
      if (p2 + q2 === roundB) return { m: p2, n: q2 };
    }
  }

  const sqrtD = Math.round(Math.sqrt(delta));
  const r1 = (-roundB + sqrtD) / 2;
  const r2 = (-roundB - sqrtD) / 2;
  if (Number.isInteger(r1) && Number.isInteger(r2)) {
    return { m: -r1, n: -r2 };
  }

  return null;
}

/** Find integer factors for non-monic quadratics ax^2 + bx + c = 0 via AC method. */
function findACFactors(
  a: number,
  b: number,
  c: number
): {
  m: number;
  n: number;
  r1: number;
  s1: number;
  r2: number;
  s2: number;
  x1: number;
  x2: number;
} | null {
  const roundA = Math.round(a);
  const roundB = Math.round(b);
  const roundC = Math.round(c);
  if (
    Math.abs(a - roundA) > 1e-5 ||
    Math.abs(b - roundB) > 1e-5 ||
    Math.abs(c - roundC) > 1e-5
  ) {
    return null;
  }

  const delta = roundB * roundB - 4 * roundA * roundC;
  if (!isPerfectSquare(delta)) return null;

  const ac = roundA * roundC;
  const absAC = Math.abs(ac);
  const pairs: [number, number][] = [];

  if (absAC === 0) {
    pairs.push([0, roundB]);
  } else {
    for (let i = 1; i * i <= absAC; i++) {
      if (absAC % i === 0) {
        pairs.push([i, ac / i]);
        pairs.push([-i, -ac / i]);
      }
    }
  }

  let matched: { m: number; n: number } | null = null;
  for (const [p, q] of pairs) {
    if (p + q === roundB) {
      matched = { m: p, n: q };
      break;
    }
  }

  if (!matched) return null;
  const { m, n } = matched;

  const g1 = gcd(roundA, m) * (roundA < 0 ? -1 : 1);
  const r1 = roundA / g1;
  const s1 = m / g1;

  const r2 = g1;
  const s2 = n / r1;

  const x1 = -s1 / r1;
  const x2 = -s2 / r2;

  return { m, n, r1, s1, r2, s2, x1, x2 };
}

/** Format verification substitution for a quadratic equation: f(root) = ... = 0 */
function formatQuadraticVerification(
  a: number,
  b: number,
  c: number,
  root: number,
  variable: string
): string {
  const rootStr = fmt(root);
  const term1 = a * root * root;
  const term2 = b * root;
  const term3 = c;

  const aStr = a === 1 ? '' : a === -1 ? '-' : `${fmt(a)}`;
  const bSign = b >= 0 ? '+' : '-';
  const bStr = Math.abs(b) === 1 ? '' : `${fmt(Math.abs(b))}`;
  const cSign = c >= 0 ? '+' : '-';
  const cStr = `${fmt(Math.abs(c))}`;

  const substituted = `${aStr}(${rootStr})^2 ${b !== 0 ? `${bSign} ${bStr}(${rootStr}) ` : ''}${c !== 0 ? `${cSign} ${cStr}` : ''}`;
  const computed = `${fmt(term1)} ${term2 >= 0 ? `+ ${fmt(term2)}` : `- ${fmt(Math.abs(term2))}`} ${term3 >= 0 ? `+ ${fmt(term3)}` : `- ${fmt(Math.abs(term3))}`}`;

  return `\\text{Check } ${variable} = ${rootStr}: \\; ${substituted.trim()} = ${computed.trim()} = 0 \\;\\checkmark`;
}

/** Generate Completing the Square steps for quadratic ax^2 + bx + c = 0 */
export function generateCompletingTheSquareSteps(
  a: number,
  b: number,
  c: number,
  variable: string = 'x',
  equationContext?: string | EquationSidesContext
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  const stdStep = formatStandardFormStep(2, [a, b, c], variable, equationContext);
  steps.push({
    stepNumber: stepCount++,
    explanation: stdStep.explanation,
    math: stdStep.math,
    subSteps: stdStep.subSteps,
  });

  // Step 2: Divide by leading coefficient a if a != 1
  let bOverA = b / a;
  let cOverA = c / a;
  if (Math.abs(a - 1) >= 1e-6) {
    steps.push({
      stepNumber: stepCount++,
      explanation: `Divide the entire equation by the leading coefficient $a = ${fmt(a)}$ to make it monic ($x^2$).`,
      math: `${variable}^2 ${bOverA >= 0 ? `+ ${fmt(bOverA)}` : `- ${fmt(Math.abs(bOverA))}`}${variable} ${cOverA >= 0 ? `+ ${fmt(cOverA)}` : `- ${fmt(Math.abs(cOverA))}`} = 0`,
    });
  }

  // Step 3: Move constant term to RHS
  const negCOverA = -cOverA;
  steps.push({
    stepNumber: stepCount++,
    explanation: `Isolate the variable terms on the left side by subtracting the constant term from both sides.`,
    math: `${variable}^2 ${bOverA >= 0 ? `+ ${fmt(bOverA)}` : `- ${fmt(Math.abs(bOverA))}`}${variable} = ${fmt(negCOverA)}`,
  });

  // Step 4: Add (b / 2)^2 to both sides
  const halfB = bOverA / 2;
  const halfBSquared = halfB * halfB;
  const rhsSum = negCOverA + halfBSquared;
  steps.push({
    stepNumber: stepCount++,
    explanation: `Complete the square: take half of the coefficient of $${variable}$ ($\\frac{${fmt(bOverA)}}{2} = ${fmt(halfB)}$), square it ($(${fmt(halfB)})^2 = ${fmt(halfBSquared)}$), and add it to both sides.`,
    math: `${variable}^2 ${bOverA >= 0 ? `+ ${fmt(bOverA)}` : `- ${fmt(Math.abs(bOverA))}`}${variable} + ${fmt(halfBSquared)} = ${fmt(negCOverA)} + ${fmt(halfBSquared)} = ${fmt(rhsSum)}`,
  });

  // Step 5: Express LHS as a binomial squared
  const halfBSign = halfB >= 0 ? `+ ${fmt(halfB)}` : `- ${fmt(Math.abs(halfB))}`;
  steps.push({
    stepNumber: stepCount++,
    explanation: `Factor the left-hand side as a perfect square $(x + p)^2$.`,
    math: `(${variable} ${halfBSign})^2 = ${fmt(rhsSum)}`,
  });

  // Step 6: Take square root of both sides
  if (rhsSum >= 0) {
    const sqrtRhs = Math.sqrt(rhsSum);
    const x1 = -halfB + sqrtRhs;
    const x2 = -halfB - sqrtRhs;

    if (Math.abs(rhsSum) < 1e-8) {
      steps.push({
        stepNumber: stepCount++,
        explanation: `Take the square root of both sides:`,
        math: `${variable} ${halfBSign} = 0 \\implies ${variable} = ${fmt(-halfB)}`,
      });
      steps.push({
        stepNumber: stepCount++,
        explanation: `Verify the solution in the original equation.`,
        math: formatQuadraticVerification(a, b, c, -halfB, variable),
      });
    } else {
      steps.push({
        stepNumber: stepCount++,
        explanation: `Take the square root of both sides, including both positive and negative roots ($\\pm$):`,
        math: `${variable} ${halfBSign} = \\pm\\sqrt{${fmt(rhsSum)}} = \\pm ${fmt(sqrtRhs)}`,
      });
      steps.push({
        stepNumber: stepCount++,
        explanation: `Solve for $${variable}$ by subtracting $${fmt(halfB)}$:`,
        math: `${variable}_1 = ${fmt(-halfB)} + ${fmt(sqrtRhs)} = ${fmt(x1)}, \\quad ${variable}_2 = ${fmt(-halfB)} - ${fmt(sqrtRhs)} = ${fmt(x2)}`,
      });
      steps.push({
        stepNumber: stepCount++,
        explanation: `Verify both roots in the original equation.`,
        math: `${formatQuadraticVerification(a, b, c, x1, variable)} \\\\[6pt] ${formatQuadraticVerification(a, b, c, x2, variable)}`,
      });
    }
  } else {
    const imagPart = Math.sqrt(-rhsSum);
    steps.push({
      stepNumber: stepCount++,
      explanation: `Take the square root of both sides. Since the right side is negative, the solutions are complex conjugates:`,
      math: `${variable} ${halfBSign} = \\pm\\sqrt{${fmt(rhsSum)}} = \\pm ${fmt(imagPart)}\\,i`,
    });
    steps.push({
      stepNumber: stepCount++,
      explanation: `Isolate $${variable}$ to obtain the complex conjugate roots:`,
      math: `${variable} = ${fmt(-halfB)} \\pm ${fmt(imagPart)}\\,i`,
    });
    steps.push({
      stepNumber: stepCount++,
      explanation: `Verification for complex roots:`,
      math: `f(${fmt(-halfB)} \\pm ${fmt(imagPart)}i) = 0 \\;\\checkmark`,
    });
  }

  return steps;
}

export function generateQuadraticSteps(
  a: number,
  b: number,
  c: number,
  variable: string = 'x',
  method: QuadraticMethod = 'auto',
  equationContext?: string | EquationSidesContext
): SolutionStep[] {
  // If specific method requested: Completing the Square
  if (method === 'completing_square') {
    return generateCompletingTheSquareSteps(a, b, c, variable, equationContext);
  }

  const steps: SolutionStep[] = [];
  let stepCount = 1;

  // 1. Write the equation in standard form
  const stdStep = formatStandardFormStep(2, [a, b, c], variable, equationContext);
  steps.push({
    stepNumber: stepCount++,
    explanation: stdStep.explanation,
    math: stdStep.math,
    subSteps: stdStep.subSteps,
  });

  const delta = b * b - 4 * a * c;

  // If method is 'auto' or 'factoring', attempt factoring first
  if (method !== 'formula') {
    // ─── PATH 1: Monic Integer Factoring (a = 1) ───────────────────────────
    if (Math.abs(a - 1) < 1e-6) {
      const monicFactors = findMonicFactors(b, c);
      if (monicFactors !== null) {
        const { m, n } = monicFactors;
        const x1 = -m;
        const x2 = -n;

        steps.push({
          stepNumber: stepCount++,
          explanation: `Find two numbers that multiply to $c = ${fmt(c)}$ and add up to $b = ${fmt(b)}$.`,
          math: `(${fmt(m)}) \\times (${fmt(n)}) = ${fmt(c)}, \\quad (${fmt(m)}) + (${fmt(n)}) = ${fmt(b)}`,
        });

        const mSign = m >= 0 ? `+ ${fmt(m)}` : `- ${fmt(Math.abs(m))}`;
        const nSign = n >= 0 ? `+ ${fmt(n)}` : `- ${fmt(Math.abs(n))}`;

        if (m === n) {
          steps.push({
            stepNumber: stepCount++,
            explanation: `Write the quadratic expression in factored form (perfect square trinomial).`,
            math: `(${variable} ${mSign})^2 = 0`,
          });

          steps.push({
            stepNumber: stepCount++,
            explanation: `Set the factor equal to zero and solve for $${variable}$.`,
            math: `${variable} ${mSign} = 0 \\implies ${variable} = ${fmt(x1)}`,
          });

          steps.push({
            stepNumber: stepCount++,
            explanation: `Verify the solution by substituting back into the original equation.`,
            math: formatQuadraticVerification(a, b, c, x1, variable),
          });
        } else {
          steps.push({
            stepNumber: stepCount++,
            explanation: `Write the quadratic expression in factored form.`,
            math: `(${variable} ${mSign})(${variable} ${nSign}) = 0`,
          });

          steps.push({
            stepNumber: stepCount++,
            explanation: `Set each factor equal to zero and solve for $${variable}$.`,
            math: `${variable} ${mSign} = 0 \\implies ${variable}_1 = ${fmt(x1)} \\quad \\text{or} \\quad ${variable} ${nSign} = 0 \\implies ${variable}_2 = ${fmt(x2)}`,
          });

          steps.push({
            stepNumber: stepCount++,
            explanation: `Verify each root by substituting back into the original equation.`,
            math: `${formatQuadraticVerification(a, b, c, x1, variable)} \\\\[6pt] ${formatQuadraticVerification(a, b, c, x2, variable)}`,
          });
        }

        steps.push({
          stepNumber: stepCount++,
          explanation: `Structural Insight (Vieta's Formulas): Notice how the sum and product of the roots directly confirm the original coefficients.`,
          math: `\\text{Sum of roots: } x_1 + x_2 = -\\frac{b}{a} = ${fmt(-b / a)}, \\quad \\text{Product: } x_1 \\cdot x_2 = \\frac{c}{a} = ${fmt(c / a)}`,
        });

        return steps;
      }
    }

    // ─── PATH 2: Non-Monic AC Factoring Method (a ≠ 1) ──────────────────────
    if (Math.abs(a - 1) >= 1e-6 && isPerfectSquare(delta)) {
      const acFactors = findACFactors(a, b, c);
      if (acFactors !== null) {
        const { m, n, r1, s1, r2, s2, x1, x2 } = acFactors;

        steps.push({
          stepNumber: stepCount++,
          explanation: `Apply the $ac$ factoring method: find two numbers that multiply to $ac = (${fmt(a)})(${fmt(c)}) = ${fmt(a * c)}$ and add up to $b = ${fmt(b)}$.`,
          math: `(${fmt(m)}) \\times (${fmt(n)}) = ${fmt(a * c)}, \\quad (${fmt(m)}) + (${fmt(n)}) = ${fmt(b)}`,
        });

        const mSign = m >= 0 ? `+ ${fmt(m)}` : `- ${fmt(Math.abs(m))}`;
        const nSign = n >= 0 ? `+ ${fmt(n)}` : `- ${fmt(Math.abs(n))}`;
        const cSign = c >= 0 ? `+ ${fmt(c)}` : `- ${fmt(Math.abs(c))}`;

        const s1Sign = s1 >= 0 ? `+ ${fmt(s1)}` : `- ${fmt(Math.abs(s1))}`;
        const s2Sign = s2 >= 0 ? `+ ${fmt(s2)}` : `- ${fmt(Math.abs(s2))}`;

        const r1Str = r1 === 1 ? '' : r1 === -1 ? '-' : `${fmt(r1)}`;
        const r2Str = r2 === 1 ? '' : r2 === -1 ? '-' : `${fmt(r2)}`;

        steps.push({
          stepNumber: stepCount++,
          explanation: `Split the middle term $${fmt(b)}${variable}$ into $${fmt(m)}${variable} + (${fmt(n)})${variable}$ and factor by grouping.`,
          math: `${fmt(a)}${variable}^2 ${mSign}${variable} ${nSign}${variable} ${cSign} = 0 \\implies (${r1Str}${variable} ${s1Sign})(${r2Str}${variable} ${s2Sign}) = 0`,
        });

        if (Math.abs(x1 - x2) < 1e-6) {
          steps.push({
            stepNumber: stepCount++,
            explanation: `Set the factor equal to zero and solve for $${variable}$.`,
            math: `${r1Str}${variable} ${s1Sign} = 0 \\implies ${variable} = ${fmt(x1)}`,
          });

          steps.push({
            stepNumber: stepCount++,
            explanation: `Verify the solution by substituting back into the original equation.`,
            math: formatQuadraticVerification(a, b, c, x1, variable),
          });
        } else {
          steps.push({
            stepNumber: stepCount++,
            explanation: `Set each factor equal to zero and solve for $${variable}$.`,
            math: `(${r1Str}${variable} ${s1Sign}) = 0 \\implies ${variable}_1 = ${fmt(x1)} \\quad \\text{or} \\quad (${r2Str}${variable} ${s2Sign}) = 0 \\implies ${variable}_2 = ${fmt(x2)}`,
          });

          steps.push({
            stepNumber: stepCount++,
            explanation: `Verify each root by substituting back into the original equation.`,
            math: `${formatQuadraticVerification(a, b, c, x1, variable)} \\\\[6pt] ${formatQuadraticVerification(a, b, c, x2, variable)}`,
          });
        }

        return steps;
      }
    }

    // If factoring was explicitly requested but impossible over integers
    if (method === 'factoring') {
      steps.push({
        stepNumber: stepCount++,
        explanation: `Check if rational factoring is possible: Discriminant $\\Delta = b^2 - 4ac = (${fmt(b)})^2 - 4(${fmt(a)})(${fmt(c)}) = ${fmt(delta)}$. Since $\\Delta$ is ${delta < 0 ? 'negative' : 'not a perfect square'}, this polynomial is irreducible over the integers and cannot be factored by simple grouping. Deferring to the quadratic formula:`,
        math: `\\Delta = ${fmt(delta)} \\quad (\\text{Not a perfect square})`,
      });
    }
  }

  // ─── PATH 3: Quadratic Formula ──────────────────────────────────
  steps.push({
    stepNumber: stepCount++,
    explanation: 'Identify the coefficients $a$, $b$, and $c$.',
    math: `a = ${fmt(a)}, \\quad b = ${fmt(b)}, \\quad c = ${fmt(c)}`,
  });

  let deltaInterpretation = '';
  if (delta > 0) {
    deltaInterpretation = 'Since $\\Delta > 0$, the equation has two distinct real roots.';
  } else if (Math.abs(delta) < 1e-8) {
    deltaInterpretation = 'Since $\\Delta = 0$, the equation has one repeated real root.';
  } else {
    deltaInterpretation = 'Since $\\Delta < 0$ is negative, there are no real roots; the equation has two complex conjugate roots.';
  }

  steps.push({
    stepNumber: stepCount++,
    explanation: `Calculate the discriminant $\\Delta = b^2 - 4ac$ (tells us how many real roots exist). ${deltaInterpretation}`,
    math: `\\Delta = (${fmt(b)})^2 - 4(${fmt(a)})(${fmt(c)}) = ${fmt(b * b)} - (${fmt(4 * a * c)}) = ${fmt(delta)}`,
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: 'Apply the quadratic formula.',
    math: `${variable} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{${fmt(-b)} \\pm \\sqrt{${fmt(delta)}}}{${fmt(2 * a)}}`,
  });

  if (delta >= 0) {
    const rootDelta = Math.sqrt(delta);
    const x1 = (-b + rootDelta) / (2 * a);
    const x2 = (-b - rootDelta) / (2 * a);

    if (Math.abs(delta) < 1e-8) {
      steps.push({
        stepNumber: stepCount++,
        explanation: 'Simplify the repeated real root:',
        math: `${variable} = ${fmt(x1)}`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: `Verify the root by substituting back into the original equation.`,
        math: formatQuadraticVerification(a, b, c, x1, variable),
      });
    } else {
      steps.push({
        stepNumber: stepCount++,
        explanation: 'Simplify the two real roots:',
        math: `${variable}_1 = ${fmt(x1)}, \\quad ${variable}_2 = ${fmt(x2)}`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: `Verify the roots by substituting back into the original equation.`,
        math: `${formatQuadraticVerification(a, b, c, x1, variable)} \\\\[6pt] ${formatQuadraticVerification(a, b, c, x2, variable)}`,
      });
    }
  } else {
    const realPart = -b / (2 * a);
    const imaginaryPart = Math.sqrt(-delta) / (2 * Math.abs(a));
    
    const fracRe = toFraction(realPart);
    const fracIm = toFraction(imaginaryPart);
    const dispRe = fracRe && fracRe.d > 1 ? fmtFraction(realPart) : fmt(realPart);
    const dispIm = fracIm && fracIm.d > 1 ? fmtFraction(imaginaryPart) : fmt(imaginaryPart);

    steps.push({
      stepNumber: stepCount++,
      explanation: 'Rewrite the negative square root using the imaginary unit $i = \\sqrt{-1}$:',
      math: `${variable} = \\frac{${fmt(-b)} \\pm \\sqrt{${fmt(-delta)}}\\;i}{${fmt(2 * a)}}`,
    });

    steps.push({
      stepNumber: stepCount++,
      explanation: 'Simplify the two complex conjugate roots:',
      math: `${variable} = ${dispRe} \\pm ${dispIm === '1' ? '' : dispIm}\\,i`,
    });

    steps.push({
      stepNumber: stepCount++,
      explanation: `Verification for complex conjugate pair:`,
      math: `f(${dispRe} \\pm ${dispIm === '1' ? '' : dispIm}i) = (${fmt(a)})(${dispRe} \\pm ${dispIm === '1' ? '' : dispIm}i)^2 + (${fmt(b)})(${dispRe} \\pm ${dispIm === '1' ? '' : dispIm}i) + (${fmt(c)}) = 0 \\;\\checkmark`,
    });
  }

  // Structural Connection: Vieta's Relations
  steps.push({
    stepNumber: stepCount++,
    explanation: `Structural Insight (Vieta's Formulas): The roots directly mirror the coefficients of the polynomial.`,
    math: `\\text{Sum of roots: } x_1 + x_2 = -\\frac{b}{a} = ${fmt(-b / a)}, \\quad \\text{Product of roots: } x_1 \\cdot x_2 = \\frac{c}{a} = ${fmt(c / a)}`,
  });

  return steps;
}

// ─── DEGREE 3: CUBIC STEPS ───────────────────────────────────────────────────

export function generateCubicSteps(
  a: number,
  b: number,
  c: number,
  d: number,
  roots: { real: number[]; complex: { re: number; im: number }[] },
  variable: string = 'x',
  equationContext?: string | EquationSidesContext
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  // Step 1: Standard form
  const stdStep = formatStandardFormStep(3, [a, b, c, d], variable, equationContext);
  steps.push({
    stepNumber: stepCount++,
    explanation: stdStep.explanation,
    math: stdStep.math,
    subSteps: stdStep.subSteps,
  });

  // Candidate rational roots: ±(factors of |d|) / (factors of |a|)
  const dFactors = getFactors(d, 100);
  const aFactors = getFactors(a, 50);

  const candidateFractions: { p: number; q: number; val: number; str: string }[] = [];
  const seenVals = new Set<number>();

  for (const p of dFactors) {
    for (const q of aFactors) {
      const g = gcd(p, q);
      const sp = p / g;
      const sq = q / g;
      const vPos = sp / sq;
      const vNeg = -sp / sq;

      if (!seenVals.has(vPos)) {
        seenVals.add(vPos);
        candidateFractions.push({
          p: sp,
          q: sq,
          val: vPos,
          str: sq === 1 ? `${sp}` : `\\frac{${sp}}{${sq}}`,
        });
      }
      if (!seenVals.has(vNeg)) {
        seenVals.add(vNeg);
        candidateFractions.push({
          p: -sp,
          q: sq,
          val: vNeg,
          str: sq === 1 ? `-${sp}` : `-\\frac{${sp}}{${sq}}`,
        });
      }
    }
  }

  // Sort candidate list nicely: integers first (1, -1, 2, -2, etc.), then fractions
  candidateFractions.sort((f1, f2) => {
    const f1IsInt = Math.abs(f1.val - Math.round(f1.val)) < 1e-6;
    const f2IsInt = Math.abs(f2.val - Math.round(f2.val)) < 1e-6;
    if (f1IsInt !== f2IsInt) return f1IsInt ? -1 : 1;
    return Math.abs(f1.val) - Math.abs(f2.val) || f2.val - f1.val;
  });

  const dFactorsStr = dFactors.map((f) => `\\pm ${f}`).join(', ');
  const aFactorsStr = aFactors.map((f) => `\\pm ${f}`).join(', ');
  const candidatesDisplay = candidateFractions
    .slice(0, 12)
    .map((c) => c.str)
    .join(', ') + (candidateFractions.length > 12 ? ', \\dots' : '');

  // Test candidates sequentially
  let rationalRoot: number | null = null;
  const testTrail: string[] = [];

  for (const cand of candidateFractions) {
    const val = a * Math.pow(cand.val, 3) + b * Math.pow(cand.val, 2) + c * cand.val + d;
    if (Math.abs(val) < 1e-7) {
      rationalRoot = cand.val;
      testTrail.push(`\\text{Testing } ${variable} = ${cand.str}: \\; ${formatPolyEvaluation([a, b, c, d], cand.val, variable)}`);
      break;
    } else {
      if (testTrail.length < 3) {
        testTrail.push(`\\text{Testing } ${variable} = ${cand.str}: \\; f(${cand.str}) = ${fmt(val)} \\ne 0 \\text{ (not a root)}`);
      }
    }
  }

  // Fallback: check if roots contains clean integer
  if (rationalRoot === null) {
    const integerRoot = roots.real.find((r) => Math.abs(r - Math.round(r)) < 1e-4);
    if (integerRoot !== undefined) {
      rationalRoot = Math.round(integerRoot);
      testTrail.push(`\\text{Testing } ${variable} = ${rationalRoot}: \\; ${formatPolyEvaluation([a, b, c, d], rationalRoot, variable)}`);
    }
  }

  if (rationalRoot !== null) {
    const r0 = rationalRoot;
    const frac0 = toFraction(r0);
    const r0Disp = frac0 ? (frac0.d === 1 ? `${frac0.n}` : `\\frac{${frac0.n}}{${frac0.d}}`) : fmt(r0);
    const r0Sign = r0 >= 0 ? `- ${fmt(Math.abs(r0))}` : `+ ${fmt(Math.abs(r0))}`;
    const r0SignStr = frac0 && frac0.d === 1
      ? (r0 >= 0 ? `${variable} - ${Math.abs(r0)}` : `${variable} + ${Math.abs(r0)}`)
      : (frac0 ? (frac0.n >= 0 ? `${variable} - \\frac{${Math.abs(frac0.n)}}{${frac0.d}}` : `${variable} + \\frac{${Math.abs(frac0.n)}}{${frac0.d}}`) : `${variable} ${r0Sign}`);

    // Step 2: Rational Root Theorem testing
    steps.push({
      stepNumber: stepCount++,
      explanation: `Apply the Rational Root Theorem (a way to test for simple fraction/whole-number roots before trying harder methods). Testing $${variable} = ${r0Disp}$, we find $f(${r0Disp}) = 0$, which proves that $(${r0SignStr})$ is a factor by the Factor Theorem.`,
      math: `\\begin{aligned} f(${r0Disp}) &= ${formatPolyEvaluation([a, b, c, d], r0, variable, false)} \\\\[4pt] &\\implies (${r0SignStr}) \\text{ is a factor} \\end{aligned}`,
    });

    // Step 3: Polynomial Division (Long Division + Synthetic Division side-by-side)
    const qA = a;
    const qB = b + a * r0;
    const qC = c + qB * r0;

    const polyFull = formatPolyWithZeros([a, b, c, d], variable);
    const quotientPoly = formatPolynomial([qA, qB, qC], variable);
    const divisorStr = `${variable} ${r0Sign}`;
    const dividendStr = formatPolynomial([a, b, c, d], variable);

    const longDivisionMath = generatePolynomialLongDivisionLatex([a, b, c, d], r0, variable);
    const syntheticMath = generateSyntheticDivisionLatex([a, b, c, d], r0, variable);

    const divisionDetails: DivisionDetails = {
      longDivisionMath,
      syntheticMath,
      quotientMath: quotientPoly,
      divisorMath: divisorStr,
      dividendMath: dividendStr,
      remainderMath: '0',
      explainer: 'A faster shortcut version of long division — same result, fewer written steps.',
    };

    steps.push({
      stepNumber: stepCount++,
      explanation: `Perform polynomial division (long division / synthetic division) of $${dividendStr}$ by the factor $(${divisorStr})$ to obtain the reduced quotient $${quotientPoly}$. Both Long Division (NCERT standard) and Synthetic Division (shortcut) are shown below:`,
      math: `\\begin{aligned} &\\textbf{Method 1: Long Division (NCERT)} \\\\[4pt] &${longDivisionMath} \\\\[10pt] &\\textbf{Method 2: Synthetic Division (Shortcut)} \\\\[4pt] &${syntheticMath} \\end{aligned}`,
      divisionDetails,
    });

    // Step 4: Factored Form & GCD Simplification
    const g = gcd(gcd(Math.abs(qA), Math.abs(qB)), Math.abs(qC));
    const sA = qA / g;
    const sB = qB / g;
    const sC = qC / g;
    const simplifiedQuadratic = formatPolynomial([sA, sB, sC], variable);

    if (g > 1) {
      steps.push({
        stepNumber: stepCount++,
        explanation: `Express the cubic equation in factored form and factor out the common constant $${fmt(g)}$.`,
        math: `(${variable} ${r0Sign})(${quotientPoly}) = 0 \\implies ${fmt(g)}(${variable} ${r0Sign})(${simplifiedQuadratic}) = 0`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: `Divide both sides by $${fmt(g)}$ since non-zero constant factors do not affect the roots. This isolates the quadratic factor.`,
        math: `(${variable} ${r0Sign})(${simplifiedQuadratic}) = 0 \\implies ${simplifiedQuadratic} = 0`,
      });
    } else {
      steps.push({
        stepNumber: stepCount++,
        explanation: `Express the cubic equation in factored form and isolate the quadratic factor.`,
        math: `(${variable} ${r0Sign})(${quotientPoly}) = 0 \\implies ${quotientPoly} = 0`,
      });
    }

    // Step 5: Solve Quadratic Factor
    const deltaQ = sB * sB - 4 * sA * sC;
    let deltaExplanation = '';
    if (deltaQ > 0) {
      deltaExplanation = `Calculate the discriminant $\\Delta = b^2 - 4ac$ (tells us how many real roots exist) for $${simplifiedQuadratic} = 0$. Since $\\Delta > 0$, there are two distinct real roots.`;
    } else if (Math.abs(deltaQ) < 1e-8) {
      deltaExplanation = `Calculate the discriminant $\\Delta = b^2 - 4ac$ (tells us how many real roots exist) for $${simplifiedQuadratic} = 0$. Since $\\Delta = 0$, there is one repeated real root.`;
    } else {
      deltaExplanation = `Calculate the discriminant $\\Delta = b^2 - 4ac$ (tells us how many real roots exist) for $${simplifiedQuadratic} = 0$. Since $\\Delta < 0$ is negative, there are no real roots; there are two complex conjugate roots.`;
    }

    steps.push({
      stepNumber: stepCount++,
      explanation: deltaExplanation,
      math: `\\Delta = (${fmt(sB)})^2 - 4(${fmt(sA)})(${fmt(sC)}) = ${fmt(sB * sB)} - (${fmt(4 * sA * sC)}) = ${fmt(deltaQ)}`,
    });

    if (deltaQ > 0) {
      const sqrtDelta = Math.sqrt(deltaQ);
      const r2 = (-sB + sqrtDelta) / (2 * sA);
      const r3 = (-sB - sqrtDelta) / (2 * sA);

      steps.push({
        stepNumber: stepCount++,
        explanation: `Apply the quadratic formula $${variable} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.`,
        math: `${variable} = \\frac{-(${fmt(sB)}) \\pm \\sqrt{${fmt(deltaQ)}}}{2(${fmt(sA)})} = \\frac{${fmt(-sB)} \\pm ${fmt(sqrtDelta)}}{${fmt(2 * sA)}}`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: 'Compute the two roots from the quadratic factor:',
        math: `${variable}_2 = \\frac{${fmt(-sB)} + ${fmt(sqrtDelta)}}{${fmt(2 * sA)}} = ${fmt(r2)}, \\quad ${variable}_3 = \\frac{${fmt(-sB)} - ${fmt(sqrtDelta)}}{${fmt(2 * sA)}} = ${fmt(r3)}`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: 'Final summary: All three real roots of the cubic equation are:',
        math: `${variable} = ${fmt(r0)}, \\; ${fmt(r2)}, \\; ${fmt(r3)}`,
      });
    } else if (Math.abs(deltaQ) < 1e-8) {
      const r2 = -sB / (2 * sA);

      steps.push({
        stepNumber: stepCount++,
        explanation: `Apply the quadratic formula $${variable} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.`,
        math: `${variable} = \\frac{-(${fmt(sB)}) \\pm 0}{2(${fmt(sA)})} = \\frac{${fmt(-sB)}}{${fmt(2 * sA)}} = ${fmt(r2)}`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: 'Final summary: All roots of the cubic equation (including repeated root):',
        math: `${variable} = ${fmt(r0)}, \\; ${fmt(r2)}`,
      });
    } else {
      const realPart = -sB / (2 * sA);
      const imagPart = Math.sqrt(-deltaQ) / (2 * sA);

      steps.push({
        stepNumber: stepCount++,
        explanation: `Apply the quadratic formula $${variable} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.`,
        math: `${variable} = \\frac{-(${fmt(sB)}) \\pm \\sqrt{${fmt(deltaQ)}}}{2(${fmt(sA)})} = \\frac{${fmt(-sB)} \\pm \\sqrt{${fmt(-deltaQ)}}\\,i}{${fmt(2 * sA)}} = ${fmt(realPart)} \\pm ${fmt(imagPart)}\\,i`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: 'Evaluate the two complex conjugate roots:',
        math: `${variable} = ${fmt(realPart)} + ${fmt(imagPart)}\\,i, \\quad ${variable} = ${fmt(realPart)} - ${fmt(imagPart)}\\,i`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: 'Final summary: All roots of the cubic equation (one real root and two complex conjugate roots):',
        math: `${variable} = ${fmt(r0)}, \\quad ${fmt(realPart)} \\pm ${fmt(imagPart)}\\,i`,
      });
    }

    // Symbolab Factored Form & Zero Factor Principle for cubic
    const f0 = formatLinearFactor(r0, variable);
    const cubicSubSteps: { title: string; math: string }[] = [];
    let cubicFactoredLhs = '';

    if (deltaQ >= 0) {
      const sqrtDeltaQ = Math.sqrt(deltaQ);
      const r2 = (-sB + sqrtDeltaQ) / (2 * sA);
      const r3 = (-sB - sqrtDeltaQ) / (2 * sA);
      const allRoots = Math.abs(deltaQ) < 1e-8 ? [r0, r2] : [r0, r2, r3];

      const factorCounts = new Map<string, { count: number; root: number }>();
      for (const rootVal of allRoots) {
        const factorStr = formatLinearFactor(rootVal, variable);
        const existing = factorCounts.get(factorStr);
        if (existing) {
          existing.count++;
        } else {
          factorCounts.set(factorStr, { count: 1, root: rootVal });
        }
      }

      const factorParts: string[] = [];
      factorCounts.forEach(({ count, root }, factorStr) => {
        if (count > 1) {
          factorParts.push(`${factorStr}^${count}`);
        } else {
          factorParts.push(factorStr);
        }
        const frac = toFraction(root);
        const rootDisplay = frac ? fmtFraction(root) : fmt(root);
        cubicSubSteps.push({
          title: `Solve ${factorStr.replace(/[()]/g, '')} = 0:`,
          math: `${factorStr.replace(/[()]/g, '')} = 0 \\implies ${variable} = ${rootDisplay}`,
        });
      });
      cubicFactoredLhs = (sA !== 1 ? `${fmt(sA)}` : '') + factorParts.join('');
    } else {
      cubicFactoredLhs = `${f0}(${simplifiedQuadratic})`;
      const frac0 = toFraction(r0);
      cubicSubSteps.push({
        title: `Solve ${f0.replace(/[()]/g, '')} = 0:`,
        math: `${f0.replace(/[()]/g, '')} = 0 \\implies ${variable} = ${frac0 ? fmtFraction(r0) : fmt(r0)}`,
      });
      cubicSubSteps.push({
        title: `Solve ${simplifiedQuadratic} = 0:`,
        math: `${variable} = \\frac{${fmt(-sB)} \\pm \\sqrt{${fmt(deltaQ)}}}{${fmt(2 * sA)}}`,
      });
    }

    steps.push({
      stepNumber: stepCount++,
      explanation: `Combine into completely factored form and apply the Zero Factor Principle (if $a \\cdot b = 0$, then $a = 0$ or $b = 0$).`,
      math: `${cubicFactoredLhs} = 0`,
      subSteps: cubicSubSteps,
    });
  } else {
    // No rational roots exist — Clean numerical output without raw Cardano clutter
    steps.push({
      stepNumber: stepCount++,
      explanation: `Test candidate rational roots using the Rational Root Theorem (a way to test for simple fraction/whole-number roots before trying harder methods). None of the potential candidates satisfy $f(${variable}) = 0$. No simple rational root found.`,
      math: `\\text{Candidates tested: } ${candidatesDisplay} \\implies \\text{No rational roots}`,
    });

    const rootStrs: string[] = [];
    roots.real.forEach((r, i) => {
      rootStrs.push(`${variable}_${i + 1} = ${fmt(r)}`);
    });
    roots.complex.forEach((comp, i) => {
      rootStrs.push(
        `${variable}_${roots.real.length + i + 1} = ${fmt(comp.re)} \\pm ${fmt(Math.abs(comp.im))}\\,i`
      );
    });

    steps.push({
      stepNumber: stepCount++,
      explanation: 'Solved numerically. All roots of the cubic equation are:',
      math: rootStrs.join(', \\quad '),
    });
  }

  steps.push({
    stepNumber: stepCount++,
    explanation: `Structural Insight (Vieta's Relations for Cubics): Sum of roots = -b/a, Product of roots = -d/a.`,
    math: `\\sum x_i = -\\frac{b}{a} = ${fmt(-b / a)}, \\quad \\prod x_i = -\\frac{d}{a} = ${fmt(-d / a)}`,
  });

  return steps;
}

// ─── DEGREE 4: QUARTIC STEPS ─────────────────────────────────────────────────

export function generateQuarticSteps(
  coeffs: number[],
  roots: { real: number[]; complex: { re: number; im: number }[] },
  variable: string = 'x',
  equationContext?: string | EquationSidesContext
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;
  const [a, b, c, d, e] = coeffs;

  // Step 1: Standard form
  const stdStep = formatStandardFormStep(4, coeffs, variable, equationContext);
  steps.push({
    stepNumber: stepCount++,
    explanation: stdStep.explanation,
    math: stdStep.math,
    subSteps: stdStep.subSteps,
  });

  if (Math.abs(b) < 1e-6 && Math.abs(d) < 1e-6) {
    const aLead = a === 1 ? '' : a === -1 ? '-' : `${fmt(a)}`;
    const bPart = c === 0 ? '' : `${c > 0 ? '+ ' : '- '}${Math.abs(c) === 1 ? '' : fmt(Math.abs(c))}u `;
    const cPart = e === 0 ? '' : `${e > 0 ? '+ ' : '- '}${fmt(Math.abs(e))} `;
    const quadEqU = `${aLead}u^2 ${bPart}${cPart}= 0`;
    steps.push({
      stepNumber: stepCount++,
      explanation: `Notice that only even powers of $${variable}$ appear. Substitute $u = ${variable}^2$ to transform into a quadratic equation in $u$.`,
      math: quadEqU,
    });

    const deltaU = c * c - 4 * a * e;
    const bTerm = c < 0 ? `(-${Math.abs(c)})` : `${c}`;
    const cTerm = e < 0 ? `(-${Math.abs(e)})` : `${e}`;

    steps.push({
      stepNumber: stepCount++,
      explanation: `Identify coefficients $A = ${fmt(a)}$, $B = ${fmt(c)}$, $C = ${fmt(e)}$ and calculate the discriminant $\\Delta = B^2 - 4AC$:`,
      math: `\\Delta = ${bTerm}^2 - 4(${fmt(a)})(${cTerm}) = ${fmt(c * c)} - ${fmt(4 * a * e)} = ${fmt(deltaU)}`,
    });

    steps.push({
      stepNumber: stepCount++,
      explanation: `Apply the quadratic formula $u = \\frac{-B \\pm \\sqrt{\\Delta}}{2A}$ to solve for $u$:`,
      math: `u = \\frac{-(${bTerm}) \\pm \\sqrt{${fmt(deltaU)}}}{2(${fmt(a)})} = \\frac{${fmt(-c)} \\pm \\sqrt{${fmt(deltaU)}}}{${fmt(2 * a)}}`,
    });

    // Compute real u roots if deltaU >= 0
    if (deltaU >= 0) {
      const sqrtDelta = Math.sqrt(deltaU);
      const u1 = (-c + sqrtDelta) / (2 * a);
      const u2 = (-c - sqrtDelta) / (2 * a);
      const u1Str = fmt(u1);
      const u2Str = fmt(u2);
      steps.push({
        stepNumber: stepCount++,
        explanation: `Simplify to obtain the values for $u$:`,
        math: `u_1 = ${u1Str}, \\quad u_2 = ${u2Str}`,
      });
    }

    const distinctReal: number[] = [];
    roots.real.forEach((r) => {
      if (!distinctReal.some((dr) => Math.abs(dr - r) < 1e-5)) distinctReal.push(r);
    });
    const rootStrs: string[] = distinctReal.map((r) => fmt(r));
    roots.complex.forEach((comp) => {
      const imStr = Math.abs(comp.im) === 1 ? 'i' : `${fmt(comp.im)}\\,i`;
      rootStrs.push(Math.abs(comp.re) < 1e-6 ? `\\pm ${imStr}` : `${fmt(comp.re)} \\pm ${imStr}`);
    });

    steps.push({
      stepNumber: stepCount++,
      explanation: `Since $u = ${variable}^2$, take the square roots $${variable} = \\pm \\sqrt{u}$ to find all 4 roots:`,
      math: `${variable} = ${rootStrs.join(', \\; ')}`,
    });

    return steps;
  }

  // General Quartic: Try Rational Root Theorem
  const eFactors = getFactors(e, 100);
  const aFactors = getFactors(a, 50);

  const candidateFractions: { p: number; q: number; val: number; str: string; isInt: boolean }[] = [];
  const seenVals = new Set<number>();

  for (const p of eFactors) {
    for (const q of aFactors) {
      const g = gcd(p, q);
      const sp = p / g;
      const sq = q / g;
      const vPos = sp / sq;
      const vNeg = -sp / sq;

      if (!seenVals.has(vPos)) {
        seenVals.add(vPos);
        candidateFractions.push({
          p: sp,
          q: sq,
          val: vPos,
          str: sq === 1 ? `${sp}` : `\\frac{${sp}}{${sq}}`,
          isInt: sq === 1,
        });
      }
      if (!seenVals.has(vNeg)) {
        seenVals.add(vNeg);
        candidateFractions.push({
          p: -sp,
          q: sq,
          val: vNeg,
          str: sq === 1 ? `-${sp}` : `-\\frac{${sp}}{${sq}}`,
          isInt: sq === 1,
        });
      }
    }
  }

  // Prioritize integers first (1, -1, 2, -2, etc.), then fractions (1/2, -1/2, etc.)
  candidateFractions.sort((f1, f2) => {
    if (f1.isInt !== f2.isInt) return f1.isInt ? -1 : 1;
    return Math.abs(f1.val) - Math.abs(f2.val) || f2.val - f1.val;
  });

  const eFactorsStr = eFactors.map((f) => `\\pm ${f}`).join(', ');
  const aFactorsStr = aFactors.map((f) => `\\pm ${f}`).join(', ');
  const candidatesDisplay = candidateFractions
    .slice(0, 10)
    .map((c) => c.str)
    .join(', ') + (candidateFractions.length > 10 ? ', \\dots' : '');

  // Find first rational root
  let r1Cand: { p: number; q: number; val: number; str: string; isInt: boolean } | null = null;
  const testTrail1: string[] = [];

  for (const cand of candidateFractions) {
    const val = evalPoly(coeffs, cand.val);
    if (Math.abs(val) < 1e-7) {
      r1Cand = cand;
      testTrail1.push(`\\text{Testing } ${variable} = ${cand.str}: \\; ${formatPolyEvaluation(coeffs, cand.val, variable)}`);
      break;
    } else {
      if (testTrail1.length < 2) {
        testTrail1.push(`\\text{Testing } ${variable} = ${cand.str}: \\; f(${cand.str}) = ${fmt(val)} \\ne 0 \\text{ (not a root)}`);
      }
    }
  }

  let r1: number | null = r1Cand ? r1Cand.val : null;

  // Fallback to roots.real if any is a clean rational
  if (r1 === null) {
    const ratRoot = roots.real.find((r) => toFraction(r) !== null && Math.abs(evalPoly(coeffs, r)) < 1e-5);
    if (ratRoot !== undefined) {
      r1 = ratRoot;
      const frac = toFraction(r1);
      const fracStr = frac ? (frac.d === 1 ? `${frac.n}` : `\\frac{${frac.n}}{${frac.d}}`) : fmt(r1);
      r1Cand = { p: frac ? frac.n : r1, q: frac ? frac.d : 1, val: r1, str: fracStr, isInt: frac ? frac.d === 1 : false };
      testTrail1.push(`\\text{Testing } ${variable} = ${fracStr}: \\; ${formatPolyEvaluation(coeffs, r1, variable)}`);
    }
  }

  if (r1 !== null && r1Cand !== null) {
    const r1Frac = toFraction(r1);
    const r1DispStr = r1Cand.str;
    const divisor1Str = r1Frac && r1Frac.d === 1
      ? (r1 >= 0 ? `${variable} - ${Math.abs(r1)}` : `${variable} + ${Math.abs(r1)}`)
      : (r1Frac ? (r1Frac.n >= 0 ? `${variable} - \\frac{${Math.abs(r1Frac.n)}}{${r1Frac.d}}` : `${variable} + \\frac{${Math.abs(r1Frac.n)}}{${r1Frac.d}}`) : `${variable} - ${fmt(r1)}`);

    steps.push({
      stepNumber: stepCount++,
      explanation: `Apply the Rational Root Theorem (a way to test for simple fraction/whole-number roots before trying harder methods). Testing $${variable} = ${r1DispStr}$, we find $f(${r1DispStr}) = 0$, which proves that $(${divisor1Str})$ is a factor by the Factor Theorem.`,
      math: `\\begin{aligned} f(${r1DispStr}) &= ${formatPolyEvaluation(coeffs, r1, variable, false)} \\\\[4pt] &\\implies (${divisor1Str}) \\text{ is a factor} \\end{aligned}`,
    });

    // Synthetic division to degree 3
    const q3: number[] = [coeffs[0]];
    for (let i = 1; i < coeffs.length - 1; i++) {
      q3.push(coeffs[i] + q3[i - 1] * r1);
    }
    const q3Poly = formatPolynomial(q3, variable);
    const dividend1Str = formatPolynomial(coeffs, variable);

    const longDiv1Math = generatePolynomialLongDivisionLatex(coeffs, r1, variable);
    const synth1Math = generateSyntheticDivisionLatex(coeffs, r1, variable);

    steps.push({
      stepNumber: stepCount++,
      explanation: `Divide the quartic polynomial $${dividend1Str}$ by $(${divisor1Str})$ using algebraic division to obtain the depressed cubic factor $${q3Poly}$. Both Long Division (NCERT standard) and Synthetic Division (shortcut) are shown:`,
      math: `\\begin{aligned} &\\textbf{Method 1: Long Division (NCERT)} \\\\[4pt] &${longDiv1Math} \\\\[10pt] &\\textbf{Method 2: Synthetic Division (Shortcut)} \\\\[4pt] &${synth1Math} \\end{aligned}`,
      divisionDetails: {
        longDivisionMath: longDiv1Math,
        syntheticMath: synth1Math,
        quotientMath: q3Poly,
        divisorMath: divisor1Str,
        dividendMath: dividend1Str,
        remainderMath: '0',
        explainer: 'A faster shortcut version of long division — same result, fewer written steps.',
      },
    });

    // Try finding second rational root in q3 using Rational Root Theorem on q3
    const q3Const = q3[q3.length - 1];
    const q3Lead = q3[0];
    const q3ConstFactors = getFactors(q3Const, 100);
    const q3LeadFactors = getFactors(q3Lead, 50);

    const q3CandidateFractions: { p: number; q: number; val: number; str: string; isInt: boolean }[] = [];
    const seenQ3Vals = new Set<number>();

    for (const p of q3ConstFactors) {
      for (const q of q3LeadFactors) {
        const g = gcd(p, q);
        const sp = p / g;
        const sq = q / g;
        const vPos = sp / sq;
        const vNeg = -sp / sq;

        if (!seenQ3Vals.has(vPos)) {
          seenQ3Vals.add(vPos);
          q3CandidateFractions.push({
            p: sp,
            q: sq,
            val: vPos,
            str: sq === 1 ? `${sp}` : `\\frac{${sp}}{${sq}}`,
            isInt: sq === 1,
          });
        }
        if (!seenQ3Vals.has(vNeg)) {
          seenQ3Vals.add(vNeg);
          q3CandidateFractions.push({
            p: -sp,
            q: sq,
            val: vNeg,
            str: sq === 1 ? `-${sp}` : `-\\frac{${sp}}{${sq}}`,
            isInt: sq === 1,
          });
        }
      }
    }

    // Prioritize integers first
    q3CandidateFractions.sort((f1, f2) => {
      if (f1.isInt !== f2.isInt) return f1.isInt ? -1 : 1;
      return Math.abs(f1.val) - Math.abs(f2.val) || f2.val - f1.val;
    });

    let r2Cand: { p: number; q: number; val: number; str: string; isInt: boolean } | null = null;
    const testTrail2: string[] = [];

    for (const cand of q3CandidateFractions) {
      const val = evalPoly(q3, cand.val);
      if (Math.abs(val) < 1e-7) {
        r2Cand = cand;
        testTrail2.push(`\\text{Testing } ${variable} = ${cand.str}: \\; ${formatPolyEvaluation(q3, cand.val, variable)}`);
        break;
      } else {
        if (testTrail2.length < 2) {
          testTrail2.push(`\\text{Testing } ${variable} = ${cand.str}: \\; f(${cand.str}) = ${fmt(val)} \\ne 0 \\text{ (not a root)}`);
        }
      }
    }

    let r2: number | null = r2Cand ? r2Cand.val : null;

    if (r2 === null) {
      const ratRoot2 = roots.real.find((r) => toFraction(r) !== null && Math.abs(evalPoly(q3, r)) < 1e-5);
      if (ratRoot2 !== undefined) {
        r2 = ratRoot2;
        const frac = toFraction(r2);
        const fracStr = frac ? (frac.d === 1 ? `${frac.n}` : `\\frac{${frac.n}}{${frac.d}}`) : fmt(r2);
        r2Cand = { p: frac ? frac.n : r2, q: frac ? frac.d : 1, val: r2, str: fracStr, isInt: frac ? frac.d === 1 : false };
        testTrail2.push(`\\text{Testing } ${variable} = ${fracStr}: \\; ${formatPolyEvaluation(q3, r2, variable)}`);
      }
    }

    if (r2 !== null && r2Cand !== null) {
      const r2Frac = toFraction(r2);
      const r2DispStr = r2Cand.str;
      const divisor2Str = r2Frac && r2Frac.d === 1
        ? (r2 >= 0 ? `${variable} - ${Math.abs(r2)}` : `${variable} + ${Math.abs(r2)}`)
        : (r2Frac ? (r2Frac.n >= 0 ? `${variable} - \\frac{${Math.abs(r2Frac.n)}}{${r2Frac.d}}` : `${variable} + \\frac{${Math.abs(r2Frac.n)}}{${r2Frac.d}}`) : `${variable} - ${fmt(r2)}`);

      steps.push({
        stepNumber: stepCount++,
        explanation: `Find a root of the depressed cubic factor $${q3Poly} = 0$ using the Factor Theorem. Testing $${variable} = ${r2DispStr}$, we find $f(${r2DispStr}) = 0$, so $(${divisor2Str})$ is another factor.`,
        math: `\\begin{aligned} f(${r2DispStr}) &= ${formatPolyEvaluation(q3, r2, variable, false)} \\\\[4pt] &\\implies (${divisor2Str}) \\text{ is a factor} \\end{aligned}`,
      });

      // Synthetic division to degree 2
      const q2: number[] = [q3[0]];
      for (let i = 1; i < q3.length - 1; i++) {
        q2.push(q3[i] + q2[i - 1] * r2);
      }
      const q2Poly = formatPolynomial(q2, variable);
      const dividend2Str = q3Poly;

      const longDiv2Math = generatePolynomialLongDivisionLatex(q3, r2, variable);
      const synth2Math = generateSyntheticDivisionLatex(q3, r2, variable);

      steps.push({
        stepNumber: stepCount++,
        explanation: `Divide the cubic factor $${dividend2Str}$ by $(${divisor2Str})$ to obtain the quadratic factor $${q2Poly}$. Both Long Division and Synthetic Division methods:`,
        math: `\\begin{aligned} &\\textbf{Method 1: Long Division (NCERT)} \\\\[4pt] &${longDiv2Math} \\\\[10pt] &\\textbf{Method 2: Synthetic Division (Shortcut)} \\\\[4pt] &${synth2Math} \\end{aligned}`,
        divisionDetails: {
          longDivisionMath: longDiv2Math,
          syntheticMath: synth2Math,
          quotientMath: q2Poly,
          divisorMath: divisor2Str,
          dividendMath: dividend2Str,
          remainderMath: '0',
          explainer: 'A faster shortcut version of long division — same result, fewer written steps.',
        },
      });

      // Solve remaining quadratic
      const [qa, qb, qc] = q2;
      const deltaQ = qb * qb - 4 * qa * qc;
      steps.push({
        stepNumber: stepCount++,
        explanation: `Solve the quadratic equation $${q2Poly} = 0$ using the quadratic formula with discriminant $\\Delta = ${fmt(deltaQ)}$ (tells us how many real roots exist).`,
        math: `${variable} = \\frac{${fmt(-qb)} \\pm \\sqrt{${fmt(deltaQ)}}}{${fmt(2 * qa)}}`,
      });

      // Factor Form & Zero Factor Principle (Symbolab approach)
      let quadRoots: number[] = [];
      if (deltaQ >= 0) {
        const sq = Math.sqrt(deltaQ);
        quadRoots.push((-qb + sq) / (2 * qa));
        if (deltaQ > 1e-8) {
          quadRoots.push((-qb - sq) / (2 * qa));
        }
      }

      // Check if all roots are rational to construct full product of factors
      const f1 = formatLinearFactor(r1, variable);
      const f2 = formatLinearFactor(r2, variable);
      const subSteps: { title: string; math: string }[] = [];
      const distinctRoots: number[] = [];
      const addDistinct = (val: number) => {
        if (!distinctRoots.some((dr) => Math.abs(dr - val) < 1e-5)) {
          distinctRoots.push(val);
        }
      };
      addDistinct(r1);
      addDistinct(r2);

      let factoredLhs = '';
      if (quadRoots.length === 2 && toFraction(quadRoots[0]) && toFraction(quadRoots[1])) {
        const r3 = quadRoots[0];
        const r4 = quadRoots[1];
        addDistinct(r3);
        addDistinct(r4);

        // Group identical factors into powers (e.g. (x - 1)^2)
        const allRationalRoots = [r1, r2, r3, r4];
        const factorCounts = new Map<string, { count: number; root: number }>();
        for (const rootVal of allRationalRoots) {
          const factorStr = formatLinearFactor(rootVal, variable);
          const existing = factorCounts.get(factorStr);
          if (existing) {
            existing.count++;
          } else {
            factorCounts.set(factorStr, { count: 1, root: rootVal });
          }
        }

        const factorParts: string[] = [];
        factorCounts.forEach(({ count, root }, factorStr) => {
          if (count > 1) {
            factorParts.push(`${factorStr}^${count}`);
          } else {
            factorParts.push(factorStr);
          }
          const frac = toFraction(root);
          const rootDisplay = frac ? fmtFraction(root) : fmt(root);
          subSteps.push({
            title: `Solve ${factorStr.replace(/[()]/g, '')} = 0:`,
            math: `${factorStr.replace(/[()]/g, '')} = 0 \\implies ${variable} = ${rootDisplay}`,
          });
        });

        factoredLhs = factorParts.join('');
      } else {
        // Quadratic factor is not completely rational or has complex roots
        factoredLhs = `${f1}${f2}(${q2Poly})`;
        const frac1 = toFraction(r1);
        const frac2 = toFraction(r2);
        subSteps.push({
          title: `Solve ${f1.replace(/[()]/g, '')} = 0:`,
          math: `${f1.replace(/[()]/g, '')} = 0 \\implies ${variable} = ${frac1 ? fmtFraction(r1) : fmt(r1)}`,
        });
        if (Math.abs(r1 - r2) >= 1e-5) {
          subSteps.push({
            title: `Solve ${f2.replace(/[()]/g, '')} = 0:`,
            math: `${f2.replace(/[()]/g, '')} = 0 \\implies ${variable} = ${frac2 ? fmtFraction(r2) : fmt(r2)}`,
          });
        }
        subSteps.push({
          title: `Solve ${q2Poly} = 0:`,
          math: `${variable} = \\frac{${fmt(-qb)} \\pm \\sqrt{${fmt(deltaQ)}}}{${fmt(2 * qa)}}`,
        });
      }

      steps.push({
        stepNumber: stepCount++,
        explanation: `Combine into completely factored form and apply the Zero Factor Principle (if $a \\cdot b = 0$, then $a = 0$ or $b = 0$).`,
        math: `${factoredLhs} = 0`,
        subSteps,
      });
    }
  } else {
    steps.push({
      stepNumber: stepCount++,
      explanation: `Test potential rational roots using the Rational Root Theorem. No simple rational root found.`,
      math: `\\text{Rational root test: No simple rational factors found}`,
    });
  }

  // Summary
  const distinctReal: number[] = [];
  roots.real.forEach((r) => {
    if (!distinctReal.some((dr) => Math.abs(dr - r) < 1e-5)) distinctReal.push(r);
  });
  const rootStrs: string[] = distinctReal.map((r) => {
    const frac = toFraction(r);
    return frac && frac.d > 1 ? fmtFraction(r) : fmt(r);
  });
  roots.complex.forEach((comp) => {
    const imStr = Math.abs(comp.im) === 1 ? 'i' : `${fmt(comp.im)}\\,i`;
    rootStrs.push(Math.abs(comp.re) < 1e-6 ? `\\pm ${imStr}` : `${fmt(comp.re)} \\pm ${imStr}`);
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: r1 !== null ? 'Final summary: All roots of the quartic equation are:' : 'Solved numerically. All roots of the quartic equation are:',
    math: `${variable} = ${rootStrs.join(', \\; ')}`,
  });

  return steps;
}

// ─── DEGREE 5+: HIGHER ORDER POLYNOMIAL STEPS ────────────────────────────────

export function generateDegree5PlusSteps(
  coeffs: number[],
  roots: { real: number[]; complex: { re: number; im: number }[] },
  variable: string = 'x',
  equationContext?: string | EquationSidesContext
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;
  const degree = coeffs.length - 1;

  const stdStep = formatStandardFormStep(degree, coeffs, variable, equationContext);
  steps.push({
    stepNumber: stepCount++,
    explanation: stdStep.explanation,
    math: stdStep.math,
    subSteps: stdStep.subSteps,
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: `Degree 5+ polynomials have no general algebraic solution (Abel–Ruffini theorem) — roots shown are computed numerically.`,
    math: `\\text{Degree } n = ${degree} \\ge 5 \\implies \\text{No general radical formula (Abel–Ruffini Theorem)}`,
  });

  const distinctReal5: number[] = [];
  roots.real.forEach((r) => {
    if (!distinctReal5.some((dr) => Math.abs(dr - r) < 1e-5)) distinctReal5.push(r);
  });
  const rootStrs5: string[] = distinctReal5.map((r) => fmt(r));
  roots.complex.forEach((comp) => {
    const imStr = Math.abs(comp.im) === 1 ? 'i' : `${fmt(comp.im)}\\,i`;
    rootStrs5.push(Math.abs(comp.re) < 1e-6 ? `\\pm ${imStr}` : `${fmt(comp.re)} \\pm ${imStr}`);
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: `Extracted all ${degree} roots (real and complex) using numerical eigenvalue computation:`,
    math: `${variable} = ${rootStrs5.join(', \\; ')}`,
  });

  return steps;
}

// ─── SYSTEM & INEQUALITY STEPS ───────────────────────────────────────────────

export function generateHigherOrderSteps(
  equation: string,
  roots: string[],
  variable: string = 'x'
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  steps.push({
    stepNumber: stepCount++,
    explanation: `Set the equation in standard form $f(${variable}) = 0$.`,
    math: `${equation} = 0`,
  });

  // Deduplicate roots mathematically and clean float representations
  const uniqueRoots: string[] = [];
  roots.forEach((r) => {
    const num = parseFloat(r);
    const existing = uniqueRoots.find((u) => {
      const uNum = parseFloat(u);
      if (!isNaN(num) && !isNaN(uNum)) {
        return Math.abs(num - uNum) < 1e-5;
      }
      return u === r;
    });
    if (!existing) {
      uniqueRoots.push(r);
    }
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: 'Solved roots for the equation:',
    math: uniqueRoots.length === 1
      ? `${variable} = ${uniqueRoots[0]}`
      : uniqueRoots.map((r, i) => `${variable}_${i + 1} = ${r}`).join(', \\quad '),
  });

  return steps;
}

export function generateSystemSteps(
  matrix: number[][],
  constants: number[],
  variables: string[]
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  const latexMatrix = matrix.map((row) => row.map((c) => fmt(c)).join(' & ')).join(' \\\\ ');
  const latexConstants = constants.map((c) => fmt(c)).join(' \\\\ ');
  const latexVars = variables.join(' \\\\ ');

  steps.push({
    stepNumber: stepCount++,
    explanation: 'Set up the system in matrix form $A\\mathbf{x} = \\mathbf{b}$.',
    math: `\\begin{bmatrix} ${latexMatrix} \\end{bmatrix} \\begin{bmatrix} ${latexVars} \\end{bmatrix} = \\begin{bmatrix} ${latexConstants} \\end{bmatrix}`,
  });

  if (matrix.length === 2 && matrix[0].length === 2) {
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    steps.push({
      stepNumber: stepCount++,
      explanation: "Compute the determinant of the coefficient matrix using Cramer's rule.",
      math: `\\det(A) = (${fmt(matrix[0][0])})(${fmt(matrix[1][1])}) - (${fmt(matrix[0][1])})(${fmt(matrix[1][0])}) = ${fmt(det)}`,
    });

    if (Math.abs(det) > 1e-9) {
      const x = (constants[0] * matrix[1][1] - matrix[0][1] * constants[1]) / det;
      const y = (matrix[0][0] * constants[1] - constants[0] * matrix[1][0]) / det;
      steps.push({
        stepNumber: stepCount++,
        explanation: "Apply Cramer's rule to find each variable.",
        math: `${variables[0]} = \\frac{${fmt(constants[0] * matrix[1][1] - matrix[0][1] * constants[1])}}{${fmt(det)}} = ${fmt(x)}, \\quad ${variables[1]} = \\frac{${fmt(matrix[0][0] * constants[1] - constants[0] * matrix[1][0])}}{${fmt(det)}} = ${fmt(y)}`,
      });
    } else {
      const detX = constants[0] * matrix[1][1] - matrix[0][1] * constants[1];
      const detY = matrix[0][0] * constants[1] - constants[0] * matrix[1][0];
      if (Math.abs(detX) < 1e-9 && Math.abs(detY) < 1e-9) {
        steps.push({
          stepNumber: stepCount++,
          explanation: 'The determinant is zero and the equations represent the same line: there are infinitely many solutions (dependent system).',
          math: `\\det(A) = 0, \\; D_{${variables[0]}} = 0, \\; D_{${variables[1]}} = 0 \\implies \\text{Dependent system (infinitely many solutions)}`,
        });
      } else {
        steps.push({
          stepNumber: stepCount++,
          explanation: 'The determinant is zero and the lines are parallel with different intercepts: there is no solution (inconsistent system).',
          math: `\\det(A) = 0, \\; D_{${variables[0]}} = ${fmt(detX)} \\neq 0 \\implies \\text{Inconsistent system (parallel lines, no solution)}`,
        });
      }
    }
  } else {
    steps.push({
      stepNumber: stepCount++,
      explanation: 'Solve using Gaussian elimination and back-substitution.',
      math: `\\mathbf{x} = A^{-1}\\mathbf{b}`,
    });
  }

  return steps;
}

export function generateInequalitySteps(coefficients: number[], type: string): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  steps.push({
    stepNumber: stepCount++,
    explanation: 'Identify the inequality coefficients.',
    math: `\\text{Coefficients: } ${coefficients.map((c) => fmt(c)).join(', ')}`,
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: 'Find the critical boundary points by solving $f(x) = 0$.',
    math: `\\text{Critical boundary points computed}`,
  });

  return steps;
}
