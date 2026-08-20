import { SolverResult } from '@/types/solver';
import {
  generateQuadraticSteps,
  generateLinearSteps,
  generateCubicSteps,
  generateHigherOrderSteps,
  generateSystemSteps,
  generateInequalitySteps,
} from './stepGenerator';
import { evaluate } from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import 'nerdamer/Solve';
import { normalizeExpression } from './normalizer';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Detect the primary variable from an expression string. */
function detectVariable(expr: string): string {
  // Match variable-like tokens that are NOT math function names or constants
  const reserved = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'log', 'ln', 'exp', 'sqrt', 'abs', 'ceil', 'floor', 'round', 'sign',
    'pi', 'PI',
  ]);

  const tokens = expr.match(/[a-zA-Z]+/g) || [];
  for (const tok of tokens) {
    if (tok.length === 1 && tok !== 'e' && tok !== 'i') return tok;
  }
  for (const tok of tokens) {
    if (!reserved.has(tok) && tok !== 'e' && tok !== 'i') return tok;
  }
  return 'x';
}

/** Evaluate f(variable = value) safely, returning NaN on error. */
function evalAt(expr: string, variable: string, value: number): number {
  try {
    return Number(evaluate(expr, { [variable]: value }));
  } catch {
    return NaN;
  }
}

/** Newton-Raphson root polishing: given approx root, refine it. */
function newtonPolish(
  expr: string,
  variable: string,
  guess: number,
  iterations: number = 20
): number {
  let x = guess;
  const h = 1e-8;
  for (let i = 0; i < iterations; i++) {
    const fx = evalAt(expr, variable, x);
    if (Math.abs(fx) < 1e-14) break;
    const fxh = evalAt(expr, variable, x + h);
    const deriv = (fxh - fx) / h;
    if (Math.abs(deriv) < 1e-15) break;
    x = x - fx / deriv;
  }
  return x;
}

/** Factors of a positive integer (up to cap). */
function getFactors(n: number, cap: number = 200): number[] {
  n = Math.abs(Math.round(n));
  if (n === 0) return [0];
  const factors: number[] = [];
  for (let i = 1; i <= Math.min(n, cap); i++) {
    if (n % i === 0) factors.push(i);
  }
  return factors;
}

/** GCD of two integers. */
function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

// ─── Coefficient Extraction ─────────────────────────────────────────────────

/**
 * Extract polynomial coefficients by sampling.
 * Returns { coeffs: [leading, ..., constant], degree }.
 * Uses the finite difference method to determine degree and coefficients.
 */
function extractCoefficients(
  expr: string,
  variable: string
): { degree: number; coeffs: number[] } | null {
  // Sample at points 0, 1, 2, 3, 4, 5 to determine polynomial coefficients
  const vals: number[] = [];
  for (let i = 0; i <= 5; i++) {
    const v = evalAt(expr, variable, i);
    if (isNaN(v) || !isFinite(v)) return null;
    vals.push(v);
  }

  // Finite differences to determine degree
  // d0 = vals
  // d1[i] = d0[i+1] - d0[i]
  // d2[i] = d1[i+1] - d1[i], etc.
  // If d_k is constant, degree = k
  const diffs: number[][] = [vals.slice()];
  for (let k = 1; k <= 5; k++) {
    const prev = diffs[k - 1];
    const next: number[] = [];
    for (let i = 0; i < prev.length - 1; i++) {
      next.push(prev[i + 1] - prev[i]);
    }
    diffs.push(next);
  }

  // Find the degree: the first k where all d_k values are ~equal
  let degree = 0;
  for (let k = 0; k <= 5; k++) {
    const row = diffs[k];
    const allSame = row.every((v) => Math.abs(v - row[0]) < 1e-4);
    if (allSame) {
      degree = k;
      break;
    }
    if (k === 5) degree = 5; // cap
  }

  if (degree === 0) {
    // Constant — not a polynomial equation
    return { degree: 0, coeffs: [vals[0]] };
  }

  // Extract coefficients using the leading finite difference
  // For a degree-n polynomial, the n-th finite difference = n! * a_n
  // Then reconstruct lower coefficients from the sampled values.

  // Use Newton's forward difference formula:
  // f(x) = Σ C(x, k) * Δ^k f(0)
  // But we want standard coefficients. Easier: use a Vandermonde solve for
  // the known degree.

  // Build Vandermonde system for degree d: f(i) = a_d * i^d + ... + a_0
  const n = degree;
  const points = n + 1;
  // Use first (n+1) values
  const A: number[][] = [];
  for (let i = 0; i < points; i++) {
    const row: number[] = [];
    for (let j = n; j >= 0; j--) {
      row.push(Math.pow(i, j));
    }
    A.push(row);
  }
  const b = vals.slice(0, points);

  // Gaussian elimination
  const aug = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < points; col++) {
    // Pivot
    let maxRow = col;
    for (let row = col + 1; row < points; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    if (Math.abs(aug[col][col]) < 1e-14) continue;

    for (let row = col + 1; row < points; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= points; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  // Back-substitute
  const coeffs = new Array(points).fill(0);
  for (let row = points - 1; row >= 0; row--) {
    let sum = aug[row][points];
    for (let col = row + 1; col < points; col++) {
      sum -= aug[row][col] * coeffs[col];
    }
    coeffs[row] = sum / aug[row][row];
  }

  // Verify: check that the polynomial matches at an extra point not used in fitting
  const checkVal = evalAt(expr, variable, points);
  let predicted = 0;
  for (let j = 0; j <= n; j++) {
    predicted += coeffs[j] * Math.pow(points, n - j);
  }
  if (Math.abs(checkVal - predicted) > Math.max(1, Math.abs(checkVal)) * 1e-3) {
    return null; // Not actually a polynomial of this degree
  }

  // Round near-integer coefficients
  const rounded = coeffs.map((c) => {
    const r = Math.round(c);
    return Math.abs(c - r) < 1e-6 ? r : Number(c.toFixed(6));
  });

  return { degree: n, coeffs: rounded };
}

// ─── Cardano Cubic Solver ───────────────────────────────────────────────────

function solveCubicCardano(
  a: number,
  b: number,
  c: number,
  d: number
): { real: number[]; complex: { re: number; im: number }[] } {
  const p = (3 * a * c - b * b) / (3 * a * a);
  const q =
    (2 * Math.pow(b, 3) - 9 * a * b * c + 27 * a * a * d) / (27 * Math.pow(a, 3));
  const discriminant = (q * q) / 4 + Math.pow(p, 3) / 27;
  const shift = -b / (3 * a);

  if (discriminant > 1e-10) {
    const sqrtDisc = Math.sqrt(discriminant);
    const uVal = -q / 2 + sqrtDisc;
    const vVal = -q / 2 - sqrtDisc;

    const u = uVal >= 0 ? Math.cbrt(uVal) : -Math.cbrt(-uVal);
    const v = vVal >= 0 ? Math.cbrt(vVal) : -Math.cbrt(-vVal);

    let r1 = u + v + shift;
    // Polish with Newton's method
    const polyStr = `${a}*x^3 + ${b}*x^2 + ${c}*x + ${d}`;
    r1 = newtonPolish(polyStr, 'x', r1);
    // Snap to integer if very close
    if (Math.abs(r1 - Math.round(r1)) < 1e-8) r1 = Math.round(r1);

    const realPart = -(u + v) / 2 + shift;
    const imagPart = (Math.sqrt(3) * Math.abs(u - v)) / 2;

    return {
      real: [r1],
      complex:
        imagPart > 1e-6
          ? [{ re: Number(realPart.toFixed(6)), im: Number(imagPart.toFixed(6)) }]
          : [],
    };
  } else if (Math.abs(discriminant) <= 1e-10) {
    const u = q >= 0 ? -Math.cbrt(q / 2) : Math.cbrt(-q / 2);
    let r1 = 2 * u + shift;
    let r2 = -u + shift;
    if (Math.abs(r1 - Math.round(r1)) < 1e-8) r1 = Math.round(r1);
    if (Math.abs(r2 - Math.round(r2)) < 1e-8) r2 = Math.round(r2);
    return { real: [r1, r2], complex: [] };
  } else {
    const r = Math.sqrt(-Math.pow(p, 3) / 27);
    const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
    const factor = 2 * Math.sqrt(-p / 3);

    let r1 = factor * Math.cos(phi / 3) + shift;
    let r2 = factor * Math.cos((phi + 2 * Math.PI) / 3) + shift;
    let r3 = factor * Math.cos((phi + 4 * Math.PI) / 3) + shift;

    // Polish each root
    const polyStr = `${a}*x^3 + ${b}*x^2 + ${c}*x + ${d}`;
    [r1, r2, r3] = [r1, r2, r3].map((r) => {
      const polished = newtonPolish(polyStr, 'x', r);
      return Math.abs(polished - Math.round(polished)) < 1e-8
        ? Math.round(polished)
        : Number(polished.toFixed(6));
    });

    return { real: [r1, r2, r3], complex: [] };
  }
}

// ─── Main Solver Functions ──────────────────────────────────────────────────

export function solvePolynomial(equation: string): SolverResult {
  let cleanEq = equation.trim();
  // Normalize Unicode superscripts (x², x³), math symbols (√, π)
  cleanEq = normalizeExpression(cleanEq);
  if (!cleanEq) {
    return {
      type: 'polynomial',
      steps: [
        {
          stepNumber: 1,
          explanation: 'Please enter a valid polynomial equation.',
          math: '\\text{No equation entered}',
        },
      ],
      finalAnswer: '\\text{Empty equation}',
    };
  }

  const variable = detectVariable(cleanEq);

  // Normalize to "LHS - RHS" form
  let [lhs, rhs] = cleanEq.split('=');
  let standardExpr = '';
  if (rhs !== undefined && rhs.trim() !== '') {
    standardExpr = `(${lhs.trim()}) - (${rhs.trim()})`;
  } else {
    standardExpr = lhs.trim();
  }

  // Extract polynomial coefficients by sampling
  const poly = extractCoefficients(standardExpr, variable);

  if (poly && poly.degree >= 1) {
    const { degree, coeffs } = poly;

    if (degree === 1) {
      // Linear: a*x + b = 0
      const [a, b] = coeffs;
      const steps = generateLinearSteps(a, b, variable);
      return {
        type: 'polynomial',
        steps,
        finalAnswer: steps[steps.length - 1]?.math || `${variable} = 0`,
      };
    }

    if (degree === 2) {
      // Quadratic: a*x^2 + b*x + c = 0
      const [a, b, c] = coeffs;
      const steps = generateQuadraticSteps(a, b, c, variable);
      return {
        type: 'polynomial',
        steps,
        finalAnswer: steps[steps.length - 1]?.math || `${variable} = 0`,
      };
    }

    if (degree === 3) {
      // Cubic: a*x^3 + b*x^2 + c*x + d = 0
      const [a, b, c, d] = coeffs;
      const roots = solveCubicCardano(a, b, c, d);
      const steps = generateCubicSteps(a, b, c, d, roots, variable);
      return {
        type: 'polynomial',
        steps,
        finalAnswer: steps[steps.length - 1]?.math || `${variable} = 0`,
      };
    }

    // Degree 4+ — use Nerdamer symbolic solver
    try {
      const solutions = nerdamer.solve(standardExpr, variable);
      const solStr = solutions.toString();
      const cleanSols = solStr
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const steps = generateHigherOrderSteps(standardExpr, cleanSols, variable);
      return {
        type: 'polynomial',
        steps,
        finalAnswer: steps[steps.length - 1]?.math || cleanSols.join(', '),
      };
    } catch {
      // fall through to nerdamer fallback below
    }
  }

  // Fallback: try Nerdamer for general/non-polynomial equations
  try {
    const solutions = nerdamer.solve(standardExpr, variable);
    const solStr = solutions.toString();
    const cleanSols = solStr
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (cleanSols.length > 0) {
      const steps = generateHigherOrderSteps(standardExpr, cleanSols, variable);
      return {
        type: 'polynomial',
        steps,
        finalAnswer: steps[steps.length - 1]?.math || cleanSols.join(', '),
      };
    }
  } catch {
    // fall through
  }

  return {
    type: 'polynomial',
    steps: [
      {
        stepNumber: 1,
        explanation: `Could not solve the equation for variable $${variable}$.`,
        math: '\\text{No algebraic solution found}',
      },
    ],
    finalAnswer: '\\text{No solution found}',
  };
}

export function solveSystem(equations: string[], variables: string[]): SolverResult {
  const vars = variables.length > 0 ? variables : ['x', 'y'];
  const n = Math.min(equations.length, vars.length);

  const matA: number[][] = [];
  const vecB: number[] = [];

  for (let i = 0; i < n; i++) {
    const eq = equations[i] || '';
    const [lhs, rhs] = eq.split('=');
    const bVal = rhs !== undefined ? parseFloat(rhs.trim()) || 0 : 0;
    vecB.push(bVal);

    const rowCoeffs: number[] = [];
    for (const v of vars) {
      const scope0: Record<string, number> = {};
      const scope1: Record<string, number> = {};
      vars.forEach((x) => {
        scope0[x] = 0;
        scope1[x] = x === v ? 1 : 0;
      });

      try {
        const val0 = evaluate(lhs, scope0);
        const val1 = evaluate(lhs, scope1);
        rowCoeffs.push(Number(val1 - val0) || 0);
      } catch {
        rowCoeffs.push(0);
      }
    }
    matA.push(rowCoeffs);
  }

  const steps = generateSystemSteps(matA, vecB, vars);

  // 2x2 Cramer's rule
  if (n === 2) {
    const det = matA[0][0] * matA[1][1] - matA[0][1] * matA[1][0];
    if (Math.abs(det) > 1e-9) {
      const x = (vecB[0] * matA[1][1] - matA[0][1] * vecB[1]) / det;
      const y = (matA[0][0] * vecB[1] - vecB[0] * matA[1][0]) / det;
      const fmt = (v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(4));
      return {
        type: 'system',
        steps,
        finalAnswer: `${vars[0]} = ${fmt(x)}, \\quad ${vars[1]} = ${fmt(y)}`,
      };
    }
  }

  // 3x3 and 4x4: Gaussian elimination
  if (n >= 3) {
    // Augmented matrix
    const aug = matA.map((row, i) => [...row.slice(0, n), vecB[i]]);

    // Forward elimination
    for (let col = 0; col < n; col++) {
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
      }
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
      if (Math.abs(aug[col][col]) < 1e-12) continue;
      for (let row = col + 1; row < n; row++) {
        const factor = aug[row][col] / aug[col][col];
        for (let j = col; j <= n; j++) {
          aug[row][j] -= factor * aug[col][j];
        }
      }
    }

    // Back substitution
    const sol = new Array(n).fill(0);
    for (let row = n - 1; row >= 0; row--) {
      let sum = aug[row][n];
      for (let col = row + 1; col < n; col++) {
        sum -= aug[row][col] * sol[col];
      }
      sol[row] = Math.abs(aug[row][row]) > 1e-12 ? sum / aug[row][row] : 0;
    }

    const fmt = (v: number) => {
      const r = Math.round(v);
      return Math.abs(v - r) < 1e-8 ? r.toString() : v.toFixed(4);
    };
    const answer = vars.map((v, i) => `${v} = ${fmt(sol[i])}`).join(', \\quad ');
    return { type: 'system', steps, finalAnswer: answer };
  }

  return {
    type: 'system',
    steps,
    finalAnswer: steps[steps.length - 1]?.math || 'No unique solution',
  };
}

export function solveInequality(inequality: string): SolverResult {
  let rel = '>';
  if (inequality.includes('>=')) rel = '>=';
  else if (inequality.includes('<=')) rel = '<=';
  else if (inequality.includes('>')) rel = '>';
  else if (inequality.includes('<')) rel = '<';

  const [lhs, rhs] = inequality.split(rel);
  const diffExpr = `(${lhs}) - (${rhs || 0})`;
  const variable = detectVariable(diffExpr);

  try {
    const poly = extractCoefficients(diffExpr, variable);

    if (poly && poly.degree === 1) {
      const [a, b] = poly.coeffs;
      const root = -b / a;
      const sign = a > 0 ? rel : rel === '>' ? '<' : rel === '<' ? '>' : rel === '>=' ? '<=' : '>=';
      const latex = `${variable} ${sign} ${Number.isInteger(root) ? root : root.toFixed(4)}`;
      return {
        type: 'inequality',
        steps: [
          {
            stepNumber: 1,
            explanation: `Rearrange to isolate $${variable}$.`,
            math: `${a}${variable} ${rel} ${-b}`,
          },
          {
            stepNumber: 2,
            explanation:
              a < 0
                ? 'Divide by a negative coefficient — this flips the inequality sign.'
                : 'Divide both sides by the coefficient.',
            math: latex,
          },
        ],
        finalAnswer: latex,
      };
    }

    if (poly && poly.degree === 2) {
      const [a, b, c] = poly.coeffs;
      const delta = b * b - 4 * a * c;
      if (delta >= 0) {
        const r1 = (-b - Math.sqrt(delta)) / (2 * a);
        const r2 = (-b + Math.sqrt(delta)) / (2 * a);
        const fmt = (v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(4));
        const openOrClosed = rel.includes('=') ? ['\\leq', '\\geq'] : ['<', '>'];

        let latex: string;
        if (a > 0) {
          // Parabola opens up: f(x) > 0 when x < r1 or x > r2
          if (rel === '>' || rel === '>=') {
            latex = `${variable} ${openOrClosed[0]} ${fmt(r1)} \\quad \\text{or} \\quad ${variable} ${openOrClosed[1]} ${fmt(r2)}`;
          } else {
            latex = `${fmt(r1)} ${openOrClosed[1]} ${variable} ${openOrClosed[0]} ${fmt(r2)}`;
          }
        } else {
          if (rel === '>' || rel === '>=') {
            latex = `${fmt(r1)} ${openOrClosed[1]} ${variable} ${openOrClosed[0]} ${fmt(r2)}`;
          } else {
            latex = `${variable} ${openOrClosed[0]} ${fmt(r1)} \\quad \\text{or} \\quad ${variable} ${openOrClosed[1]} ${fmt(r2)}`;
          }
        }

        return {
          type: 'inequality',
          steps: [
            {
              stepNumber: 1,
              explanation: 'Find the roots of the corresponding equation.',
              math: `${variable}_1 = ${fmt(r1)}, \\quad ${variable}_2 = ${fmt(r2)}`,
            },
            {
              stepNumber: 2,
              explanation: 'Determine the solution intervals by testing sign in each region.',
              math: latex,
            },
          ],
          finalAnswer: latex,
        };
      }
    }

    const steps = generateInequalitySteps(poly?.coeffs || [1, 0, 0], 'general');
    return {
      type: 'inequality',
      steps,
      finalAnswer: steps[steps.length - 1]?.math || `${variable} \\in \\mathbb{R}`,
    };
  } catch {
    return {
      type: 'inequality',
      steps: [
        {
          stepNumber: 1,
          explanation: 'Could not automatically evaluate the inequality.',
          math: '\\text{Error evaluating inequality}',
        },
      ],
      finalAnswer: '\\text{Undefined}',
    };
  }
}

export function solveSymbolic(equation: string, solveFor: string): SolverResult {
  const target = (solveFor || 'x').trim();
  const [lhs, rhs] = equation.includes('=') ? equation.split('=') : [equation, '0'];
  const standardExpr = `(${lhs}) - (${rhs})`;

  try {
    const sol = nerdamer.solve(standardExpr, target).toString();
    const cleanSol = sol.replace(/^\[|\]$/g, '');

    return {
      type: 'symbolic',
      steps: [
        {
          stepNumber: 1,
          explanation: `Rearrange and set the equation to zero: $f(${target}) = 0$.`,
          math: `${lhs.trim()} = ${rhs.trim()}`,
        },
        {
          stepNumber: 2,
          explanation: `Isolate $${target}$ algebraically.`,
          math: `${target} = ${cleanSol}`,
        },
      ],
      finalAnswer: `${target} = ${cleanSol}`,
    };
  } catch {
    return {
      type: 'symbolic',
      steps: [
        {
          stepNumber: 1,
          explanation: `Unable to symbolically isolate $${target}$.`,
          math: `\\text{Original: } ${equation}`,
        },
      ],
      finalAnswer: `${target} = \\text{could not solve}`,
    };
  }
}
