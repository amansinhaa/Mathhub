import { SolverResult } from '@/types/solver';
import {
  generateLinearSteps,
  generateQuadraticSteps,
  generateCubicSteps,
  generateQuarticSteps,
  generateDegree5PlusSteps,
  generateHigherOrderSteps,
  generateSystemSteps,
  generateInequalitySteps,
  fmt,
  evalPoly,
} from './stepGenerator';
import { evaluate } from 'mathjs';
import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import 'nerdamer/Solve';
import { normalizeExpression } from './normalizer';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Detect the primary variable from an expression string. */
export function detectVariable(expr: string): string {
  const reserved = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'log', 'ln', 'exp', 'sqrt', 'abs', 'ceil', 'floor', 'round', 'sign',
    'pi', 'PI', 'e', 'i',
  ]);

  const tokens = expr.match(/[a-zA-Z]+/g) || [];
  for (const tok of tokens) {
    if (tok.length === 1 && !reserved.has(tok)) return tok;
  }
  for (const tok of tokens) {
    if (!reserved.has(tok)) return tok;
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

/** Newton-Raphson root polishing for high-precision real roots. */
function newtonPolish(
  coeffs: number[],
  guess: number,
  iterations: number = 25
): number {
  let x = guess;
  for (let i = 0; i < iterations; i++) {
    const fx = evalPoly(coeffs, x);
    if (Math.abs(fx) < 1e-13) break;
    let deriv = 0;
    const n = coeffs.length - 1;
    for (let j = 0; j < n; j++) {
      deriv = deriv * x + coeffs[j] * (n - j);
    }
    if (Math.abs(deriv) < 1e-15) break;
    x = x - fx / deriv;
  }
  return x;
}

// ─── Coefficient Extraction ─────────────────────────────────────────────────

/**
 * Extract polynomial coefficients for ANY degree n: [a_n, a_{n-1}, ..., a_0].
 * Combines nerdamer algebraic expansion with finite-difference sampling fallback.
 */
export function extractCoefficients(
  expr: string,
  variable: string
): { degree: number; coeffs: number[] } | null {
  // 1. Try nerdamer symbolic expansion and coefficient extraction
  try {
    const c = (nerdamer as any).coeffs(expr, variable);
    const str = c.toString();
    if (str.startsWith('[') && str.endsWith(']')) {
      const arr = str
        .slice(1, -1)
        .split(',')
        .map((s: string) => {
          const val = Number((nerdamer as any)(s.trim()).evaluate().text());
          return isNaN(val) ? 0 : val;
        });
      // nerdamer gives [a_0, a_1, ..., a_n] -> reverse to [a_n, ..., a_0]
      const coeffs = arr.reverse();
      // Remove leading zeros
      while (coeffs.length > 1 && Math.abs(coeffs[0]) < 1e-9) {
        coeffs.shift();
      }
      const degree = coeffs.length - 1;
      if (degree >= 1 && coeffs.every((num: number) => Number.isFinite(num) && !isNaN(num))) {
        return { degree, coeffs };
      }
    }
  } catch {
    // Continue to sampling fallback
  }

  // 2. Finite-Difference Sampling Fallback (up to degree 10)
  const maxSampleDeg = 10;
  const vals: number[] = [];
  for (let i = 0; i <= maxSampleDeg + 2; i++) {
    const v = evalAt(expr, variable, i);
    if (isNaN(v) || !isFinite(v)) return null;
    vals.push(v);
  }

  const diffs: number[][] = [vals.slice()];
  for (let k = 1; k <= maxSampleDeg + 1; k++) {
    const prev = diffs[k - 1];
    const next: number[] = [];
    for (let i = 0; i < prev.length - 1; i++) {
      next.push(prev[i + 1] - prev[i]);
    }
    diffs.push(next);
  }

  let degree = -1;
  for (let k = 1; k <= maxSampleDeg; k++) {
    const row = diffs[k];
    if (row.length >= 2 && row.every((v) => Math.abs(v - row[0]) < 1e-4)) {
      degree = k;
      break;
    }
  }

  if (degree <= 0) return null;

  // Solve Vandermonde system for polynomial coefficients
  const n = degree;
  const points = n + 1;
  const A: number[][] = [];
  for (let i = 0; i < points; i++) {
    const row: number[] = [];
    for (let j = n; j >= 0; j--) {
      row.push(Math.pow(i, j));
    }
    A.push(row);
  }
  const b = vals.slice(0, points);

  const aug = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < points; col++) {
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

  const coeffs = new Array(points).fill(0);
  for (let row = points - 1; row >= 0; row--) {
    let sum = aug[row][points];
    for (let col = row + 1; col < points; col++) {
      sum -= aug[row][col] * coeffs[col];
    }
    coeffs[row] = sum / aug[row][row];
  }

  // Verification at test point
  const testX = points + 1;
  const expectedVal = evalAt(expr, variable, testX);
  const actualVal = evalPoly(coeffs, testX);
  if (Math.abs(expectedVal - actualVal) > Math.max(1, Math.abs(expectedVal)) * 1e-3) {
    return null;
  }

  const rounded = coeffs.map((c) => {
    const r = Math.round(c);
    return Math.abs(c - r) < 1e-5 ? r : Number(c.toFixed(6));
  });

  return { degree: n, coeffs: rounded };
}

// ─── Numerical Polynomial Root Solver (Durand-Kerner & Companion Matrix) ─────

/**
 * Computes all roots (real and complex) of a polynomial P(x) = 0
 * using the Weierstrass / Durand-Kerner simultaneous root iteration with companion matrix fallback.
 */
export function solvePolynomialNumerical(coeffs: number[]): {
  real: number[];
  complex: { re: number; im: number }[];
} {
  const n = coeffs.length - 1;
  if (n <= 0) return { real: [], complex: [] };

  const a_n = coeffs[0];
  const p = coeffs.map((c) => c / a_n); // Monic: [1, p[1], ..., p[n]]

  // Complex arithmetic helper
  const add = (a: { re: number; im: number }, b: { re: number; im: number }) => ({
    re: a.re + b.re,
    im: a.im + b.im,
  });
  const sub = (a: { re: number; im: number }, b: { re: number; im: number }) => ({
    re: a.re - b.re,
    im: a.im - b.im,
  });
  const mul = (a: { re: number; im: number }, b: { re: number; im: number }) => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  });
  const div = (a: { re: number; im: number }, b: { re: number; im: number }) => {
    const denom = b.re * b.re + b.im * b.im || 1e-18;
    return {
      re: (a.re * b.re + a.im * b.im) / denom,
      im: (a.im * b.re - a.re * b.im) / denom,
    };
  };

  // Evaluate monic polynomial at complex point z
  const evalP = (z: { re: number; im: number }) => {
    let res = { re: p[0], im: 0 };
    for (let i = 1; i <= n; i++) {
      res = add(mul(res, z), { re: p[i], im: 0 });
    }
    return res;
  };

  // Initial approximations on Aberth radius circle with asymmetric angle
  const maxCoeff = Math.max(...p.slice(1).map(Math.abs));
  const radius = 1 + (maxCoeff || 1);
  let roots: { re: number; im: number }[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i + 0.38) / n;
    roots.push({
      re: Math.cos(angle) * (radius * 0.7 + 0.1 * i),
      im: Math.sin(angle) * (radius * 0.7 + 0.1 * i),
    });
  }

  // Durand-Kerner simultaneous iterations
  for (let iter = 0; iter < 120; iter++) {
    let maxChange = 0;
    for (let i = 0; i < n; i++) {
      const fz = evalP(roots[i]);
      let denom = { re: 1, im: 0 };
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          denom = mul(denom, sub(roots[i], roots[j]));
        }
      }
      const delta = div(fz, denom);
      roots[i] = sub(roots[i], delta);
      const mag = Math.hypot(delta.re, delta.im);
      if (mag > maxChange) maxChange = mag;
    }
    if (maxChange < 1e-12) break;
  }

  // Classify into real and complex roots
  const realRoots: number[] = [];
  const complexRoots: { re: number; im: number }[] = [];

  roots.forEach((r) => {
    if (Math.abs(r.im) < 1e-5) {
      let polished = newtonPolish(coeffs, r.re);
      if (Math.abs(polished - Math.round(polished)) < 1e-5) polished = Math.round(polished);
      realRoots.push(polished);
    } else {
      let re = Math.abs(r.re - Math.round(r.re)) < 1e-5 ? Math.round(r.re) : Number(r.re.toFixed(6));
      let im = Math.abs(r.im - Math.round(r.im)) < 1e-5 ? Math.round(r.im) : Number(r.im.toFixed(6));
      // Re-zero if near zero
      if (Math.abs(re) < 1e-6) re = 0;
      complexRoots.push({ re, im });
    }
  });

  // Group complex roots into conjugate pairs (p ± qi)
  const groupedComplex: { re: number; im: number }[] = [];
  const used = new Set<number>();
  for (let i = 0; i < complexRoots.length; i++) {
    if (used.has(i)) continue;
    const c1 = complexRoots[i];
    let foundPair = false;
    for (let j = i + 1; j < complexRoots.length; j++) {
      if (used.has(j)) continue;
      const c2 = complexRoots[j];
      if (Math.abs(c1.re - c2.re) < 1e-4 && Math.abs(Math.abs(c1.im) - Math.abs(c2.im)) < 1e-4) {
        groupedComplex.push({ re: c1.re, im: Math.abs(c1.im) });
        used.add(i);
        used.add(j);
        foundPair = true;
        break;
      }
    }
    if (!foundPair) {
      groupedComplex.push({ re: c1.re, im: Math.abs(c1.im) });
      used.add(i);
    }
  }

  // Sort real roots ascending
  realRoots.sort((x, y) => x - y);

  return { real: realRoots, complex: groupedComplex };
}

/** Helper to format final answer roots into clean LaTeX string. */
function formatFinalRoots(
  roots: { real: number[]; complex: { re: number; im: number }[] },
  variable: string
): string {
  const parts: string[] = [];

  roots.real.forEach((r, i) => {
    parts.push(`${variable}_${i + 1} = ${fmt(r)}`);
  });

  roots.complex.forEach((comp, i) => {
    const idx = roots.real.length + i * 2 + 1;
    const imStr = Math.abs(comp.im) === 1 ? 'i' : `${fmt(comp.im)}\\,i`;
    if (Math.abs(comp.re) < 1e-6) {
      parts.push(`${variable}_{${idx},${idx + 1}} = \\pm ${imStr}`);
    } else {
      parts.push(`${variable}_{${idx},${idx + 1}} = ${fmt(comp.re)} \\pm ${imStr}`);
    }
  });

  return parts.length > 0 ? parts.join(', \\quad ') : `${variable} = 0`;
}

// ─── Main Solver Functions ──────────────────────────────────────────────────

export function solvePolynomial(equation: string): SolverResult {
  let cleanEq = equation.trim();
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

  // Normalize equation to "LHS - RHS" standard form
  let [lhs, rhs] = cleanEq.split('=');
  let standardExpr = '';
  if (rhs !== undefined && rhs.trim() !== '') {
    standardExpr = `(${lhs.trim()}) - (${rhs.trim()})`;
  } else {
    standardExpr = lhs.trim();
  }

  // Extract exact polynomial coefficients and degree
  const poly = extractCoefficients(standardExpr, variable);

  if (poly && poly.degree >= 1) {
    const { degree, coeffs } = poly;

    // ─── DEGREE 1 (LINEAR): ax + b = 0 ──────────────────────────────────────
    if (degree === 1) {
      const [a, b] = coeffs;
      const steps = generateLinearSteps(a, b, variable);
      return {
        type: 'polynomial',
        steps,
        finalAnswer: `${variable} = ${fmt(-b / a)}`,
      };
    }

    // ─── DEGREE 2 (QUADRATIC): ax^2 + bx + c = 0 ────────────────────────────
    if (degree === 2) {
      const [a, b, c] = coeffs;
      const steps = generateQuadraticSteps(a, b, c, variable);
      const delta = b * b - 4 * a * c;
      let finalAnswer = '';

      if (delta >= 0) {
        const rootDelta = Math.sqrt(delta);
        const x1 = (-b + rootDelta) / (2 * a);
        const x2 = (-b - rootDelta) / (2 * a);
        if (Math.abs(delta) < 1e-8) {
          finalAnswer = `${variable} = ${fmt(x1)}`;
        } else {
          finalAnswer = `${variable}_1 = ${fmt(x1)}, \\quad ${variable}_2 = ${fmt(x2)}`;
        }
      } else {
        const realPart = -b / (2 * a);
        const imagPart = Math.sqrt(-delta) / (2 * a);
        finalAnswer = `${variable} = ${fmt(realPart)} \\pm ${fmt(imagPart)}\\,i`;
      }

      return {
        type: 'polynomial',
        steps,
        finalAnswer,
      };
    }

    // ─── DEGREE 3 (CUBIC): ax^3 + bx^2 + cx + d = 0 ─────────────────────────
    if (degree === 3) {
      const [a, b, c, d] = coeffs;
      const roots = solvePolynomialNumerical(coeffs);
      const steps = generateCubicSteps(a, b, c, d, roots, variable);
      const finalAnswer = formatFinalRoots(roots, variable);
      return {
        type: 'polynomial',
        steps,
        finalAnswer,
      };
    }

    // ─── DEGREE 4 (QUARTIC): ax^4 + bx^3 + cx^2 + dx + e = 0 ────────────────
    if (degree === 4) {
      const roots = solvePolynomialNumerical(coeffs);
      const steps = generateQuarticSteps(coeffs, roots, variable);
      const finalAnswer = formatFinalRoots(roots, variable);
      return {
        type: 'polynomial',
        steps,
        finalAnswer,
      };
    }

    // ─── DEGREE 5+ (HIGHER ORDER): ax^n + ... = 0 (Abel–Ruffini) ────────────
    if (degree >= 5) {
      const roots = solvePolynomialNumerical(coeffs);
      const steps = generateDegree5PlusSteps(coeffs, roots, variable);
      const finalAnswer = formatFinalRoots(roots, variable);
      return {
        type: 'polynomial',
        steps,
        finalAnswer,
      };
    }
  }

  // ─── GENERAL / NON-POLYNOMIAL EQUATIONS FALLBACK ──────────────────────────
  try {
    const solutions = (nerdamer as any).solve(standardExpr, variable);
    const solStr = String(solutions || '');
    const cleanSols: string[] = solStr
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s: string) => s.trim())
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
      const fmtVal = (v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(4));
      return {
        type: 'system',
        steps,
        finalAnswer: `${vars[0]} = ${fmtVal(x)}, \\quad ${vars[1]} = ${fmtVal(y)}`,
      };
    }
  }

  // 3x3 and 4x4: Gaussian elimination
  if (n >= 3) {
    const aug = matA.map((row, i) => [...row.slice(0, n), vecB[i]]);

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

    const sol = new Array(n).fill(0);
    for (let row = n - 1; row >= 0; row--) {
      let sum = aug[row][n];
      for (let col = row + 1; col < n; col++) {
        sum -= aug[row][col] * sol[col];
      }
      sol[row] = Math.abs(aug[row][row]) > 1e-12 ? sum / aug[row][row] : 0;
    }

    const fmtVal = (v: number) => {
      const r = Math.round(v);
      return Math.abs(v - r) < 1e-8 ? r.toString() : v.toFixed(4);
    };
    const answer = vars.map((v, i) => `${v} = ${fmtVal(sol[i])}`).join(', \\quad ');
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
        const fmtVal = (v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(4));
        const openOrClosed = rel.includes('=') ? ['\\leq', '\\geq'] : ['<', '>'];

        let latex: string;
        if (a > 0) {
          if (rel === '>' || rel === '>=') {
            latex = `${variable} ${openOrClosed[0]} ${fmtVal(r1)} \\quad \\text{or} \\quad ${variable} ${openOrClosed[1]} ${fmtVal(r2)}`;
          } else {
            latex = `${fmtVal(r1)} ${openOrClosed[1]} ${variable} ${openOrClosed[0]} ${fmtVal(r2)}`;
          }
        } else {
          if (rel === '>' || rel === '>=') {
            latex = `${fmtVal(r1)} ${openOrClosed[1]} ${variable} ${openOrClosed[0]} ${fmtVal(r2)}`;
          } else {
            latex = `${variable} ${openOrClosed[0]} ${fmtVal(r1)} \\quad \\text{or} \\quad ${variable} ${openOrClosed[1]} ${fmtVal(r2)}`;
          }
        }

        return {
          type: 'inequality',
          steps: [
            {
              stepNumber: 1,
              explanation: 'Find the roots of the corresponding equation.',
              math: `${variable}_1 = ${fmtVal(r1)}, \\quad ${variable}_2 = ${fmtVal(r2)}`,
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
    const sol = (nerdamer as any).solve(standardExpr, target).toString();
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
