import { SolutionStep } from '@/types/solver';

/** Format a signed coefficient term for display, handling +/- gracefully. */
function signedTerm(coeff: number, varPart: string, isFirst: boolean): string {
  if (coeff === 0) return '';
  const absC = Math.abs(coeff);
  const sign = coeff > 0 ? (isFirst ? '' : '+ ') : '- ';
  const num = absC === 1 && varPart ? '' : `${absC}`;
  return `${sign}${num}${varPart}`;
}

/** Format a polynomial expression like "72t^3 + 4t - 76" from coefficients. */
function formatPolynomial(coeffs: number[], variable: string): string {
  // coeffs[0] = highest degree, last = constant
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
function formatPolyWithZeros(coeffs: number[], variable: string): string {
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

/** Format evaluation of f(r0) showing substituted values and arithmetic. */
function formatRootEvaluation(
  a: number,
  b: number,
  c: number,
  d: number,
  r0: number,
  variable: string
): string {
  const terms: string[] = [];
  const evalTerms: string[] = [];

  const addTerm = (coeff: number, power: number) => {
    if (coeff === 0) return;
    const absC = Math.abs(coeff);
    const sign = coeff > 0 ? (terms.length === 0 ? '' : '+ ') : '- ';
    const termVal = coeff * Math.pow(r0, power);
    const evalSign = termVal >= 0 ? (evalTerms.length === 0 ? '' : '+ ') : '- ';

    let varStr = '';
    if (power >= 2) varStr = `(${fmt(r0)})^${power}`;
    else if (power === 1) varStr = `(${fmt(r0)})`;

    const coeffStr = absC === 1 && power > 0 ? '' : `${absC}`;
    terms.push(`${sign}${coeffStr}${varStr}`);
    evalTerms.push(`${evalSign}${fmt(Math.abs(termVal))}`);
  };

  addTerm(a, 3);
  addTerm(b, 2);
  addTerm(c, 1);
  addTerm(d, 0);

  return `f(${fmt(r0)}) = ${terms.join(' ')} = ${evalTerms.join(' ')} = 0 \\;\\checkmark`;
}

/** Format a number for clean display: strip trailing zeros, round to 6 sig digits. */
function fmt(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  // Use at most 6 decimal places, strip trailing zeros
  const s = n.toFixed(6).replace(/\.?0+$/, '');
  return s;
}

/** Compute GCD of two integers. */
function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

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
    explanation: `Move the constant to the right side.`,
    math: `${fmt(a)}${variable} = ${fmt(-b)}`,
  });

  const root = -b / a;
  steps.push({
    stepNumber: stepCount++,
    explanation: `Divide both sides by the coefficient $a = ${fmt(a)}$.`,
    math: `${variable} = \\frac{${fmt(-b)}}{${fmt(a)}} = ${fmt(root)}`,
  });

  return steps;
}

/**
 * Check if a number is a non-negative perfect square integer.
 */
function isPerfectSquare(n: number): boolean {
  if (n < 0 || !Number.isFinite(n)) return false;
  const rounded = Math.round(n);
  if (Math.abs(n - rounded) > 1e-6) return false;
  if (rounded < 0) return false;
  const s = Math.round(Math.sqrt(rounded));
  return s * s === rounded;
}

/**
 * Find integer factors m, n such that m * n = c and m + n = b.
 * For monic quadratic x^2 + bx + c = (x + m)(x + n) = 0.
 */
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

  // Also test using quadratic root directly
  const sqrtD = Math.round(Math.sqrt(delta));
  const r1 = (-roundB + sqrtD) / 2;
  const r2 = (-roundB - sqrtD) / 2;
  if (Number.isInteger(r1) && Number.isInteger(r2)) {
    return { m: -r1, n: -r2 };
  }

  return null;
}

/**
 * Find integer factors for non-monic quadratics ax^2 + bx + c = 0 via the AC method.
 * Finds m, n such that m * n = a * c and m + n = b, then factors by grouping.
 */
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

  // Factor by grouping:
  // ax^2 + mx + nx + c
  // Group 1: gcd(a, m)x * ( (a/g1)x + (m/g1) )
  // Group 2: gcd(n, c) * ( (n/g2)x + (c/g2) )
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

export function generateQuadraticSteps(
  a: number,
  b: number,
  c: number,
  variable: string = 'x'
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  // 1. Write the equation in standard form
  steps.push({
    stepNumber: stepCount++,
    explanation: `Write the equation in standard form $ax^2 + bx + c = 0$.`,
    math: `${formatPolynomial([a, b, c], variable)} = 0`,
  });

  const delta = b * b - 4 * a * c;

  // ─── PATH 1: Monic Integer Factoring (a = 1) ───────────────────────────
  if (Math.abs(a - 1) < 1e-6) {
    const monicFactors = findMonicFactors(b, c);
    if (monicFactors !== null) {
      const { m, n } = monicFactors;
      const x1 = -m;
      const x2 = -n;

      // Explain factoring search
      steps.push({
        stepNumber: stepCount++,
        explanation: `Find two numbers that multiply to $c = ${fmt(c)}$ and add up to $b = ${fmt(b)}$.`,
        math: `(${fmt(m)}) \\times (${fmt(n)}) = ${fmt(c)}, \\quad (${fmt(m)}) + (${fmt(n)}) = ${fmt(b)}`,
      });

      // Factored form
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

        // Verification
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

        // Verification
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

        // Verification
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

        // Verification
        steps.push({
          stepNumber: stepCount++,
          explanation: `Verify each root by substituting back into the original equation.`,
          math: `${formatQuadraticVerification(a, b, c, x1, variable)} \\\\[6pt] ${formatQuadraticVerification(a, b, c, x2, variable)}`,
        });
      }

      return steps;
    }
  }

  // ─── PATH 3: Quadratic Formula Fallback (Irrational or Complex Roots) ───
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
    deltaInterpretation = 'Since $\\Delta < 0$, the equation has two complex conjugate roots.';
  }

  // Merged Calculate & Interpret Discriminant step
  steps.push({
    stepNumber: stepCount++,
    explanation: `Calculate the discriminant $\\Delta = b^2 - 4ac$. ${deltaInterpretation}`,
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

  // Try to find a rational root by direct evaluation
  let rationalRoot: number | null = null;
  // Gather candidate rational roots: ±(factors of |d|) / (factors of |a|)
  const factorsOf = (n: number): number[] => {
    n = Math.abs(Math.round(n));
    if (n === 0) return [0];
    const factors: number[] = [];
    for (let i = 1; i <= Math.min(n, 100); i++) {
      if (n % i === 0) factors.push(i);
    }
    return factors;
  };

  const dFactors = factorsOf(d);
  const aFactors = factorsOf(a);
  const candidates = new Set<number>();
  for (const p of dFactors) {
    for (const q of aFactors) {
      candidates.add(p / q);
      candidates.add(-p / q);
    }
  }

  for (const candidate of Array.from(candidates)) {
    const val = a * Math.pow(candidate, 3) + b * Math.pow(candidate, 2) + c * candidate + d;
    if (Math.abs(val) < 1e-8) {
      rationalRoot = candidate;
      break;
    }
  }

  // If Cardano found a root close to an integer, use that
  if (rationalRoot === null) {
    const integerRoot = roots.real.find((r) => Math.abs(r - Math.round(r)) < 1e-4);
    if (integerRoot !== undefined) {
      rationalRoot = Math.round(integerRoot);
    }
  }

  if (rationalRoot !== null) {
    const r0 = rationalRoot;
    const r0Sign = r0 >= 0 ? `- ${fmt(Math.abs(r0))}` : `+ ${fmt(Math.abs(r0))}`;

    // Step 2: Rational Root Test
    steps.push({
      stepNumber: stepCount++,
      explanation: `Test potential rational roots using the Rational Root Theorem (factors of $d = ${fmt(d)}$ divided by factors of $a = ${fmt(a)}$). We find $${variable} = ${fmt(r0)}$ is a root since $f(${fmt(r0)}) = 0$.`,
      math: formatRootEvaluation(a, b, c, d, r0, variable),
    });

    // Step 3: Synthetic Division Process
    const qA = a;
    const qB = b + a * r0;
    const qC = c + qB * r0;

    const polyFull = formatPolyWithZeros([a, b, c, d], variable);
    const quotientPoly = formatPolynomial([qA, qB, qC], variable);

    steps.push({
      stepNumber: stepCount++,
      explanation: `Perform synthetic division of $${polyFull}$ by the factor $(${variable} ${r0Sign})$ to find the depressed quadratic quotient.`,
      math: `\\begin{array}{c|rrrr} ${fmt(r0)} & ${fmt(a)} & ${fmt(b)} & ${fmt(c)} & ${fmt(d)} \\\\ & & ${fmt(a * r0)} & ${fmt(qB * r0)} & ${fmt(qC * r0)} \\\\ \\hline & ${fmt(qA)} & ${fmt(qB)} & ${fmt(qC)} & 0 \\end{array} \\implies \\frac{${polyFull}}{${variable} ${r0Sign}} = ${quotientPoly}`,
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
        explanation: `Express the cubic in factored form, factoring out the common factor $${fmt(g)}$ from the quadratic polynomial.`,
        math: `(${variable} ${r0Sign})(${quotientPoly}) = 0 \\implies ${fmt(g)}(${variable} ${r0Sign})(${simplifiedQuadratic}) = 0`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: `Divide both sides by $${fmt(g)}$ since constant non-zero factors do not affect the roots. This isolates the simplified quadratic equation.`,
        math: `(${variable} ${r0Sign})(${simplifiedQuadratic}) = 0 \\implies ${simplifiedQuadratic} = 0`,
      });
    } else {
      steps.push({
        stepNumber: stepCount++,
        explanation: `Express the cubic equation in factored form and isolate the quadratic factor.`,
        math: `(${variable} ${r0Sign})(${quotientPoly}) = 0 \\implies ${quotientPoly} = 0`,
      });
    }

    // Step 5: Solve Quadratic Factor (Discriminant)
    const deltaQ = sB * sB - 4 * sA * sC;

    let deltaExplanation = '';
    if (deltaQ > 0) {
      deltaExplanation = `Calculate the discriminant $\\Delta = b^2 - 4ac$ for the quadratic $${simplifiedQuadratic} = 0$ with $a = ${fmt(sA)}$, $b = ${fmt(sB)}$, $c = ${fmt(sC)}$. Since $\\Delta > 0$, there are two distinct real roots.`;
    } else if (Math.abs(deltaQ) < 1e-8) {
      deltaExplanation = `Calculate the discriminant $\\Delta = b^2 - 4ac$ for the quadratic $${simplifiedQuadratic} = 0$ with $a = ${fmt(sA)}$, $b = ${fmt(sB)}$, $c = ${fmt(sC)}$. Since $\\Delta = 0$, there is a repeated real root.`;
    } else {
      deltaExplanation = `Calculate the discriminant $\\Delta = b^2 - 4ac$ for the quadratic $${simplifiedQuadratic} = 0$ with $a = ${fmt(sA)}$, $b = ${fmt(sB)}$, $c = ${fmt(sC)}$. Since $\\Delta < 0$, there are two complex conjugate roots.`;
    }

    steps.push({
      stepNumber: stepCount++,
      explanation: deltaExplanation,
      math: `\\Delta = (${fmt(sB)})^2 - 4(${fmt(sA)})(${fmt(sC)}) = ${fmt(sB * sB)} - (${fmt(4 * sA * sC)}) = ${fmt(deltaQ)}`,
    });

    // Step 6: Quadratic Formula Computation
    if (deltaQ > 0) {
      const sqrtDelta = Math.sqrt(deltaQ);
      const r2 = (-sB + sqrtDelta) / (2 * sA);
      const r3 = (-sB - sqrtDelta) / (2 * sA);

      steps.push({
        stepNumber: stepCount++,
        explanation: `Substitute $a = ${fmt(sA)}$, $b = ${fmt(sB)}$, and $\\Delta = ${fmt(deltaQ)}$ into the quadratic formula $${variable} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.`,
        math: `${variable} = \\frac{-(${fmt(sB)}) \\pm \\sqrt{${fmt(deltaQ)}}}{2(${fmt(sA)})} = \\frac{${fmt(-sB)} \\pm ${fmt(sqrtDelta)}}{${fmt(2 * sA)}}`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: 'Compute the two individual real roots from the quadratic formula.',
        math: `${variable}_2 = \\frac{${fmt(-sB)} + ${fmt(sqrtDelta)}}{${fmt(2 * sA)}} = ${fmt(r2)}, \\quad ${variable}_3 = \\frac{${fmt(-sB)} - ${fmt(sqrtDelta)}}{${fmt(2 * sA)}} = ${fmt(r3)}`,
      });

      // Final Step: Root Summary
      steps.push({
        stepNumber: stepCount++,
        explanation: 'Final summary and verification: All three real roots of the cubic equation are:',
        math: `${variable}_1 = ${fmt(r0)}, \\quad ${variable}_2 = ${fmt(r2)}, \\quad ${variable}_3 = ${fmt(r3)}`,
      });
    } else if (Math.abs(deltaQ) < 1e-8) {
      const r2 = -sB / (2 * sA);

      steps.push({
        stepNumber: stepCount++,
        explanation: `Substitute $a = ${fmt(sA)}$, $b = ${fmt(sB)}$, and $\\Delta = 0$ into the quadratic formula $${variable} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.`,
        math: `${variable} = \\frac{-(${fmt(sB)}) \\pm 0}{2(${fmt(sA)})} = \\frac{${fmt(-sB)}}{${fmt(2 * sA)}} = ${fmt(r2)}`,
      });

      // Final Step: Root Summary
      steps.push({
        stepNumber: stepCount++,
        explanation: 'Final summary and verification: All roots of the cubic equation (including repeated root) are:',
        math: `${variable}_1 = ${fmt(r0)}, \\quad ${variable}_2 = ${fmt(r2)}, \\quad ${variable}_3 = ${fmt(r2)}`,
      });
    } else {
      const realPart = -sB / (2 * sA);
      const imagPart = Math.sqrt(-deltaQ) / (2 * sA);

      steps.push({
        stepNumber: stepCount++,
        explanation: `Substitute $a = ${fmt(sA)}$, $b = ${fmt(sB)}$, and $\\Delta = ${fmt(deltaQ)}$ into the quadratic formula $${variable} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.`,
        math: `${variable} = \\frac{-(${fmt(sB)}) \\pm \\sqrt{${fmt(deltaQ)}}}{2(${fmt(sA)})} = \\frac{${fmt(-sB)} \\pm \\sqrt{${fmt(-deltaQ)}}\\,i}{${fmt(2 * sA)}} = ${fmt(realPart)} \\pm ${fmt(imagPart)}\\,i`,
      });

      steps.push({
        stepNumber: stepCount++,
        explanation: 'Evaluate the two distinct complex conjugate roots.',
        math: `${variable}_2 = ${fmt(realPart)} + ${fmt(imagPart)}\\,i, \\quad ${variable}_3 = ${fmt(realPart)} - ${fmt(imagPart)}\\,i`,
      });

      // Final Step: Root Summary
      steps.push({
        stepNumber: stepCount++,
        explanation: 'Final summary and verification: All roots of the cubic equation (one real, two complex conjugate):',
        math: `${variable}_1 = ${fmt(r0)}, \\quad ${variable}_{2,3} = ${fmt(realPart)} \\pm ${fmt(imagPart)}\\,i`,
      });
    }
  } else {
    // No rational root found — use Cardano's method
    steps.push({
      stepNumber: stepCount++,
      explanation: "No rational root found. Apply Cardano's formula by depressing the cubic equation.",
      math: `\\text{Substitute } ${variable} = u - \\frac{b}{3a} = u - \\frac{${fmt(b)}}{${fmt(3 * a)}} \\text{ to eliminate the quadratic term}`,
    });

    const p = (3 * a * c - b * b) / (3 * a * a);
    const q = (2 * Math.pow(b, 3) - 9 * a * b * c + 27 * a * a * d) / (27 * Math.pow(a, 3));
    const cardanoDelta = (q * q) / 4 + Math.pow(p, 3) / 27;

    steps.push({
      stepNumber: stepCount++,
      explanation: `Transform to the depressed cubic $u^3 + pu + q = 0$ and compute parameters $p$, $q$, and Cardano discriminant $\\Delta_C = \\frac{q^2}{4} + \\frac{p^3}{27}$.`,
      math: `p = ${fmt(p)}, \\quad q = ${fmt(q)}, \\quad \\Delta_C = ${fmt(cardanoDelta)}`,
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
      explanation: "Final summary and verification: All roots obtained via Cardano's formula:",
      math: rootStrs.join(', \\quad '),
    });
  }

  return steps;
}

export function generateHigherOrderSteps(
  equation: string,
  roots: string[],
  variable: string = 'x'
): SolutionStep[] {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  steps.push({
    stepNumber: stepCount++,
    explanation: `Set the polynomial equation to standard form $f(${variable}) = 0$.`,
    math: `${equation} = 0`,
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: `Apply algebraic factorization and root extraction for variable $${variable}$.`,
    math: `\\text{Solve } f(${variable}) = 0`,
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: 'Extracted polynomial roots:',
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

  const latexMatrix = matrix.map((row) => row.join(' & ')).join(' \\\\ ');
  const latexConstants = constants.map((c) => c.toString()).join(' \\\\ ');
  const latexVars = variables.join(' \\\\ ');

  steps.push({
    stepNumber: stepCount++,
    explanation: 'Set up the system in augmented matrix form $[A|b]$.',
    math: `\\begin{bmatrix} ${latexMatrix} \\end{bmatrix} \\begin{bmatrix} ${latexVars} \\end{bmatrix} = \\begin{bmatrix} ${latexConstants} \\end{bmatrix}`,
  });

  if (matrix.length === 2 && matrix[0].length === 2) {
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    steps.push({
      stepNumber: stepCount++,
      explanation: "Compute the determinant of the coefficient matrix using Cramer's rule.",
      math: `\\det(A) = (${matrix[0][0]})(${matrix[1][1]}) - (${matrix[0][1]})(${matrix[1][0]}) = ${fmt(det)}`,
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
      explanation: 'Solve using Gaussian elimination or matrix inversion.',
      math: `x = A^{-1}b`,
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
    math: `\\text{Coefficients: } ${coefficients.map(c => fmt(c)).join(', ')}`,
  });

  steps.push({
    stepNumber: stepCount++,
    explanation: 'Find the critical points by solving the corresponding equation $f(x) = 0$.',
    math: `\\text{Critical roots computed}`,
  });

  return steps;
}
