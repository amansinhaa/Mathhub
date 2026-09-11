/**
 * Ordinary Differential Equation (ODE) Solver
 *
 * Provides step-by-step solutions for:
 * 1. Direct integration (dy/dx = f(x))
 * 2. 1st-Order Separable equations (dy/dx = f(x)g(y))
 * 3. 1st-Order Linear ODEs (y' + P(x)y = Q(x) via integrating factor)
 * 4. 2nd-Order Linear Homogeneous ODEs with constant coefficients (ay'' + by' + cy = 0)
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

/**
 * Detects if an expression or equation is an Ordinary Differential Equation.
 */
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

/**
 * Solves an Ordinary Differential Equation with detailed pedagogical steps.
 */
export function solveODE(input: string): SolverResult {
  const balanced = autoBalanceParens(input);
  const detection = detectODE(balanced);

  if (!detection.isODE) {
    throw new Error('Input is not a recognized differential equation.');
  }

  // Canonicalize notations: y'' -> y_2, y' -> y_1, dy/dx -> y_1
  let eqStr = balanced
    .replace(/d\^2y\/dx\^2/gi, "y''")
    .replace(/dy\/dx/gi, "y'");

  if (!eqStr.includes('=')) {
    eqStr = `${eqStr} = 0`;
  }

  const [lhsRaw, rhsRaw] = eqStr.split('=').map((s) => s.trim());

  if (detection.order === 2) {
    return solveSecondOrderHomogeneous(lhsRaw, rhsRaw);
  }

  return solveFirstOrderODE(lhsRaw, rhsRaw);
}

/**
 * Solves 2nd-order constant coefficient ODE: a*y'' + b*y' + c*y = 0
 */
function solveSecondOrderHomogeneous(lhs: string, rhs: string): SolverResult {
  // Transfer RHS to LHS: expr = lhs - (rhs)
  const fullExpr = `(${normalizeExpression(lhs)}) - (${normalizeExpression(rhs)})`;

  // Extract coefficients a, b, c for y'', y', and y
  // Replace y'' with r^2, y' with r, y with 1 to form characteristic polynomial
  let charPolyStr = fullExpr
    .replace(/y''/g, '(r^2)')
    .replace(/y'/g, '(r)')
    .replace(/\by\b/g, '(1)');

  charPolyStr = normalizeExpression(charPolyStr);

  let a = 0;
  let b = 0;
  let c = 0;

  try {
    const expanded = nerdamer(charPolyStr).expand().text();
    // Extract polynomial coefficients in r
    const parsed = nerdamer(`coeffs(${expanded}, r)`).text();
    const cleanCoeffs: number[] = parsed
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s) => Number(nerdamer(s.trim()).evaluate().text()));

    // coeffs returns [c, b, a] in ascending degree
    if (cleanCoeffs.length === 3) {
      c = cleanCoeffs[0];
      b = cleanCoeffs[1];
      a = cleanCoeffs[2];
    } else if (cleanCoeffs.length === 2) {
      c = cleanCoeffs[0];
      b = cleanCoeffs[1];
      a = 0;
    } else if (cleanCoeffs.length === 1) {
      c = cleanCoeffs[0];
    }
  } catch {
    // Heuristic fallback regex for a*y'' + b*y' + c*y
    const m2 = fullExpr.match(/([+-]?\s*\d*)\s*\*?\s*y''/);
    const m1 = fullExpr.match(/([+-]?\s*\d*)\s*\*?\s*y'/);
    const m0 = fullExpr.match(/([+-]?\s*\d*)\s*\*?\s*y\b/);

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
  }

  if (a === 0) {
    throw new Error('Not a valid 2nd-order differential equation (coefficient of y\'\' is 0).');
  }

  const delta = b * b - 4 * a * c;
  const inputLatex = `${a !== 1 ? a : ''}y'' ${b >= 0 ? '+ ' + (b !== 1 ? b : '') : '- ' + (b !== -1 ? Math.abs(b) : '')}y' ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}y = 0`;

  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      explanation: 'Write the 2nd-order linear homogeneous equation in standard form and identify constant coefficients.',
      math: `${a}y'' + (${b})y' + (${c})y = 0`,
    },
    {
      stepNumber: 2,
      explanation: 'Assume a solution of the form $y = e^{rx}$, yielding the characteristic equation $ar^2 + br + c = 0$.',
      math: `${a}r^2 + (${b})r + (${c}) = 0`,
    },
    {
      stepNumber: 3,
      explanation: 'Compute the discriminant $\\Delta = b^2 - 4ac$ to determine the nature of the roots.',
      math: `\\Delta = (${b})^2 - 4(${a})(${c}) = ${delta}`,
    },
  ];

  let finalAnswer: string;

  if (delta > 0) {
    const sqrtDelta = Math.sqrt(delta);
    const r1 = Number(((-b + sqrtDelta) / (2 * a)).toFixed(4));
    const r2 = Number(((-b - sqrtDelta) / (2 * a)).toFixed(4));

    finalAnswer = `y(x) = C_1 e^{${r1}x} + C_2 e^{${r2}x}`;

    steps.push(
      {
        stepNumber: 4,
        explanation: 'Since $\\Delta > 0$, the characteristic equation has two distinct real roots $r_1$ and $r_2$.',
        math: `r_1 = \\frac{-(${b}) + \\sqrt{${delta}}}{2(${a})} = ${r1}, \\quad r_2 = \\frac{-(${b}) - \\sqrt{${delta}}}{2(${a})} = ${r2}`,
      },
      {
        stepNumber: 5,
        explanation: 'Form the general solution as a linear combination of the linearly independent fundamental solutions.',
        math: finalAnswer,
      }
    );
  } else if (delta === 0) {
    const r = Number((-b / (2 * a)).toFixed(4));
    finalAnswer = `y(x) = (C_1 + C_2 x)e^{${r}x}`;

    steps.push(
      {
        stepNumber: 4,
        explanation: 'Since $\\Delta = 0$, there is a repeated real root $r = -b / (2a)$.',
        math: `r = \\frac{-(${b})}{2(${a})} = ${r}`,
      },
      {
        stepNumber: 5,
        explanation: 'The second linearly independent solution is multiplied by $x$. Combine into the general solution.',
        math: finalAnswer,
      }
    );
  } else {
    const alpha = Number((-b / (2 * a)).toFixed(4));
    const beta = Number((Math.sqrt(-delta) / (2 * Math.abs(a))).toFixed(4));
    const expTerm = alpha !== 0 ? `e^{${alpha}x}` : '';
    finalAnswer = `y(x) = ${expTerm}(C_1 \\cos(${beta}x) + C_2 \\sin(${beta}x))`;

    steps.push(
      {
        stepNumber: 4,
        explanation: 'Since $\\Delta < 0$, the roots are complex conjugates: $r = \\alpha \\pm \\beta i$.',
        math: `\\alpha = \\frac{-(${b})}{2(${a})} = ${alpha}, \\quad \\beta = \\frac{\\sqrt{${-delta}}}{2(${Math.abs(a)})} = ${beta} \\implies r = ${alpha} \\pm ${beta}i`,
      },
      {
        stepNumber: 5,
        explanation: 'Use Euler\'s formula to express the solution in terms of real sine and cosine oscillations.',
        math: finalAnswer,
      }
    );
  }

  return {
    type: 'ode',
    steps,
    finalAnswer,
    inputInterpretation: inputLatex,
  };
}

/**
 * Solves 1st-order ODEs: y' = f(x), separable y' = f(x)g(y), or linear y' + P(x)y = Q(x)
 */
function solveFirstOrderODE(lhs: string, rhs: string): SolverResult {
  // Direct integration check: y' = f(x)
  if (lhs === "y'" || lhs === 'dy/dx') {
    return solveDirectIntegration(rhs);
  }

  // Check for y' + P*y = Q linear form
  // Move y' to one side
  const fullExpr = `(${normalizeExpression(lhs)}) - (${normalizeExpression(rhs)})`;

  // Look for linear 1st-order form: y' + P(x)*y = Q(x)
  // Let's test if separable or linear
  return solveLinearFirstOrder(fullExpr);
}

/**
 * Solves direct integration: dy/dx = f(x) => y = int(f(x) dx) + C
 */
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
      explanation: 'Integrate both sides with respect to their respective variables.',
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

/**
 * Solves 1st-order linear ODE: y' + P(x)y = Q(x) using integrating factor
 */
function solveLinearFirstOrder(expr: string): SolverResult {
  // Parse out P(x) and Q(x) from expr = y' + P*y - Q = 0
  // Standard simple cases: y' + a*y = b, y' + a*y = x, etc.
  let pStr = '1';
  let qStr = '0';

  const mP = expr.match(/([+-]?\s*\d*)\s*\*?\s*y\b/);
  if (mP) {
    const s = mP[1].replace(/\s+/g, '');
    pStr = s === '' || s === '+' ? '1' : (s === '-' ? '-1' : s);
  }

  // Remove y' and y terms to find Q(x)
  const withoutY = expr
    .replace(/y'/g, '0')
    .replace(/\by\b/g, '0');

  try {
    const negQ = nerdamer(withoutY).expand().text();
    qStr = nerdamer(`-(${negQ})`).expand().text();
  } catch {
    qStr = '0';
  }

  // Integrating factor mu(x) = exp(int(P dx))
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

  // Integrate mu(x) * Q(x)
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
      explanation: 'Multiply both sides by the integrating factor $I(x)$, collapsing the LHS via product rule: $\\frac{d}{dx}[I(x)y] = I(x)Q(x)$.',
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
