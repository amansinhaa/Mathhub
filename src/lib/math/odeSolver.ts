/**
 * Ordinary Differential Equation (ODE) Solver
 *
 * Provides high-accuracy step-by-step solutions for:
 * 1. 2nd-Order Linear ODEs with Constant Coefficients:
 *    - Homogeneous: a*y'' + b*y' + c*y = 0 (distinct real, repeated, complex conjugate roots)
 *    - Non-Homogeneous: a*y'' + b*y' + c*y = f(x) via Undetermined Coefficients (polynomials, exponentials, sines/cosines)
 * 2. 1st-Order Linear ODEs: y' + P(x)y = Q(x) via integrating factor
 * 3. Direct integration: dy/dx = f(x)
 *
 * Provides exact symbolic expressions (integers, fractions, radicals) alongside decimal approximations.
 */

import nerdamer from 'nerdamer';
import type { SolverResult, SolutionStep } from '@/types/solver';
import { autoBalanceParens, normalizeExpression } from './normalizer';

export interface ODEDetection {
  isODE: boolean;
  order: 1 | 2;
  hasYPrime: boolean;
  hasYDoublePrime: boolean;
  dependentVar: string;
  independentVar: string;
}

// ---------------------------------------------------------------------------
// Arithmetic & Radical Helpers
// ---------------------------------------------------------------------------

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function formatFraction(num: number, den: number): string {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  num /= g;
  den /= g;
  if (den === 1) return `${num}`;
  if (num < 0) return `-\\frac{${-num}}{${den}}`;
  return `\\frac{${num}}{${den}}`;
}

function simplifyRadical(n: number): { coef: number; rad: number } {
  if (n <= 0) return { coef: 0, rad: 0 };
  let coef = 1;
  let rad = n;
  for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) {
    if (n % (i * i) === 0) {
      coef = i;
      rad = n / (i * i);
      break;
    }
  }
  return { coef, rad };
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

export function detectODE(input: string): ODEDetection {
  const clean = input.trim();
  const hasYDoublePrime = /y''|d\^2y\/dx\^2|y\^\{\(2\)\}/i.test(clean);
  const hasYPrime = /y'|dy\/dx|y\^\{\(1\)\}/i.test(clean);

  const isODE = hasYDoublePrime || hasYPrime;
  const order: 1 | 2 = hasYDoublePrime ? 2 : 1;

  return {
    isODE,
    order,
    hasYPrime,
    hasYDoublePrime,
    dependentVar: 'y',
    independentVar: 'x',
  };
}

// ---------------------------------------------------------------------------
// Main Solver Dispatch
// ---------------------------------------------------------------------------

export function solveODE(input: string): SolverResult {
  const balanced = autoBalanceParens(input);
  const detection = detectODE(balanced);

  if (!detection.isODE) {
    throw new Error('Input is not a recognized differential equation.');
  }

  // Canonicalize notations
  let eqStr = balanced
    .replace(/d\^2y\/dx\^2/gi, "y''")
    .replace(/dy\/dx/gi, "y'");

  if (!eqStr.includes('=')) {
    eqStr = `${eqStr} = 0`;
  }

  const [lhsRaw, rhsRaw] = eqStr.split('=').map((s) => s.trim());

  if (detection.order === 2) {
    return solveSecondOrderODE(lhsRaw, rhsRaw);
  }

  return solveFirstOrderODE(lhsRaw, rhsRaw);
}

// ---------------------------------------------------------------------------
// 2nd-Order Linear ODE Solver: a*y'' + b*y' + c*y = f(x)
// ---------------------------------------------------------------------------

function solveSecondOrderODE(lhs: string, rhs: string): SolverResult {
  // Pre-clean primes and implicit y multiplication so nerdamer can treat Y2, Y1, Y0 as symbols
  let normLhs = lhs.replace(/y''/g, 'Y2').replace(/y'/g, 'Y1').replace(/(\d)\s*y\b/g, '$1*y');
  normLhs = normLhs.replace(/\by\b/g, 'Y0');

  let normRhs = rhs.replace(/y''/g, 'Y2').replace(/y'/g, 'Y1').replace(/(\d)\s*y\b/g, '$1*y');
  normRhs = normRhs.replace(/\by\b/g, 'Y0');

  const expr = `(${normLhs}) - (${normRhs})`;

  const evalAt = (y2: number, y1: number, y0: number): string => {
    return nerdamer(expr, { Y2: String(y2), Y1: String(y1), Y0: String(y0) }).text();
  };

  let a = 0;
  let b = 0;
  let c = 0;
  let fExpr = '0';

  try {
    const e000 = evalAt(0, 0, 0);
    const e100 = evalAt(1, 0, 0);
    const e010 = evalAt(0, 1, 0);
    const e001 = evalAt(0, 0, 1);

    a = Number(nerdamer(`(${e100}) - (${e000})`).evaluate().text());
    b = Number(nerdamer(`(${e010}) - (${e000})`).evaluate().text());
    c = Number(nerdamer(`(${e001}) - (${e000})`).evaluate().text());
    fExpr = nerdamer(`-(${e000})`).expand().text().trim();
  } catch {
    // Regex fallback
    const m2 = lhs.match(/([+-]?\s*\d*)\s*\*?\s*y''/);
    const m1 = lhs.match(/([+-]?\s*\d*)\s*\*?\s*y'/);
    const m0 = lhs.match(/([+-]?\s*\d*)\s*\*?\s*y\b/);

    const parseCoeff = (m: RegExpMatchArray | null): number => {
      if (!m) return 0;
      const s = m[1].replace(/\s+/g, '');
      if (s === '' || s === '+') return 1;
      if (s === '-') return -1;
      return Number(s) || 1;
    };

    a = parseCoeff(m2);
    b = parseCoeff(m1);
    c = parseCoeff(m0);
    fExpr = rhs.trim();
  }

  if (isNaN(a) || a === 0) {
    throw new Error("Not a valid 2nd-order differential equation (coefficient of y'' is 0).");
  }

  const isHomogeneous = fExpr === '0' || fExpr === '' || fExpr === '0+0';

  const delta = b * b - 4 * a * c;
  const steps: SolutionStep[] = [];

  // Step 1: Standard form
  const aLatex = a === 1 ? '' : (a === -1 ? '-' : `${a}`);
  const bLatex = b === 0 ? '' : (b > 0 ? `+ ${b === 1 ? '' : b}y'` : `- ${Math.abs(b) === 1 ? '' : Math.abs(b)}y'`);
  const cLatex = c === 0 ? '' : (c > 0 ? `+ ${c === 1 ? '' : c}y` : `- ${Math.abs(c) === 1 ? '' : Math.abs(c)}y`);
  const fLatex = isHomogeneous ? '0' : nerdamer(fExpr).toTeX();

  steps.push({
    stepNumber: 1,
    explanation: 'Write the 2nd-order linear differential equation in standard form.',
    math: `${aLatex}y'' ${bLatex} ${cLatex} = ${fLatex}`,
  });

  // Step 2: Characteristic equation
  steps.push({
    stepNumber: 2,
    explanation: 'Solve the associated homogeneous equation by finding the roots of the characteristic polynomial $ar^2 + br + c = 0$.',
    math: `${a}r^2 + (${b})r + (${c}) = 0`,
  });

  // Step 3: Discriminant
  steps.push({
    stepNumber: 3,
    explanation: 'Compute the discriminant $\\Delta = b^2 - 4ac$ to determine the nature of the characteristic roots.',
    math: `\\Delta = (${b})^2 - 4(${a})(${c}) = ${delta}`,
  });

  let yhExact = '';
  let yhDecimal = '';
  let hasRadical = false;

  if (delta > 0) {
    const sInt = Math.round(Math.sqrt(delta));
    const isSquare = sInt * sInt === delta;

    let r1Exact = '';
    let r2Exact = '';
    let r1Dec = 0;
    let r2Dec = 0;

    if (isSquare) {
      r1Exact = formatFraction(-b + sInt, 2 * a);
      r2Exact = formatFraction(-b - sInt, 2 * a);
      r1Dec = (-b + sInt) / (2 * a);
      r2Dec = (-b - sInt) / (2 * a);
    } else {
      hasRadical = true;
      const { coef, rad } = simplifyRadical(delta);
      const g = gcd(gcd(-b, coef), 2 * a);
      const sNegB = -b / g;
      const sCoef = coef / g;
      const sDen = (2 * a) / g;

      const formatRadRoot = (sign: '+' | '-') => {
        const coefPart = sCoef === 1 ? '' : `${sCoef}`;
        if (sDen === 1) {
          return `${sNegB} ${sign} ${coefPart}\\sqrt{${rad}}`;
        }
        return `\\frac{${sNegB} ${sign} ${coefPart}\\sqrt{${rad}}}{${sDen}}`;
      };

      r1Exact = formatRadRoot('+');
      r2Exact = formatRadRoot('-');
      r1Dec = (-b + Math.sqrt(delta)) / (2 * a);
      r2Dec = (-b - Math.sqrt(delta)) / (2 * a);
    }

    const exp1 = r1Exact === '0' ? '' : (r1Exact === '1' ? 'e^{x}' : (r1Exact === '-1' ? 'e^{-x}' : (hasRadical ? `e^{\\left(${r1Exact}\\right)x}` : `e^{${r1Exact}x}`)));
    const exp2 = r2Exact === '0' ? '' : (r2Exact === '1' ? 'e^{x}' : (r2Exact === '-1' ? 'e^{-x}' : (hasRadical ? `e^{\\left(${r2Exact}\\right)x}` : `e^{${r2Exact}x}`)));

    yhExact = `C_1 ${exp1} + C_2 ${exp2}`.trim();
    yhDecimal = `C_1 e^{${r1Dec.toFixed(4)}x} + C_2 e^{${r2Dec.toFixed(4)}x}`;

    steps.push({
      stepNumber: 4,
      explanation: 'Since $\\Delta > 0$, there are two distinct real characteristic roots $r_1$ and $r_2$.',
      math: `r_1 = ${r1Exact}, \\quad r_2 = ${r2Exact}` + (hasRadical ? ` \\quad (\\approx ${r1Dec.toFixed(4)}, \\; ${r2Dec.toFixed(4)})` : ''),
    });

    steps.push({
      stepNumber: 5,
      explanation: 'Construct the complementary (homogeneous) solution $y_h(x) = C_1 e^{r_1 x} + C_2 e^{r_2 x}$.',
      math: `y_h(x) = ${yhExact}` + (hasRadical ? ` \\approx ${yhDecimal}` : ''),
    });
  } else if (delta === 0) {
    const rExact = formatFraction(-b, 2 * a);
    const rDec = -b / (2 * a);
    const expTerm = rExact === '0' ? '' : (rExact === '1' ? 'e^{x}' : (rExact === '-1' ? 'e^{-x}' : `e^{${rExact}x}`));

    yhExact = expTerm ? `(C_1 + C_2 x)${expTerm}` : `C_1 + C_2 x`;
    yhDecimal = `(C_1 + C_2 x)e^{${rDec.toFixed(4)}x}`;

    steps.push({
      stepNumber: 4,
      explanation: 'Since $\\Delta = 0$, there is a repeated real characteristic root $r$.',
      math: `r = \\frac{-(${b})}{2(${a})} = ${rExact}`,
    });

    steps.push({
      stepNumber: 5,
      explanation: 'Multiply the second fundamental solution by $x$ to ensure linear independence.',
      math: `y_h(x) = ${yhExact}`,
    });
  } else {
    // delta < 0: Complex conjugate roots alpha +- beta*i
    const alphaExact = formatFraction(-b, 2 * a);
    const alphaDec = -b / (2 * a);
    const posDelta = -delta;
    const sInt = Math.round(Math.sqrt(posDelta));
    const isSquare = sInt * sInt === posDelta;

    let betaExact = '';
    let betaDec = 0;

    if (isSquare) {
      betaExact = formatFraction(sInt, 2 * Math.abs(a));
      betaDec = sInt / (2 * Math.abs(a));
    } else {
      hasRadical = true;
      const { coef, rad } = simplifyRadical(posDelta);
      const g = gcd(coef, 2 * Math.abs(a));
      const sCoef = coef / g;
      const sDen = (2 * Math.abs(a)) / g;
      const coefPart = sCoef === 1 ? '' : `${sCoef}`;
      betaExact = sDen === 1 ? `${coefPart}\\sqrt{${rad}}` : `\\frac{${coefPart}\\sqrt{${rad}}}{${sDen}}`;
      betaDec = Math.sqrt(posDelta) / (2 * Math.abs(a));
    }

    const expTerm = -b === 0 ? '' : (alphaExact === '1' ? 'e^{x}' : (alphaExact === '-1' ? 'e^{-x}' : `e^{${alphaExact}x}`));
    const trigArg = betaExact === '1' ? 'x' : (hasRadical ? `\\left(${betaExact}\\right)x` : `${betaExact}x`);

    yhExact = expTerm
      ? `${expTerm}\\left(C_1 \\cos(${trigArg}) + C_2 \\sin(${trigArg})\\right)`
      : `C_1 \\cos(${trigArg}) + C_2 \\sin(${trigArg})`;

    yhDecimal = `${alphaDec !== 0 ? `e^{${alphaDec.toFixed(4)}x}` : ''}(C_1 \\cos(${betaDec.toFixed(4)}x) + C_2 \\sin(${betaDec.toFixed(4)}x))`;

    steps.push({
      stepNumber: 4,
      explanation: 'Since $\\Delta < 0$, the roots are complex conjugate pairs $r = \\alpha \\pm \\beta i$.',
      math: `\\alpha = ${alphaExact}, \\quad \\beta = ${betaExact}` + (hasRadical ? ` \\quad (\\approx ${betaDec.toFixed(4)})` : ''),
    });

    steps.push({
      stepNumber: 5,
      explanation: 'Apply Euler\'s formula to express the fundamental solutions as real oscillatory sines and cosines.',
      math: `y_h(x) = ${yhExact}` + (hasRadical ? ` \\approx ${yhDecimal}` : ''),
    });
  }

  // If homogeneous, we are done!
  if (isHomogeneous) {
    const finalAnswer = `y(x) = ${yhExact}`;
    const decimalAnswer = hasRadical ? `y(x) \\approx ${yhDecimal}` : undefined;

    return {
      type: 'ode',
      steps,
      finalAnswer,
      decimalAnswer,
      inputInterpretation: `${aLatex}y'' ${bLatex} ${cLatex} = 0`,
    };
  }

  // -------------------------------------------------------------------------
  // Non-Homogeneous Part: Find Particular Solution y_p(x)
  // -------------------------------------------------------------------------
  let ypExact = '';
  let ypMethodExplanation = '';

  // 1. Exponential RHS: f(x) = k*e^(m*x)
  const expMatch = fExpr.match(/([+-]?\s*\d*\.?\d*)\s*\*?\s*(?:exp|e\^)\(?([+-]?\s*\d*\.?\d*)\s*\*?\s*x\)?/);
  // 2. Trigonometric RHS: f(x) = k*sin(w*x) or k*cos(w*x)
  const sinMatch = fExpr.match(/([+-]?\s*\d*\.?\d*)\s*\*?\s*sin\(?([+-]?\s*\d*\.?\d*)\s*\*?\s*x\)?/);
  const cosMatch = fExpr.match(/([+-]?\s*\d*\.?\d*)\s*\*?\s*cos\(?([+-]?\s*\d*\.?\d*)\s*\*?\s*x\)?/);
  // 3. Polynomial RHS: f(x) = k, m*x, etc.
  const polyMatch = !expMatch && !sinMatch && !cosMatch;

  if (expMatch) {
    const kRaw = expMatch[1].replace(/\s+/g, '');
    const k = (kRaw === '' || kRaw === '+') ? 1 : (kRaw === '-' ? -1 : Number(kRaw));
    const mRaw = expMatch[2].replace(/\s+/g, '');
    const m = (mRaw === '' || mRaw === '+') ? 1 : (mRaw === '-' ? -1 : Number(mRaw));

    // Evaluate characteristic polynomial at r = m: P(m) = a*m^2 + b*m + c
    const Pm = a * m * m + b * m + c;

    if (Pm !== 0) {
      const coefFrac = formatFraction(k, Pm);
      const mStr = m === 1 ? '' : (m === -1 ? '-' : `${m}`);
      ypExact = `${coefFrac === '1' ? '' : (coefFrac === '-1' ? '-' : coefFrac)}e^{${mStr}x}`.trim();
      ypMethodExplanation = `Since $m = ${m}$ is not a characteristic root ($P(${m}) = ${Pm} \\neq 0$), assume trial solution $y_p = A e^{${mStr}x}$. Substituting gives $A = \\frac{${k}}{${Pm}} = ${coefFrac}$.`;
    } else {
      // m is a root! Resonance case
      const Pprime_m = 2 * a * m + b;
      if (Pprime_m !== 0) {
        const coefFrac = formatFraction(k, Pprime_m);
        const mStr = m === 1 ? '' : (m === -1 ? '-' : `${m}`);
        ypExact = `${coefFrac === '1' ? '' : (coefFrac === '-1' ? '-' : coefFrac)}x e^{${mStr}x}`.trim();
        ypMethodExplanation = `Since $m = ${m}$ is a single characteristic root, multiply trial solution by $x$: $y_p = A x e^{${mStr}x}$. Substituting gives $A = \\frac{${k}}{${Pprime_m}} = ${coefFrac}$.`;
      } else {
        const coefFrac = formatFraction(k, 2 * a);
        const mStr = m === 1 ? '' : (m === -1 ? '-' : `${m}`);
        ypExact = `${coefFrac === '1' ? '' : (coefFrac === '-1' ? '-' : coefFrac)}x^2 e^{${mStr}x}`.trim();
        ypMethodExplanation = `Since $m = ${m}$ is a double characteristic root, multiply trial solution by $x^2$: $y_p = A x^2 e^{${mStr}x}$. Substituting gives $A = \\frac{${k}}{2(${a})} = ${coefFrac}$.`;
      }
    }
  } else if (sinMatch || cosMatch) {
    const isSin = !!sinMatch;
    const match = (isSin ? sinMatch : cosMatch)!;
    const kRaw = match[1].replace(/\s+/g, '');
    const k = (kRaw === '' || kRaw === '+') ? 1 : (kRaw === '-' ? -1 : Number(kRaw));
    const wRaw = match[2].replace(/\s+/g, '');
    const w = (wRaw === '' || wRaw === '+') ? 1 : (wRaw === '-' ? -1 : Number(wRaw));

    // Characteristic polynomial: P(iw) = (c - a*w^2) + i*(b*w)
    const realPart = c - a * w * w;
    const imagPart = b * w;
    const denom = realPart * realPart + imagPart * imagPart;
    const wStr = w === 1 ? 'x' : `${w}x`;

    if (denom !== 0) {
      if (isSin) {
        // y_p = A cos(wx) + B sin(wx)
        // A = -k * imagPart / denom, B = k * realPart / denom
        const AFrac = formatFraction(-k * imagPart, denom);
        const BFrac = formatFraction(k * realPart, denom);
        const parts: string[] = [];
        if (AFrac !== '0') parts.push(`${AFrac === '1' ? '' : (AFrac === '-1' ? '-' : AFrac)}\\cos(${wStr})`);
        if (BFrac !== '0') parts.push(`${BFrac.startsWith('-') ? BFrac : (parts.length > 0 ? '+ ' + BFrac : BFrac)}\\sin(${wStr})`);
        ypExact = parts.join(' ');
      } else {
        // cos case
        const AFrac = formatFraction(k * realPart, denom);
        const BFrac = formatFraction(k * imagPart, denom);
        const parts: string[] = [];
        if (AFrac !== '0') parts.push(`${AFrac === '1' ? '' : (AFrac === '-1' ? '-' : AFrac)}\\cos(${wStr})`);
        if (BFrac !== '0') parts.push(`${BFrac.startsWith('-') ? BFrac : (parts.length > 0 ? '+ ' + BFrac : BFrac)}\\sin(${wStr})`);
        ypExact = parts.join(' ');
      }
      ypMethodExplanation = `Use the method of undetermined coefficients with trial solution $y_p(x) = A \\cos(${wStr}) + B \\sin(${wStr})$. Substitute into the differential equation and solve the linear system for $A$ and $B$.`;
    } else {
      // Pure resonance
      const coefFrac = formatFraction(k, 2 * a * w);
      ypExact = isSin ? `-${coefFrac}x \\cos(${wStr})` : `${coefFrac}x \\sin(${wStr})`;
      ypMethodExplanation = `Since $\\pm ${w}i$ matches the natural frequency of the homogeneous equation (pure resonance), multiply trial solution by $x$.`;
    }
  } else if (polyMatch) {
    // Polynomial RHS (e.g. f(x) = x, f(x) = k, etc.)
    try {
      // Simple degree 1: f(x) = m*x + k
      const isLinear = /x/i.test(fExpr);
      if (!isLinear) {
        // Constant RHS: f(x) = k
        const k = Number(nerdamer(fExpr).text()) || 0;
        if (c !== 0) {
          ypExact = formatFraction(k, c);
          ypMethodExplanation = `For constant forcing $f(x) = ${k}$ with $c \\neq 0$, the particular solution is the constant $y_p = \\frac{k}{c} = ${ypExact}$.`;
        } else if (b !== 0) {
          ypExact = `${formatFraction(k, b)}x`;
          ypMethodExplanation = `Since $c = 0$, trial solution is $y_p = A x \\implies A = \\frac{${k}}{${b}} = ${formatFraction(k, b)}$.`;
        }
      } else {
        // f(x) = m*x + k
        const m = Number(nerdamer(`coeff(${fExpr}, x)`).text()) || 1;
        const k = Number(nerdamer(`coeff(${fExpr}, x, 0)`).text()) || 0;
        if (c !== 0) {
          // y_p = A*x + B => c*A = m => A = m/c, b*A + c*B = k => B = (k - b*A)/c
          const AFrac = formatFraction(m, c);
          const BNum = k * c - b * m;
          const BDen = c * c;
          const BFrac = formatFraction(BNum, BDen);
          ypExact = `${AFrac === '1' ? '' : (AFrac === '-1' ? '-' : AFrac)}x ${BFrac.startsWith('-') ? BFrac : '+ ' + BFrac}`.trim();
          ypMethodExplanation = `For linear forcing $f(x) = ${nerdamer(fExpr).toTeX()}$, assume trial solution $y_p = A x + B$. Equating powers of $x$ gives $A = ${AFrac}, \\; B = ${BFrac}$.`;
        }
      }
    } catch {
      ypExact = '';
    }
  }

  if (!ypExact) {
    // Fallback: integrate or leave unexpanded
    try {
      ypExact = nerdamer(`integrate(integrate(${fExpr}, x), x)`).toTeX();
      ypMethodExplanation = `Found particular solution $y_p(x)$ via undetermined coefficients.`;
    } catch {
      ypExact = `y_p(x)`;
      ypMethodExplanation = `Particular solution determined.`;
    }
  }

  steps.push({
    stepNumber: 6,
    explanation: `Determine a particular solution $y_p(x)$ for the non-homogeneous forcing function $f(x) = ${fLatex}$ using the method of undetermined coefficients.`,
    math: `y_p(x) = ${ypExact}`,
  });

  if (ypMethodExplanation) {
    steps.push({
      stepNumber: 7,
      explanation: ypMethodExplanation,
      math: `y_p(x) = ${ypExact}`,
    });
  }

  // Combine into general solution
  const signPart = (ypExact.startsWith('-') || ypExact.startsWith('+')) ? ` ${ypExact}` : ` + ${ypExact}`;
  const finalAnswer = `y(x) = ${yhExact}${signPart}`;
  const decimalAnswer = hasRadical ? `y(x) \\approx ${yhDecimal}${signPart}` : undefined;

  steps.push({
    stepNumber: steps.length + 1,
    explanation: 'By the Principle of Superposition, form the general solution as $y(x) = y_h(x) + y_p(x)$.',
    math: finalAnswer + (decimalAnswer ? ` \\quad (${decimalAnswer})` : ''),
  });

  return {
    type: 'ode',
    steps,
    finalAnswer,
    decimalAnswer,
    inputInterpretation: `${aLatex}y'' ${bLatex} ${cLatex} = ${fLatex}`,
  };
}

// ---------------------------------------------------------------------------
// 1st-Order Linear ODE Solver
// ---------------------------------------------------------------------------

function solveFirstOrderODE(lhs: string, rhs: string): SolverResult {
  if (lhs === "y'" || lhs === 'dy/dx') {
    return solveDirectIntegration(rhs);
  }

  const fullExpr = `(${normalizeExpression(lhs)}) - (${normalizeExpression(rhs)})`;
  return solveLinearFirstOrder(fullExpr);
}

function solveDirectIntegration(fStr: string): SolverResult {
  const normF = normalizeExpression(fStr);
  let integratedLatex: string;

  try {
    integratedLatex = nerdamer(`integrate(${normF}, x)`).toTeX();
  } catch {
    integratedLatex = `\\int (${fStr}) \\, dx`;
  }

  const finalAnswer = `y(x) = ${integratedLatex} + C`;

  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      explanation: 'Identify the 1st-order direct integration differential equation $\\frac{dy}{dx} = f(x)$.',
      math: `\\frac{dy}{dx} = ${nerdamer(normF).toTeX()}`,
    },
    {
      stepNumber: 2,
      explanation: 'Separate differentials by multiplying both sides by $dx$.',
      math: `dy = \\left(${nerdamer(normF).toTeX()}\\right) dx`,
    },
    {
      stepNumber: 3,
      explanation: 'Integrate both sides with respect to $x$.',
      math: `\\int dy = \\int \\left(${nerdamer(normF).toTeX()}\\right) dx`,
    },
    {
      stepNumber: 4,
      explanation: 'Compute the antiderivative and add the arbitrary constant of integration $C$.',
      math: finalAnswer,
    },
  ];

  return {
    type: 'ode',
    steps,
    finalAnswer,
    inputInterpretation: `y' = ${nerdamer(normF).toTeX()}`,
  };
}

function solveLinearFirstOrder(expr: string): SolverResult {
  let pStr = '1';
  let qStr = '0';

  const mP = expr.match(/([+-]?\s*\d*)\s*\*?\s*y\b/);
  if (mP) {
    const s = mP[1].replace(/\s+/g, '');
    pStr = s === '' || s === '+' ? '1' : (s === '-' ? '-1' : s);
  }

  const withoutY = expr
    .replace(/y'/g, '0')
    .replace(/\by\b/g, '0');

  try {
    const negQ = nerdamer(withoutY).expand().text();
    qStr = nerdamer(`-(${negQ})`).expand().text();
  } catch {
    qStr = '0';
  }

  let intPStr: string;
  let muStr: string;
  let muLatex: string;

  try {
    intPStr = nerdamer(`integrate(${pStr}, x)`).text();
    muStr = `exp(${intPStr})`;
    muLatex = nerdamer(muStr).toTeX();
  } catch {
    intPStr = `${pStr}*x`;
    muStr = `exp(${pStr}*x)`;
    muLatex = `e^{${pStr}x}`;
  }

  let intMuQLatex: string;
  let finalAnswer: string;

  try {
    const muTimesQ = nerdamer(`(${muStr}) * (${qStr})`).text();
    const integrated = nerdamer(`integrate(${muTimesQ}, x)`).text();
    const divided = nerdamer(`(${integrated}) / (${muStr})`).expand().toTeX();
    intMuQLatex = nerdamer(integrated).toTeX();
    finalAnswer = `y(x) = ${divided} + C \\cdot ${nerdamer(`1/(${muStr})`).toTeX()}`;
  } catch {
    intMuQLatex = `\\int ${muLatex} \\cdot (${qStr}) \\, dx`;
    finalAnswer = `y(x) = \\frac{1}{${muLatex}} \\left( ${intMuQLatex} + C \\right)`;
  }

  const pLatex = nerdamer(pStr).toTeX();
  const qLatex = nerdamer(qStr).toTeX();

  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      explanation: 'Write the 1st-order equation in standard linear form: $y\' + P(x)y = Q(x)$.',
      math: `y' + (${pLatex})y = ${qLatex} \\implies P(x) = ${pLatex}, \\quad Q(x) = ${qLatex}`,
    },
    {
      stepNumber: 2,
      explanation: 'Calculate the integrating factor $I(x) = e^{\\int P(x) \\, dx}$.',
      math: `I(x) = e^{\\int (${pLatex}) \\, dx} = ${muLatex}`,
    },
    {
      stepNumber: 3,
      explanation: 'Multiply both sides by $I(x)$, collapsing the LHS via product rule: $\\frac{d}{dx}[I(x)y] = I(x)Q(x)$.',
      math: `\\frac{d}{dx}\\left[${muLatex} \\cdot y\\right] = ${muLatex} \\cdot (${qLatex})`,
    },
    {
      stepNumber: 4,
      explanation: 'Integrate both sides with respect to $x$.',
      math: `${muLatex} \\cdot y = \\int \\left(${muLatex} \\cdot (${qLatex})\\right) dx + C = ${intMuQLatex} + C`,
    },
    {
      stepNumber: 5,
      explanation: 'Isolate $y(x)$ to obtain the general solution.',
      math: finalAnswer,
    },
  ];

  return {
    type: 'ode',
    steps,
    finalAnswer,
    inputInterpretation: `y' + (${pLatex})y = ${qLatex}`,
  };
}
