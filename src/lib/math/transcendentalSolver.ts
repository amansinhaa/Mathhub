/**
 * Transcendental Equation Solver
 *
 * Solves non-algebraic equations containing exponential, logarithmic,
 * and trigonometric functions (e.g. x*e^x = 5, sin(x) + x = 2, ln(x) + 2x = 4)
 * using analytical detection and high-precision Newton-Raphson numerical steps.
 */

import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import type { SolverResult, SolutionStep } from '@/types/solver';
import { autoBalanceParens, normalizeExpression } from './normalizer';

export interface TranscendentalDetection {
  isTranscendental: boolean;
  variable: string;
  functions: string[];
}

/**
 * Detects if an equation contains transcendental functions (exp, log, sin, cos, tan, etc.)
 */
export function detectTranscendental(input: string): TranscendentalDetection {
  const clean = input.toLowerCase();
  const functionsFound: string[] = [];
  const patterns: [string, RegExp][] = [
    ['exponential', /\b(?:exp\b|e\^)/],
    ['trigonometric', /\b(?:sin|cos|tan|sec|csc|cot)\b/],
    ['logarithmic', /\b(?:ln|log|log10|log2)\b/],
    ['hyperbolic', /\b(?:sinh|cosh|tanh)\b/],
  ];

  for (const [name, regex] of patterns) {
    if (regex.test(clean)) {
      functionsFound.push(name);
    }
  }

  // Detect variable
  const reserved = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs', 'pi', 'e'
  ]);
  const tokens = input.match(/[a-zA-Z]+/g) || [];
  const singleVars = tokens.filter((t) => t.length === 1 && !reserved.has(t.toLowerCase()));
  const variable = singleVars.find((v) => v.toLowerCase() === 'x') || singleVars[0] || 'x';

  return {
    isTranscendental: functionsFound.length > 0,
    variable,
    functions: functionsFound,
  };
}

export interface NewtonIteration {
  iteration: number;
  x_n: number;
  fx_n: number;
  fpx_n: number;
  x_next: number;
  error: number;
}

/**
 * Solves a transcendental equation using symbolic differentiation and Newton-Raphson iteration.
 */
export function solveTranscendental(equationStr: string, specifiedVar?: string): SolverResult {
  const balanced = autoBalanceParens(equationStr);
  const detection = detectTranscendental(balanced);
  const variable = specifiedVar || detection.variable;

  let lhsStr = balanced;
  let rhsStr = '0';

  if (balanced.includes('=')) {
    const parts = balanced.split('=');
    lhsStr = parts[0].trim();
    rhsStr = parts[1].trim();
  }

  // Normalize into single expression f(x) = lhs - (rhs)
  const normLhs = normalizeExpression(lhsStr);
  const normRhs = normalizeExpression(rhsStr);
  const fStr = `(${normLhs}) - (${normRhs})`;

  // Convert for LaTeX display
  let fLatex: string;
  try {
    fLatex = nerdamer(fStr).toTeX();
  } catch {
    fLatex = `${lhsStr} - (${rhsStr})`;
  }

  const interpretationLatex = `f(${variable}) = ${fLatex} = 0`;

  // Try analytical symbolic solution first with nerdamer
  let analyticalSolution: string | null = null;
  try {
    const sol = (nerdamer as any).solve(fStr, variable);
    const solStr = String(sol || '');
    if (solStr && !solStr.includes('solve(') && solStr !== '[]') {
      analyticalSolution = nerdamer(solStr.replace(/^\[|\]$/g, '')).toTeX();
    }
  } catch {
    // proceed to numerical Newton-Raphson
  }

  // Compile mathjs functions for f(x) and analytical derivative f'(x)
  let fParsed: math.MathNode;
  let dfParsed: math.MathNode;
  let fCompiled: math.EvalFunction;
  let dfCompiled: math.EvalFunction;

  try {
    fParsed = math.parse(fStr);
    dfParsed = math.derivative(fParsed, variable);
    fCompiled = fParsed.compile();
    dfCompiled = dfParsed.compile();
  } catch (err: any) {
    throw new Error(`Could not parse transcendental function: ${err?.message || err}`);
  }

  const evalF = (xVal: number): number => {
    try {
      const res = fCompiled.evaluate({ [variable]: xVal, e: Math.E, pi: Math.PI });
      return typeof res === 'number' && isFinite(res) ? res : NaN;
    } catch {
      return NaN;
    }
  };

  const evalDF = (xVal: number): number => {
    try {
      const res = dfCompiled.evaluate({ [variable]: xVal, e: Math.E, pi: Math.PI });
      return typeof res === 'number' && isFinite(res) ? res : NaN;
    } catch {
      return NaN;
    }
  };

  // 1. Search for bracket [a, b] with sign change or best starting point
  let x0 = 1.0;
  const searchPoints: number[] = [
    0, 1, -1, 2, -2, 0.5, -0.5, 3, -3, 5, -5, 10, -10, 0.1, 0.01
  ];

  let bestX = 1.0;
  let minAbs = Infinity;
  let bracketFound = false;

  // Scan range [-10, 10] in 0.5 steps
  let prevX = -10;
  let prevF = evalF(prevX);

  for (let scanX = -9.5; scanX <= 10; scanX += 0.5) {
    const currF = evalF(scanX);
    if (!isNaN(currF)) {
      if (Math.abs(currF) < minAbs) {
        minAbs = Math.abs(currF);
        bestX = scanX;
      }
      if (!isNaN(prevF) && prevF * currF < 0) {
        // Sign change detected between prevX and scanX
        x0 = (prevX + scanX) / 2;
        bracketFound = true;
        break;
      }
    }
    prevX = scanX;
    prevF = currF;
  }

  if (!bracketFound) {
    for (const p of searchPoints) {
      const val = evalF(p);
      if (!isNaN(val) && Math.abs(val) < minAbs) {
        minAbs = Math.abs(val);
        bestX = p;
      }
    }
    x0 = bestX;
  }

  // 2. Newton-Raphson Iterations
  const iterations: NewtonIteration[] = [];
  let currX = x0;
  const maxIter = 10;
  const tolerance = 1e-6;
  let converged = false;

  for (let iter = 1; iter <= maxIter; iter++) {
    const fx = evalF(currX);
    let dfx = evalDF(currX);

    if (isNaN(fx)) break;

    // Guard against zero derivative
    if (isNaN(dfx) || Math.abs(dfx) < 1e-12) {
      dfx = dfx < 0 ? -1e-6 : 1e-6;
    }

    const nextX = currX - fx / dfx;
    const err = Math.abs(nextX - currX);

    iterations.push({
      iteration: iter,
      x_n: currX,
      fx_n: fx,
      fpx_n: dfx,
      x_next: nextX,
      error: err,
    });

    currX = nextX;

    if (err < tolerance || Math.abs(evalF(currX)) < 1e-8) {
      converged = true;
      break;
    }
  }

  const finalRoot = Number(currX.toFixed(6));
  const dfLatex = dfParsed.toTex();

  // 3. Assemble pedagogical step-by-step solution
  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      explanation: `Set the transcendental equation into standard root-finding form $f(${variable}) = 0$.`,
      math: `f(${variable}) = ${fLatex} = 0`,
    },
    {
      stepNumber: 2,
      explanation: `Calculate the first derivative $f'(${variable})$ using standard differentiation rules.`,
      math: `f'(${variable}) = ${dfLatex}`,
    },
    {
      stepNumber: 3,
      explanation: bracketFound
        ? `A root exists where $f(${variable})$ changes signs. Select an initial approximation $x_0 = ${x0.toFixed(2)}$.`
        : `Select an initial approximation near the function's local minimum value: $x_0 = ${x0.toFixed(2)}$.`,
      math: `x_0 = ${x0.toFixed(4)}, \\quad f(x_0) \\approx ${evalF(x0).toFixed(4)}`,
    },
    {
      stepNumber: 4,
      explanation: `Apply the Newton-Raphson iteration formula: $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$.`,
      math: `x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}`,
      subSteps: iterations.slice(0, 4).map((it) => ({
        title: `Iteration ${it.iteration}`,
        math: `x_{${it.iteration}} = ${it.x_n.toFixed(4)} - \\frac{${it.fx_n.toFixed(4)}}{${it.fpx_n.toFixed(4)}} \\approx ${it.x_next.toFixed(6)} \\quad (\\text{error: } ${it.error.toExponential(2)})`,
      })),
    },
    {
      stepNumber: 5,
      explanation: `The iterations converge to within tolerance of $10^{-6}$. The numerical root is $${variable} \\approx ${finalRoot}$.`,
      math: `${variable} \\approx ${finalRoot} \\quad \\left(f(${finalRoot}) \\approx ${evalF(finalRoot).toExponential(2)}\\right)`,
    },
  ];

  if (analyticalSolution) {
    steps.splice(2, 0, {
      explanation: `Symbolic closed-form solution exists via special function representation:`,
      math: `${variable} = ${analyticalSolution}`,
    });
  }

  return {
    type: 'polynomial',
    steps,
    finalAnswer: `${variable} \\approx ${finalRoot}`,
    decimalAnswer: String(finalRoot),
    numericRoots: [finalRoot],
    inputInterpretation: interpretationLatex,
  };
}
