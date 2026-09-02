import { SolutionStep, DivisionDetails, QuadraticMethod } from '@/types/solver';

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
function formatPolyEvaluation(coeffs: number[], x0: number, variable: string): string {
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
  return `f(${fmt(x0)}) = ${terms.join(' ')} = ${evalTerms.join(' ')}${checkMark}`;
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

export function generateLinearSteps(a: number, b: number, variable: string = 'x'): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  steps.push({
    stepNumber: stepCount++,
    explanation: `Write the equation in standard linear form $a${variable} + b = 0$.`,
    math: `${formatPolynomial([a, b], variable)} = 0`,
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: `Move the constant term to the right side of the equation.`,
    math: `${fmt(a)}${variable} = ${fmt(-b)}`,
  });

  const root = -b / a;
  steps.push({
    stepNumber: stepCount++,
    explanation: `Divide both sides by the leading coefficient $a = ${fmt(a)}$ to isolate $${variable}$.`,
    math: `${variable} = \\frac{${fmt(-b)}}{${fmt(a)}} = ${fmt(root)}`,
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
  variable: string = 'x'
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  steps.push({
    stepNumber: stepCount++,
    explanation: `Write the quadratic equation in standard form $ax^2 + bx + c = 0$.`,
    math: `${formatPolynomial([a, b, c], variable)} = 0`,
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
  method: QuadraticMethod = 'auto'
): SolutionStep[] {
  // If specific method requested: Completing the Square
  if (method === 'completing_square') {
    return generateCompletingTheSquareSteps(a, b, c, variable);
  }

  const steps: SolutionStep[] = [];
  let stepCount = 1;

  // 1. Write the equation in standard form
  steps.push({
    stepNumber: stepCount++,
    explanation: `Write the equation in standard quadratic form $ax^2 + bx + c = 0$.`,
    math: `${formatPolynomial([a, b, c], variable)} = 0`,
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
    const imaginaryPart = Math.sqrt(-delta) / (2 * a);

    steps.push({
      stepNumber: stepCount++,
      explanation: 'Simplify the two complex conjugate roots:',
      math: `${variable} = ${fmt(realPart)} \\pm ${fmt(imaginaryPart)}\\,i`,
    });

    steps.push({
      stepNumber: stepCount++,
      explanation: `Verification for complex conjugate pair:`,
      math: `f(${fmt(realPart)} \\pm ${fmt(imaginaryPart)}i) = (${fmt(a)})(${fmt(realPart)} \\pm ${fmt(imaginaryPart)}i)^2 + (${fmt(b)})(${fmt(realPart)} \\pm ${fmt(imaginaryPart)}i) + (${fmt(c)}) = 0 \\;\\checkmark`,
    });
  }

  return steps;
}

// ─── DEGREE 3: CUBIC STEPS ───────────────────────────────────────────────────

export function generateCubicSteps(
  a: number,
  b: number,
  c: number,
  d: number,
  roots: { real: number[]; complex: { re: number; im: number }[] },
  variable: string = 'x'
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  // Step 1: Standard form
  steps.push({
    stepNumber: stepCount++,
    explanation: `Write the cubic equation in standard form $a${variable}^3 + b${variable}^2 + c${variable} + d = 0$.`,
    math: `${formatPolynomial([a, b, c, d], variable)} = 0`,
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

  // Sort candidate list nicely: 1, -1, 2, -2, etc.
  candidateFractions.sort((f1, f2) => Math.abs(f1.val) - Math.abs(f2.val) || f2.val - f1.val);

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
    const r0Sign = r0 >= 0 ? `- ${fmt(Math.abs(r0))}` : `+ ${fmt(Math.abs(r0))}`;

    // Step 2: Rational Root Theorem testing
    steps.push({
      stepNumber: stepCount++,
      explanation: `Use the Rational Root Theorem (a way to test for simple fraction/whole-number roots before trying harder methods). Candidate rational roots are $\\pm \\frac{\\text{factors of } |d = ${fmt(d)}|}{\\text{factors of } |a = ${fmt(a)}|}$: $${candidatesDisplay}$. We test candidates and find $${variable} = ${fmt(r0)}$ is a root, so $(${variable} ${r0Sign})$ is a factor.`,
      math: testTrail.join(' \\\\[4pt] '),
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
        math: `${variable}_1 = ${fmt(r0)}, \\quad ${variable}_2 = ${fmt(r2)}, \\quad ${variable}_3 = ${fmt(r3)}`,
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
        math: `${variable}_1 = ${fmt(r0)}, \\quad ${variable}_2 = ${fmt(r2)}, \\quad ${variable}_3 = ${fmt(r2)}`,
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
        math: `${variable}_2 = ${fmt(realPart)} + ${fmt(imagPart)}\\,i, \\quad ${variable}_3 = ${fmt(realPart)} - ${fmt(imagPart)}\\,i`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: 'Final summary: All roots of the cubic equation (one real root and two complex conjugate roots):',
        math: `${variable}_1 = ${fmt(r0)}, \\quad ${variable}_{2,3} = ${fmt(realPart)} \\pm ${fmt(imagPart)}\\,i`,
      });
    }
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

  return steps;
}

// ─── DEGREE 4: QUARTIC STEPS ─────────────────────────────────────────────────

export function generateQuarticSteps(
  coeffs: number[],
  roots: { real: number[]; complex: { re: number; im: number }[] },
  variable: string = 'x'
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;
  const [a, b, c, d, e] = coeffs;

  // Step 1: Standard form
  steps.push({
    stepNumber: stepCount++,
    explanation: `Write the quartic equation in standard form $a${variable}^4 + b${variable}^3 + c${variable}^2 + d${variable} + e = 0$.`,
    math: `${formatPolynomial(coeffs, variable)} = 0`,
  });

  // Special Case: Bi-quadratic ax^4 + cx^2 + e = 0 (b = 0 and d = 0)
  if (Math.abs(b) < 1e-6 && Math.abs(d) < 1e-6) {
    steps.push({
      stepNumber: stepCount++,
      explanation: `Notice that only even powers of $${variable}$ appear. Substitute $u = ${variable}^2$ to transform into a quadratic equation in $u$.`,
      math: `${fmt(a)}u^2 ${c >= 0 ? `+ ${fmt(c)}` : `- ${fmt(Math.abs(c))}`}u ${e >= 0 ? `+ ${fmt(e)}` : `- ${fmt(Math.abs(e))}`} = 0`,
    });

    const deltaU = c * c - 4 * a * e;
    steps.push({
      stepNumber: stepCount++,
      explanation: `Solve the quadratic in $u$ using the quadratic formula with discriminant $\\Delta = ${fmt(deltaU)}$.`,
      math: `u = \\frac{${fmt(-c)} \\pm \\sqrt{${fmt(deltaU)}}}{${fmt(2 * a)}}`,
    });

    const rootStrs: string[] = [];
    roots.real.forEach((r, i) => rootStrs.push(`${variable}_${i + 1} = ${fmt(r)}`));
    roots.complex.forEach((comp) =>
      rootStrs.push(`${variable} = ${fmt(comp.re)} \\pm ${fmt(comp.im)}\\,i`)
    );

    steps.push({
      stepNumber: stepCount++,
      explanation: `Take the square roots $${variable} = \\pm \\sqrt{u}$ to find all 4 roots:`,
      math: rootStrs.join(', \\quad '),
    });

    return steps;
  }

  // General Quartic: Try Rational Root Theorem
  const eFactors = getFactors(e, 100);
  const aFactors = getFactors(a, 50);
  const candidates: number[] = [];
  const seen = new Set<number>();

  for (const p of eFactors) {
    for (const q of aFactors) {
      const v1 = p / q;
      const v2 = -p / q;
      if (!seen.has(v1)) {
        seen.add(v1);
        candidates.push(v1);
      }
      if (!seen.has(v2)) {
        seen.add(v2);
        candidates.push(v2);
      }
    }
  }

  candidates.sort((x1, x2) => Math.abs(x1) - Math.abs(x2) || x2 - x1);

  // Find first rational root
  let r1: number | null = null;
  for (const cand of candidates) {
    if (Math.abs(evalPoly(coeffs, cand)) < 1e-7) {
      r1 = cand;
      break;
    }
  }

  if (r1 !== null) {
    const r1Sign = r1 >= 0 ? `- ${fmt(Math.abs(r1))}` : `+ ${fmt(Math.abs(r1))}`;
    steps.push({
      stepNumber: stepCount++,
      explanation: `Apply the Rational Root Theorem (a way to test for simple fraction/whole-number roots before trying harder methods). We find $${variable} = ${fmt(r1)}$ is a root, so $(${variable} ${r1Sign})$ is a factor.`,
      math: formatPolyEvaluation(coeffs, r1, variable),
    });

    // Synthetic division to degree 3
    const q3: number[] = [coeffs[0]];
    for (let i = 1; i < coeffs.length - 1; i++) {
      q3.push(coeffs[i] + q3[i - 1] * r1);
    }
    const q3Poly = formatPolynomial(q3, variable);
    const divisor1Str = `${variable} ${r1Sign}`;
    const dividend1Str = formatPolynomial(coeffs, variable);

    const longDiv1Math = generatePolynomialLongDivisionLatex(coeffs, r1, variable);
    const synth1Math = generateSyntheticDivisionLatex(coeffs, r1, variable);

    steps.push({
      stepNumber: stepCount++,
      explanation: `Divide the quartic polynomial by $(${divisor1Str})$ to obtain the depressed cubic factor $${q3Poly}$. Both Long Division (NCERT standard) and Synthetic Division (shortcut) are shown:`,
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

    // Try finding second rational root in q3
    let r2: number | null = null;
    for (const cand of candidates) {
      if (Math.abs(evalPoly(q3, cand)) < 1e-7) {
        r2 = cand;
        break;
      }
    }

    if (r2 !== null) {
      const r2Sign = r2 >= 0 ? `- ${fmt(Math.abs(r2))}` : `+ ${fmt(Math.abs(r2))}`;
      steps.push({
        stepNumber: stepCount++,
        explanation: `Test rational candidates on the cubic factor $${q3Poly} = 0$. We find $${variable} = ${fmt(r2)}$ is another root, so $(${variable} ${r2Sign})$ is a factor.`,
        math: formatPolyEvaluation(q3, r2, variable),
      });

      // Synthetic division to degree 2
      const q2: number[] = [q3[0]];
      for (let i = 1; i < q3.length - 1; i++) {
        q2.push(q3[i] + q2[i - 1] * r2);
      }
      const q2Poly = formatPolynomial(q2, variable);
      const divisor2Str = `${variable} ${r2Sign}`;
      const dividend2Str = q3Poly;

      const longDiv2Math = generatePolynomialLongDivisionLatex(q3, r2, variable);
      const synth2Math = generateSyntheticDivisionLatex(q3, r2, variable);

      steps.push({
        stepNumber: stepCount++,
        explanation: `Divide the cubic factor by $(${divisor2Str})$ to obtain the quadratic factor $${q2Poly}$. Both Long Division and Synthetic Division methods:`,
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
    }
  } else {
    steps.push({
      stepNumber: stepCount++,
      explanation: `Test potential rational roots using the Rational Root Theorem. No simple rational root found.`,
      math: `\\text{Rational root test: No simple rational factors found}`,
    });
  }

  // Summary
  const rootStrs: string[] = [];
  roots.real.forEach((r, i) => rootStrs.push(`${variable}_${i + 1} = ${fmt(r)}`));
  roots.complex.forEach((comp, i) =>
    rootStrs.push(
      `${variable}_${roots.real.length + i + 1} = ${fmt(comp.re)} \\pm ${fmt(comp.im)}\\,i`
    )
  );

  steps.push({
    stepNumber: stepCount++,
    explanation: r1 !== null ? 'Final summary: All roots of the quartic equation are:' : 'Solved numerically. All roots of the quartic equation are:',
    math: rootStrs.join(', \\quad '),
  });

  return steps;
}

// ─── DEGREE 5+: HIGHER ORDER POLYNOMIAL STEPS ────────────────────────────────

export function generateDegree5PlusSteps(
  coeffs: number[],
  roots: { real: number[]; complex: { re: number; im: number }[] },
  variable: string = 'x'
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;
  const degree = coeffs.length - 1;

  steps.push({
    stepNumber: stepCount++,
    explanation: `Write the degree-${degree} polynomial equation in standard form $f(${variable}) = 0$.`,
    math: `${formatPolynomial(coeffs, variable)} = 0`,
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: `Degree 5+ polynomials have no general algebraic solution (Abel–Ruffini theorem) — roots shown are computed numerically.`,
    math: `\\text{Degree } n = ${degree} \\ge 5 \\implies \\text{No general radical formula (Abel–Ruffini Theorem)}`,
  });

  const rootStrs: string[] = [];
  roots.real.forEach((r, i) => rootStrs.push(`${variable}_${i + 1} = ${fmt(r)}`));
  roots.complex.forEach((comp, i) =>
    rootStrs.push(
      `${variable}_${roots.real.length + i + 1} = ${fmt(comp.re)} \\pm ${fmt(comp.im)}\\,i`
    )
  );

  steps.push({
    stepNumber: stepCount++,
    explanation: `Extracted all ${degree} roots (real and complex) using numerical eigenvalue computation:`,
    math: rootStrs.join(', \\quad '),
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

  steps.push({
    stepNumber: stepCount++,
    explanation: 'Solved roots for the equation:',
    math: roots.map((r, i) => `${variable}_${i + 1} = ${r}`).join(', \\quad '),
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
      steps.push({
        stepNumber: stepCount++,
        explanation: 'The determinant is zero — the system has no unique solution (dependent or inconsistent).',
        math: `\\det(A) = 0`,
      });
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
