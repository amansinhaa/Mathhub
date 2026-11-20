import { SolverResult, QuadraticMethod, SolutionStep, SubStep } from '@/types/solver';
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
  fmtFraction,
  toFraction,
  evalPoly,
  gcd,
  formatPolynomial,
} from './stepGenerator';
import { evaluate } from 'mathjs';
import * as math from 'mathjs';
// @ts-ignore
import nerdamer from 'nerdamer/all.min.js';
import { normalizeExpression, autoBalanceParens, autoInterpretEquals, expressionToLatex } from './normalizer';
import { detectODE, solveODE } from './odeSolver';
import { detectTranscendental, solveTranscendental } from './transcendentalSolver';
import { isNonlinearSystem, solveNonlinearSystem } from './nonlinearSystemSolver';
import { detectParametricEquation, solveParametricEquation } from './parametricSolver';
import { trySimplifyRationalExpression, trySolveRationalEquation } from './rationalSolver';
import { trySolveExponentialEquation } from './exponentialSolver';
import { trySolveLogarithmicEquation } from './logarithmicSolver';
import { trySolveTrigonometricEquation } from './trigonometricSolver';
import { trySolveUSubstitutionEquation } from './uSubstitutionSolver';
import { classifyEquation } from './classifier';

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

/**
 * Safely parse a mathematical coefficient string (which may be a fraction like "1/2",
 * negative number "-3/4", radical, or numeric string) into a finite number.
 */
export function parseCoeffValue(s: string): number {
  const trimmed = s.trim();
  if (!trimmed) return 0;
  try {
    const evaluated = (nerdamer as any)(trimmed).evaluate().text();
    const val = math.evaluate(evaluated);
    if (typeof val === 'number' && Number.isFinite(val)) return val;
    if (val && typeof val.valueOf === 'function') {
      const num = Number(val.valueOf());
      if (Number.isFinite(num)) return num;
    }
  } catch {
    // fallback
  }
  try {
    const val = math.evaluate(trimmed);
    if (typeof val === 'number' && Number.isFinite(val)) return val;
    if (val && typeof val.valueOf === 'function') {
      const num = Number(val.valueOf());
      if (Number.isFinite(num)) return num;
    }
  } catch {
    // fallback
  }
  const parts = trimmed.split('/');
  if (parts.length === 2) {
    const n = parseFloat(parts[0]);
    const d = parseFloat(parts[1]);
    if (Number.isFinite(n) && Number.isFinite(d) && d !== 0) return n / d;
  }
  const n = parseFloat(trimmed);
  return isNaN(n) ? 0 : n;
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
        .map((s: string) => parseCoeffValue(s));
      // nerdamer gives [a_0, a_1, ..., a_n] -> reverse to [a_n, ..., a_0]
      const coeffs = arr.reverse();
      // Remove leading zeros
      while (coeffs.length > 1 && Math.abs(coeffs[0]) < 1e-9) {
        coeffs.shift();
      }
      const degree = coeffs.length - 1;
      if (degree >= 0 && coeffs.every((num: number) => Number.isFinite(num) && !isNaN(num))) {
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

  if (vals.every((v) => Math.abs(v - vals[0]) < 1e-4)) {
    return { degree: 0, coeffs: [Math.round(vals[0] * 1e6) / 1e6] };
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

/** Helper to format final answer roots into clean LaTeX string (exact fractions and decimals). */
function formatFinalRoots(
  roots: { real: number[]; complex: { re: number; im: number }[] },
  variable: string,
  hasSubscripts: boolean = false
): { exact: string; decimal?: string; numericRoots: number[] } {
  const numericRoots: number[] = [];
  const distinctReal: number[] = [];
  roots.real.forEach((rawR) => {
    const r = Math.round(rawR * 1e8) / 1e8;
    if (!distinctReal.some((dr) => Math.abs(dr - r) < 1e-5)) {
      distinctReal.push(r);
      numericRoots.push(r);
    }
  });

  if (hasSubscripts) {
    const exactParts: string[] = [];
    const decimalParts: string[] = [];
    let hasFraction = false;

    roots.real.forEach((r, i) => {
      const frac = toFraction(r);
      if (frac && frac.d > 1) {
        hasFraction = true;
        exactParts.push(`${variable}_${i + 1} = ${fmtFraction(r)}`);
      } else {
        exactParts.push(`${variable}_${i + 1} = ${fmt(r)}`);
      }
      decimalParts.push(`${variable}_${i + 1} = ${fmt(r)}`);
    });

    roots.complex.forEach((comp, i) => {
      const idx = roots.real.length + i * 2 + 1;
      const fracRe = toFraction(comp.re);
      const fracIm = toFraction(comp.im);
      const reStr = fracRe && fracRe.d > 1 ? fmtFraction(comp.re) : fmt(comp.re);
      const imStr = Math.abs(comp.im) === 1 ? 'i' : `${fracIm && fracIm.d > 1 ? fmtFraction(comp.im) : fmt(comp.im)}\\,i`;
      const exactStr =
        Math.abs(comp.re) < 1e-6
          ? `${variable}_{${idx},${idx + 1}} = \\pm ${imStr}`
          : `${variable}_{${idx},${idx + 1}} = ${reStr} \\pm ${imStr}`;
      exactParts.push(exactStr);
      
      const decImStr = Math.abs(comp.im) === 1 ? 'i' : `${fmt(comp.im)}\\,i`;
      const decStr =
        Math.abs(comp.re) < 1e-6
          ? `${variable}_{${idx},${idx + 1}} = \\pm ${decImStr}`
          : `${variable}_{${idx},${idx + 1}} = ${fmt(comp.re)} \\pm ${decImStr}`;
      decimalParts.push(decStr);
    });

    const exact = exactParts.length > 0 ? exactParts.join(', \\quad ') : `${variable} = 0`;
    const decimal = hasFraction && decimalParts.length > 0 ? decimalParts.join(', \\quad ') : undefined;
    return { exact, decimal, numericRoots };
  }

  // Single variable mode without artificial subscripts: "x = sol1, sol2, ..."
  let hasFraction = false;
  const exactItems: string[] = [];
  const decimalItems: string[] = [];

  distinctReal.forEach((r) => {
    const frac = toFraction(r);
    if (frac && frac.d > 1) {
      hasFraction = true;
      exactItems.push(fmtFraction(r));
    } else {
      exactItems.push(fmt(r));
    }
    decimalItems.push(fmt(r));
  });

  roots.complex.forEach((comp) => {
    const fracRe = toFraction(comp.re);
    const fracIm = toFraction(comp.im);
    const reStr = fracRe && fracRe.d > 1 ? fmtFraction(comp.re) : fmt(comp.re);
    const imStr = Math.abs(comp.im) === 1 ? 'i' : `${fracIm && fracIm.d > 1 ? fmtFraction(comp.im) : fmt(comp.im)}\\,i`;
    const exactStr =
      Math.abs(comp.re) < 1e-6
        ? `\\pm ${imStr}`
        : `${reStr} \\pm ${imStr}`;
    exactItems.push(exactStr);
    
    const decImStr = Math.abs(comp.im) === 1 ? 'i' : `${fmt(comp.im)}\\,i`;
    const decStr =
      Math.abs(comp.re) < 1e-6
        ? `\\pm ${decImStr}`
        : `${fmt(comp.re)} \\pm ${decImStr}`;
    decimalItems.push(decStr);
  });

  const exact = exactItems.length > 0 ? `${variable} = ${exactItems.join(', \\; ')}` : `${variable} = 0`;
  const decimal = hasFraction && decimalItems.length > 0 ? `${variable} = ${decimalItems.join(', \\; ')}` : undefined;

  return { exact, decimal, numericRoots };
}

// ─── Radical Expression Simplifier ─────────────────────────────────────────

function factorSquare(n: number): { outside: number; inside: number } {
  let outside = 1;
  let inside = n;
  for (let i = Math.floor(Math.sqrt(n)); i >= 2; i--) {
    if (n % (i * i) === 0) {
      outside = i;
      inside = Math.round(n / (i * i));
      break;
    }
  }
  return { outside, inside };
}

interface MonomialRadicand {
  coeff: number;
  cOut: number;
  cIn: number;
  outsideVars: string[];
  insideVars: string[];
  perfectVars: string[];
  remainVars: string[];
  outsideLatex: string;
  insideLatex: string;
  perfStr: string;
  remStr: string;
  finalLatex: string;
}

function parseMonomialRadicand(monomialStr: string): MonomialRadicand {
  let coeff = 1;
  const coeffMatch = monomialStr.match(/^([0-9.]+)/);
  let rest = monomialStr;
  if (coeffMatch) {
    coeff = parseInt(coeffMatch[1], 10);
    rest = monomialStr.slice(coeffMatch[0].length);
  }

  const { outside: cOut, inside: cIn } = factorSquare(coeff);

  const varMatches = [...rest.matchAll(/([a-zA-Z])(?:\^(\d+))?/g)];
  const outsideVars: string[] = [];
  const insideVars: string[] = [];
  const perfectVars: string[] = [];
  const remainVars: string[] = [];

  for (const m of varMatches) {
    const v = m[1];
    const power = m[2] ? parseInt(m[2], 10) : 1;
    const q = Math.floor(power / 2);
    const r = power % 2;

    if (q > 0) {
      outsideVars.push(q === 1 ? v : `${v}^{${q}}`);
      perfectVars.push(`${v}^{${q * 2}}`);
    }
    if (r > 0) {
      insideVars.push(r === 1 ? v : `${v}^{${r}}`);
      remainVars.push(r === 1 ? v : `${v}^{${r}}`);
    }
  }

  // Outside latex
  const outCoeffStr = cOut > 1 || (outsideVars.length === 0 && cIn === 1 && insideVars.length === 0) ? cOut.toString() : '';
  let outsideLatex = (outCoeffStr + outsideVars.join('')).trim();
  if (outsideLatex === '1' && (cIn > 1 || insideVars.length > 0)) outsideLatex = '';

  // Inside latex
  const inCoeffStr = cIn > 1 || (insideVars.length === 0) ? cIn.toString() : '';
  const insideLatex = (inCoeffStr + insideVars.join('')).trim();

  // Perfect square part inside
  const perfCoeff = cOut * cOut;
  const perfStr = (perfCoeff > 1 || perfectVars.length > 0) ? (perfCoeff > 1 ? perfCoeff.toString() : '') + perfectVars.join('') : '';

  // Remaining non-square part inside
  const remStr = (cIn > 1 || remainVars.length > 0) ? (cIn > 1 ? cIn.toString() : '') + remainVars.join('') : '';

  let finalLatex = '';
  if (insideLatex === '' || insideLatex === '1') {
    finalLatex = outsideLatex || '1';
  } else if (!outsideLatex) {
    finalLatex = `\\sqrt{${insideLatex}}`;
  } else {
    finalLatex = `${outsideLatex}\\sqrt{${insideLatex}}`;
  }

  return {
    coeff,
    cOut,
    cIn,
    outsideVars,
    insideVars,
    perfectVars,
    remainVars,
    outsideLatex,
    insideLatex,
    perfStr,
    remStr,
    finalLatex,
  };
}

export function trySimplifyRadicalExpression(cleanEq: string, rawEq: string): SolverResult | null {
  const hasRadical = /sqrt|cbrt|√|∛/.test(cleanEq);
  if (!hasRadical) return null;

  // Extract all top-level sqrt(...)
  let clean = cleanEq
    .replace(/\\sqrt\s*\{/g, 'sqrt(')
    .replace(/\\sqrt\s*\(/g, 'sqrt(')
    .replace(/√\s*\(/g, 'sqrt(')
    .replace(/\\cdot/g, '*')
    .replace(/×/g, '*')
    .replace(/\s+/g, '')
    .trim();

  const radicands: string[] = [];
  let i = 0;
  while (i < clean.length) {
    if (clean.startsWith('sqrt(', i)) {
      const startIdx = i + 5;
      let depth = 1;
      let j = startIdx;
      while (j < clean.length && depth > 0) {
        if (clean[j] === '(') depth++;
        else if (clean[j] === ')') depth--;
        j++;
      }
      if (depth === 0) {
        radicands.push(clean.slice(startIdx, j - 1).trim());
        i = j;
        continue;
      }
    }
    i++;
  }

  if (radicands.length === 0) return null;

  try {
    const steps: SolutionStep[] = [];
    let stepNumber = 1;

    // Expand combined radicand with nerdamer
    const combinedRadicandExpr = radicands.map((r) => `(${r})`).join(' * ');
    const expanded = (nerdamer as any)(`expand(${combinedRadicandExpr})`).toString();
    const parsed = parseMonomialRadicand(expanded);

    // If multiple radicals combined
    if (radicands.length > 1) {
      const combinedLatex = radicands
        .map((r) => `(${r.replace(/\^(\d+)/g, '^{$1}').replace(/\^\(([^)]+)\)/g, '^{$1}')})`)
        .join(' \\cdot ');
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Combine terms under a single radical using the product rule: \\sqrt{a} \\cdot \\sqrt{b} = \\sqrt{a \\cdot b}.',
        math: `\\sqrt{${combinedLatex}}`,
      });

      // Show multiplication/exponent addition
      const formattedExpanded = expanded.replace(/\*/g, '').replace(/\^(\d+)/g, '^{$1}');
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Multiply coefficients and combine variables with like bases by adding exponents ($x^m \\cdot x^n = x^{m+n}$).',
        math: `\\sqrt{${formattedExpanded}}`,
      });
    }

    // Step: Factor out perfect squares
    if (parsed.cOut > 1 || parsed.perfectVars.length > 0) {
      let splitInside = '';
      if (parsed.perfStr && parsed.remStr) {
        splitInside = `(${parsed.perfStr}) \\cdot (${parsed.remStr})`;
      } else if (parsed.perfStr) {
        splitInside = parsed.perfStr;
      } else {
        splitInside = parsed.remStr;
      }

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Decompose the radicand into perfect square factors and remaining non-square terms.',
        math: `\\sqrt{${splitInside}}`,
      });

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Extract the square roots of the perfect square factors outside the radical (\\sqrt{a^2} = a).',
        math: parsed.finalLatex,
      });
    } else {
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'The expression is already in simplest radical form with no perfect square factors remaining under the radical.',
        math: parsed.finalLatex,
      });
    }

    return {
      type: 'radical',
      equationType: 'radical',
      steps,
      finalAnswer: parsed.finalLatex,
      inputInterpretation: expressionToLatex(rawEq),
      numericRoots: [],
    };
  } catch (e) {
    return null;
  }
}

/**
 * Solves radical equations of the form sqrt(A) = B or sqrt(A) - sqrt(B) = C.
 * Shows squaring both sides, collecting terms, solving resulting polynomial,
 * and checking for extraneous solutions.
 */
export function trySolveRadicalEquation(cleanEq: string, rawEq: string): SolverResult | null {
  if (!cleanEq.includes('=')) return null;
  const hasRadical = /sqrt|√/.test(cleanEq);
  if (!hasRadical) return null;

  try {
    const parts = cleanEq.split('=');
    let lhs = parts[0].trim();
    let rhs = parts[1].trim();
    const variable = detectVariable(cleanEq);

    // Form 1: sqrt(A) = B
    const sqrtMatch = lhs.match(/^sqrt\(([^)]+)\)$/);
    if (sqrtMatch && !rhs.includes('sqrt')) {
      const radicand = sqrtMatch[1];
      const steps: SolutionStep[] = [];
      let stepNumber = 1;

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Isolate the radical on one side of the equation:',
        math: `\\sqrt{${expressionToLatex(radicand)}} = ${expressionToLatex(rhs)}`,
      });

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Square both sides of the equation to eliminate the square root (note: this may introduce extraneous solutions):',
        math: `\\left(\\sqrt{${expressionToLatex(radicand)}}\\right)^2 = \\left(${expressionToLatex(rhs)}\\right)^2`,
      });

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Simplify both sides:',
        math: `${expressionToLatex(radicand)} = ${expressionToLatex(`(${rhs})^2`)}`,
      });

      // Resulting polynomial equation: (radicand) - (rhs)^2 = 0
      const polyEq = `(${radicand}) - (${rhs})^2 = 0`;
      const polyRes = solvePolynomial(polyEq);

      // Check if resulting polynomial is quadratic with exact radical roots
      const candidateList: { exact: string; num: number }[] = [];
      try {
        const cObj = (nerdamer as any).coeffs(`(${radicand}) - (${rhs})^2`, variable);
        const cStr = cObj.toString();
        if (cStr.startsWith('[') && cStr.endsWith(']')) {
          const arr = cStr
            .slice(1, -1)
            .split(',')
            .map((s: string) => parseCoeffValue(s));
          if (arr.length === 3 && Math.abs(arr[2]) > 1e-9) {
            const c = arr[0];
            const b = arr[1];
            const a = arr[2];
            const delta = b * b - 4 * a * c;
            if (delta >= 0) {
              const sqrtD = Math.sqrt(delta);
              const r1 = (-b + sqrtD) / (2 * a);
              const r2 = (-b - sqrtD) / (2 * a);
              const isSq = Math.abs(Math.round(sqrtD) - sqrtD) < 1e-6;
              if (isSq) {
                const frac1 = toFraction(r1);
                const frac2 = toFraction(r2);
                candidateList.push({ exact: frac1 && frac1.d > 1 ? fmtFraction(r1) : fmt(r1), num: r1 });
                if (Math.abs(r1 - r2) > 1e-6) {
                  candidateList.push({ exact: frac2 && frac2.d > 1 ? fmtFraction(r2) : fmt(r2), num: r2 });
                }
              } else {
                let outside = 1;
                let inside = Math.round(delta);
                for (let i = Math.floor(Math.sqrt(inside)); i >= 2; i--) {
                  if (inside % (i * i) === 0) {
                    outside = i;
                    inside = Math.round(inside / (i * i));
                    break;
                  }
                }
                let numCoeff = -b;
                let denCoeff = 2 * a;
                let outCoeff = outside;
                if (denCoeff < 0) {
                  numCoeff = -numCoeff;
                  denCoeff = -denCoeff;
                }

                // Check common divisor among numCoeff, outCoeff, and denCoeff
                const g = gcd(gcd(numCoeff, outCoeff), denCoeff);
                const simNum = numCoeff / g;
                const simOut = outCoeff / g;
                const simDen = denCoeff / g;

                const radPart1 = simOut === 1 ? `\\sqrt{${inside}}` : `${simOut}\\sqrt{${inside}}`;

                let exact1 = '';
                let exact2 = '';
                if (simDen === 1) {
                  exact1 = `${simNum} + ${radPart1}`;
                  exact2 = `${simNum} - ${radPart1}`;
                } else {
                  exact1 = `\\frac{${simNum} + ${radPart1}}{${simDen}}`;
                  exact2 = `\\frac{${simNum} - ${radPart1}}{${simDen}}`;
                }

                candidateList.length = 0;
                candidateList.push({ exact: r1 >= r2 ? exact1 : exact2, num: r1 });
                candidateList.push({ exact: r1 >= r2 ? exact2 : exact1, num: r2 });
              }
            }
          }
        }
      } catch {}

      if (candidateList.length === 0) {
        for (const numR of (polyRes.numericRoots || [])) {
          const frac = toFraction(numR);
          candidateList.push({
            exact: frac && frac.d > 1 ? fmtFraction(numR) : fmt(numR),
            num: numR,
          });
        }
      }

      // Check each candidate root against original equation
      const validRoots: { exact: string; num: number }[] = [];
      const extraneousRoots: { exact: string; num: number }[] = [];
      const checkSteps: string[] = [];

      for (const cand of candidateList) {
        const numR = cand.num;
        let leftVal = NaN;
        let rightVal = NaN;
        try {
          leftVal = math.evaluate(`sqrt(${radicand})`, { [variable]: numR });
          rightVal = math.evaluate(rhs, { [variable]: numR });
        } catch {}

        const diff = Math.abs(leftVal - rightVal);
        const isMatch = !isNaN(diff) && diff < 1e-4;

        if (isMatch) {
          validRoots.push({ exact: cand.exact, num: numR });
          checkSteps.push(
            `\\text{Test } ${variable} = ${cand.exact} \\; (\\approx ${fmt(numR)}): \\quad \\sqrt{${fmt(leftVal * leftVal)}} = ${fmt(rightVal)} \\implies \\checkmark \\text{ (Valid)}`
          );
        } else {
          extraneousRoots.push({ exact: cand.exact, num: numR });
          checkSteps.push(
            `\\text{Test } ${variable} = ${cand.exact} \\; (\\approx ${fmt(numR)}): \\quad \\sqrt{${fmt(Math.max(0, leftVal * leftVal))}} = ${fmt(leftVal)} \\neq ${fmt(rightVal)} \\implies \\times \\text{ (Extraneous root, rejected)}`
          );
        }
      }

      if (checkSteps.length > 0) {
        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Check candidate solutions in the original equation to discard extraneous roots:',
          math: `\\begin{aligned} ${checkSteps.join(' \\\\[6pt] ')} \\end{aligned}`,
        });
      }

      const finalAnswer = validRoots.length > 0
        ? validRoots.map((r) => `${variable} = ${r.exact}`).join(', \\quad ')
        : '\\text{No real solution}';

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'State the final valid solution:',
        math: finalAnswer,
      });

      return {
        type: 'radical',
        equationType: 'radical',
        steps,
        finalAnswer,
        numericRoots: validRoots.map((r) => r.num),
        inputInterpretation: `\\text{Solve radical equation: } ${expressionToLatex(cleanEq)}`,
      };
    }

    // Form 2: sqrt(A) = sqrt(B)
    const sqrtMatchL = lhs.match(/^sqrt\(([^)]+)\)$/);
    const sqrtMatchR = rhs.match(/^sqrt\(([^)]+)\)$/);
    if (sqrtMatchL && sqrtMatchR) {
      const radA = sqrtMatchL[1];
      const radB = sqrtMatchR[1];
      const steps: SolutionStep[] = [];
      let stepNumber = 1;

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'State the domain constraints: both radicands must be non-negative ($A \\ge 0$ and $B \\ge 0$):',
        math: `${expressionToLatex(radA)} \\ge 0 \\quad \\text{and} \\quad ${expressionToLatex(radB)} \\ge 0`,
      });

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Square both sides of the equation to eliminate the radicals:',
        math: `\\left(\\sqrt{${expressionToLatex(radA)}}\\right)^2 = \\left(\\sqrt{${expressionToLatex(radB)}}\\right)^2 \\implies ${expressionToLatex(radA)} = ${expressionToLatex(radB)}`,
      });

      const polyEq = `(${radA}) - (${radB}) = 0`;
      const polyRes = solvePolynomial(polyEq);
      const candidates = (polyRes.numericRoots || []).filter((r, idx, arr) => arr.indexOf(r) === idx);

      const validRoots: { exact: string; num: number }[] = [];
      const extraneousRoots: { exact: string; num: number }[] = [];

      for (const numR of candidates) {
        let leftVal = NaN;
        let rightVal = NaN;
        try {
          leftVal = math.evaluate(radA, { [variable]: numR });
          rightVal = math.evaluate(radB, { [variable]: numR });
        } catch {}

        const frac = toFraction(numR);
        const exactStr = frac && frac.d > 1 ? fmtFraction(numR) : fmt(numR);

        if (!isNaN(leftVal) && !isNaN(rightVal) && leftVal >= -1e-6 && rightVal >= -1e-6 && Math.abs(leftVal - rightVal) < 1e-4) {
          validRoots.push({ exact: exactStr, num: numR });
        } else {
          extraneousRoots.push({ exact: exactStr, num: numR });
        }
      }

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Solve the resulting equation and verify candidate root(s) against domain constraints:',
        math: validRoots.length > 0
          ? validRoots.map((r) => `${variable} = ${r.exact}`).join(', \\; ')
          : '\\text{No real solution}',
      });

      const finalAnswer = validRoots.length > 0
        ? validRoots.map((r) => `${variable} = ${r.exact}`).join(', \\; ')
        : '\\text{No real solution}';

      return {
        type: 'radical',
        equationType: 'radical',
        steps,
        finalAnswer,
        numericRoots: validRoots.map((r) => r.num),
        inputInterpretation: `\\text{Solve radical equation: } ${expressionToLatex(cleanEq)}`,
      };
    }

    // Form 3: sqrt(A) ± sqrt(B) = C
    const twoRadMatch = lhs.match(/^sqrt\(([^)]+)\)\s*([+-])\s*sqrt\(([^)]+)\)$/);
    if (twoRadMatch && !rhs.includes('sqrt')) {
      const radA = twoRadMatch[1];
      const signOp = twoRadMatch[2];
      const radB = twoRadMatch[3];
      const steps: SolutionStep[] = [];
      let stepNumber = 1;

      const oppSign = signOp === '+' ? '-' : '+';
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Isolate one radical on one side of the equation:',
        math: `\\sqrt{${expressionToLatex(radA)}} = ${expressionToLatex(rhs)} ${oppSign} \\sqrt{${expressionToLatex(radB)}}`,
      });

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Square both sides to eliminate the first radical:',
        math: `${expressionToLatex(radA)} = \\left(${expressionToLatex(rhs)} ${oppSign} \\sqrt{${expressionToLatex(radB)}}\\right)^2`,
      });

      // (sqrt(A) + s*sqrt(B))^2 = C^2  => algebraic reduction
      // D = A - B - C^2 => D^2 - 4*C^2*B = 0
      const polyExpr = `((${radA}) - (${radB}) - (${rhs})^2)^2 - 4*(${rhs})^2*(${radB})`;
      const polyRes = solvePolynomial(`${polyExpr} = 0`);
      const candidates = (polyRes.numericRoots || []).filter((r, idx, arr) => arr.indexOf(r) === idx);

      const validRoots: { exact: string; num: number }[] = [];
      const extraneousRoots: { exact: string; num: number }[] = [];

      for (const numR of candidates) {
        let leftVal = NaN;
        let rightVal = NaN;
        let valA = NaN;
        let valB = NaN;
        try {
          valA = math.evaluate(radA, { [variable]: numR });
          valB = math.evaluate(radB, { [variable]: numR });
          if (valA >= -1e-6 && valB >= -1e-6) {
            const sqA = Math.sqrt(Math.max(0, valA));
            const sqB = Math.sqrt(Math.max(0, valB));
            leftVal = signOp === '+' ? sqA + sqB : sqA - sqB;
            rightVal = math.evaluate(rhs, { [variable]: numR });
          }
        } catch {}

        const frac = toFraction(numR);
        const exactStr = frac && frac.d > 1 ? fmtFraction(numR) : fmt(numR);

        if (!isNaN(leftVal) && !isNaN(rightVal) && Math.abs(leftVal - rightVal) < 1e-4) {
          validRoots.push({ exact: exactStr, num: numR });
        } else {
          extraneousRoots.push({ exact: exactStr, num: numR });
        }
      }

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Isolate the remaining radical, square again, and solve the resulting polynomial equation.',
        math: `\\text{Resulting polynomial: } ${expressionToLatex(polyExpr)} = 0`,
      });

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Verify candidate solutions in the original equation to filter out extraneous roots:',
        math: validRoots.length > 0
          ? validRoots.map((r) => `\\text{Test } ${variable} = ${r.exact} \\implies \\checkmark \\text{ (Valid)}`).join(' \\\\[4pt] ')
          : '\\text{All candidate roots are extraneous.}',
      });

      const finalAnswer = validRoots.length > 0
        ? validRoots.map((r) => `${variable} = ${r.exact}`).join(', \\; ')
        : '\\text{No real solution}';

      return {
        type: 'radical',
        equationType: 'radical',
        steps,
        finalAnswer,
        numericRoots: validRoots.map((r) => r.num),
        inputInterpretation: `\\text{Solve radical equation: } ${expressionToLatex(cleanEq)}`,
      };
    }
  } catch {
    // fallback
  }

  return null;
}

/**
 * Solves absolute value equations of the form |A| = B or k|A| = B.
 * Splits into positive and negative branches, checks for negative constant RHS,
 * and verifies candidate solutions to discard extraneous roots.
 */
export function trySolveAbsoluteValueEquation(cleanEq: string, rawEq: string): SolverResult | null {
  if (!cleanEq.includes('=')) return null;

  // Check if expression contains absolute value signs or abs()
  const hasAbs = /\|[^|]+\||abs\([^)]+\)/.test(cleanEq);
  if (!hasAbs) return null;

  try {
    const parts = cleanEq.split('=');
    let lhs = parts[0].trim();
    let rhs = parts[1].trim();

    // Standardize abs(...) to |...|
    lhs = lhs.replace(/abs\(([^)]+)\)/g, '|$1|');
    rhs = rhs.replace(/abs\(([^)]+)\)/g, '|$1|');

    // If LHS has no abs but RHS has abs, swap them
    if (!lhs.includes('|') && rhs.includes('|')) {
      const tmp = lhs;
      lhs = rhs;
      rhs = tmp;
    }

    let insideA = '';
    let isolatedRhs = rhs;

    const pureAbsMatch = lhs.match(/^\|([^|]+)\|$/);
    const coeffAbsMatch = lhs.match(/^([+-]?\d*(?:\.\d+)?)\*?\|([^|]+)\|$/);

    if (pureAbsMatch) {
      insideA = pureAbsMatch[1].trim();
    } else if (coeffAbsMatch && coeffAbsMatch[1] && coeffAbsMatch[1] !== '+' && coeffAbsMatch[1] !== '-') {
      const coeff = parseFloat(coeffAbsMatch[1]);
      if (!isNaN(coeff) && Math.abs(coeff) > 1e-9) {
        insideA = coeffAbsMatch[2].trim();
        isolatedRhs = `(${rhs}) / (${coeff})`;
      } else {
        return null;
      }
    } else {
      const addMatch = lhs.match(/^\|([^|]+)\|\s*([+-]\s*[^|]+)$/);
      if (addMatch) {
        insideA = addMatch[1].trim();
        const extra = addMatch[2].trim();
        isolatedRhs = `(${rhs}) - (${extra})`;
      } else {
        return null;
      }
    }

    if (!insideA) return null;

    const variable = detectVariable(cleanEq);
    const steps: SolutionStep[] = [];
    let stepNumber = 1;

    // Step 1: Write isolated form
    const isolatedLatex = `\\left|${expressionToLatex(insideA)}\\right| = ${expressionToLatex(isolatedRhs)}`;
    steps.push({
      stepNumber: stepNumber++,
      explanation: 'Isolate the absolute value expression on one side of the equation:',
      math: isolatedLatex,
    });

    // Check if RHS evaluates to a constant
    let constRhs: number | null = null;
    try {
      const evalR = math.evaluate(isolatedRhs);
      if (typeof evalR === 'number' && Number.isFinite(evalR)) {
        constRhs = evalR;
      }
    } catch {
      // RHS depends on variable
    }

    // If RHS is a strictly negative constant, absolute value equation has NO real solution
    if (constRhs !== null && constRhs < -1e-9) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: `By definition, the absolute value of any real expression is always non-negative ($|u| \\ge 0$). Since the right-hand side is negative (${constRhs} < 0), this equation has no real solutions.`,
        math: `\\left|${expressionToLatex(insideA)}\\right| \\geq 0 \\neq ${constRhs}`,
      });

      return {
        type: 'absolute_value',
        equationType: 'absolute_value',
        steps,
        finalAnswer: '\\text{No real solution } (\\emptyset)',
        inputInterpretation: `\\text{Solve: } ${expressionToLatex(cleanEq)}`,
        numericRoots: [],
      };
    }

    // Step 2: Split into two branches
    steps.push({
      stepNumber: stepNumber++,
      explanation: 'Apply the absolute value definition: $|u| = c \\iff u = c \\quad \\text{or} \\quad u = -c$. Split into two algebraic cases:',
      math: `${expressionToLatex(insideA)} = ${expressionToLatex(isolatedRhs)} \\quad \\text{or} \\quad ${expressionToLatex(insideA)} = -\\left(${expressionToLatex(isolatedRhs)}\\right)`,
    });

    // Branch 1: A = B
    const eqBranch1 = `(${insideA}) - (${isolatedRhs}) = 0`;
    const res1 = solvePolynomial(eqBranch1);

    // Branch 2: A = -B
    const eqBranch2 = `(${insideA}) + (${isolatedRhs}) = 0`;
    const res2 = solvePolynomial(eqBranch2);

    const candRoots: number[] = [];
    if (res1 && res1.numericRoots) {
      candRoots.push(...res1.numericRoots);
    }
    if (res2 && res2.numericRoots) {
      candRoots.push(...res2.numericRoots);
    }

    // Deduplicate candidate roots
    const uniqueCands: number[] = [];
    for (const r of candRoots) {
      if (!uniqueCands.some(u => Math.abs(u - r) < 1e-6)) {
        uniqueCands.push(r);
      }
    }

    // Detail Branch 1 & Branch 2 solutions
    steps.push({
      stepNumber: stepNumber++,
      explanation: `Solve Case 1 (Positive Branch): $${expressionToLatex(insideA)} = ${expressionToLatex(isolatedRhs)}$.`,
      math: res1?.finalAnswer || `\\text{Solve Branch 1}`,
      subSteps: res1?.steps?.map(s => ({ title: `Case 1: ${s.explanation}`, math: s.math || '' })),
    });

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Solve Case 2 (Negative Branch): $${expressionToLatex(insideA)} = -(${expressionToLatex(isolatedRhs)})$.`,
      math: res2?.finalAnswer || `\\text{Solve Branch 2}`,
      subSteps: res2?.steps?.map(s => ({ title: `Case 2: ${s.explanation}`, math: s.math || '' })),
    });

    // Verification against original |insideA| = isolatedRhs
    const validRoots: number[] = [];
    const extraneousRoots: number[] = [];
    const checkSubSteps: { title: string; math: string }[] = [];

    for (const r of uniqueCands) {
      let valLhs = NaN;
      let valRhs = NaN;
      try {
        valLhs = Math.abs(Number(math.evaluate(insideA, { [variable]: r })));
        valRhs = Number(math.evaluate(isolatedRhs, { [variable]: r }));
      } catch {}

      const isValid = !isNaN(valLhs) && !isNaN(valRhs) && Math.abs(valLhs - valRhs) < 1e-4;
      const frac = toFraction(r);
      const exactR = frac && frac.d > 1 ? fmtFraction(r) : fmt(r);

      if (isValid) {
        validRoots.push(r);
        checkSubSteps.push({
          title: `Verify ${variable} = ${exactR}:`,
          math: `|${Number(valLhs.toFixed(4))}| = ${Number(valRhs.toFixed(4))} \\quad \\checkmark \\text{ (Valid)}`,
        });
      } else {
        extraneousRoots.push(r);
        checkSubSteps.push({
          title: `Verify ${variable} = ${exactR}:`,
          math: `|${Number(valLhs.toFixed(4))}| \\neq ${Number(valRhs.toFixed(4))} \\quad \\times \\text{ (Extraneous)}`,
        });
      }
    }

    if (uniqueCands.length > 0) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: extraneousRoots.length > 0
          ? 'Substitute each candidate value back into the original equation to check for extraneous solutions:'
          : 'Verify each candidate solution by substituting it back into the equation:',
        math: `\\text{Valid Solutions: } ${validRoots.length > 0 ? validRoots.map(r => `${variable} = ${fmt(r)}`).join(', ') : '\\emptyset'}`,
        subSteps: checkSubSteps,
      });
    }

    if (validRoots.length === 0) {
      return {
        type: 'absolute_value',
        equationType: 'absolute_value',
        steps,
        finalAnswer: '\\text{No real solution } (\\emptyset)',
        inputInterpretation: `\\text{Solve: } ${expressionToLatex(cleanEq)}`,
        numericRoots: [],
      };
    }

    validRoots.sort((a, b) => a - b);
    const finalAnswer = validRoots
      .map(r => {
        const frac = toFraction(r);
        return `${variable} = ${frac && frac.d > 1 ? fmtFraction(r) : fmt(r)}`;
      })
      .join(', \\quad ');

    return {
      type: 'absolute_value',
      equationType: 'absolute_value',
      steps,
      finalAnswer,
      inputInterpretation: `\\text{Solve absolute value equation: } ${expressionToLatex(cleanEq)}`,
      numericRoots: validRoots,
    };
  } catch {
    return null;
  }
}

function cleanLatexMath(tex: string): string {
  let s = tex
    .replace(/\\cdot\s*([a-zA-Z])/g, '$1')
    .replace(/([0-9])\s+([a-zA-Z])/g, '$1$2')
    .replace(/\s*([+-])\s*/g, ' $1 ')
    .trim();
  if (s.startsWith('- ')) {
    s = '-' + s.slice(2);
  }
  return s;
}

function formatTermsDisplay(terms: string[]): string {
  return terms.map((t, idx) => {
    let s = t.trim();
    if (idx > 0 && !s.startsWith('+') && !s.startsWith('-')) {
      s = '+ ' + s;
    } else if (idx > 0) {
      s = s[0] + ' ' + s.slice(1);
    }
    return s;
  }).join(' ');
}

export function trySimplifyAlgebraicExpression(cleanEq: string, rawEq: string): SolverResult | null {
  if (cleanEq.includes('=')) return null;

  const reserved = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs',
    'ceil', 'floor', 'round', 'sign', 'min', 'max',
    'pi', 'PI', 'e', 'i',
    'nthRoot', 'pow', 'mod',
  ]);

  const tokens = cleanEq.match(/[a-zA-Z]+/g) || [];
  const varsFound = new Set<string>();
  for (const tok of tokens) {
    if (tok.length === 1 && !reserved.has(tok)) {
      varsFound.add(tok);
    }
  }

  const hasMultipleVars = varsFound.size > 1;
  const hasParenthesizedSigns = /\(\s*[+-]\s*\d*[a-zA-Z]?\s*\)/.test(cleanEq);
  const hasDistribution = /\d+\s*\*?\s*\([^()]+\)/.test(cleanEq);

  // If single variable and no parens / like terms, let autoInterpretEquals solve it (e.g. x^2 - 5x + 6)
  if (!hasMultipleVars && !hasParenthesizedSigns && !hasDistribution) {
    return null;
  }

  try {
    const steps: SolutionStep[] = [];
    let stepNumber = 1;

    // Helper: Split an expression into top-level terms respecting parenthesis depth
    function splitTopLevelTerms(expr: string): string[] {
      let depth = 0;
      let current = '';
      const terms: string[] = [];
      for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;

        if ((ch === '+' || ch === '-') && depth === 0 && i > 0 && expr[i - 1] !== '*' && expr[i - 1] !== '/' && expr[i - 1] !== '^') {
          if (current.trim()) terms.push(current.trim());
          current = ch;
        } else {
          current += ch;
        }
      }
      if (current.trim()) terms.push(current.trim());
      return terms;
    }

    const topTerms = splitTopLevelTerms(cleanEq);
    const expandedTermParts: string[] = [];
    const distributionSubSteps: SubStep[] = [];

    // 1. Granular Distributive Property Expansion
    for (const t of topTerms) {
      // Matches factor multiplying a parenthesized sum/difference: e.g. 2*(x - 9), +6*(-x + 2), -(x + 4), -3*(2x - 1)
      const distMatch = t.match(/^([+-]?\s*\d*(?:\.\d+)?)\s*\*?\s*\(([^()]+)\)$/);
      if (distMatch) {
        const factorRaw = distMatch[1].replace(/\s+/g, '');
        const factorNum = factorRaw === '' || factorRaw === '+' ? 1 : factorRaw === '-' ? -1 : Number(factorRaw);
        const inside = distMatch[2];
        const insideTerms = splitTopLevelTerms(inside);

        // Only treat as distributive multiplication if there are multiple inside terms or factor is not 1/-1
        if (insideTerms.length > 1 || (factorNum !== 1 && factorNum !== -1)) {
          const multPieces: string[] = [];
          const prodPieces: string[] = [];

          for (const it of insideTerms) {
            const itClean = it.trim();
            const prod = (nerdamer as any)(factorNum + '*(' + itClean + ')').toString();
            multPieces.push(`${factorNum} \\times (${cleanLatexMath((nerdamer as any)(itClean).toTeX())})`);
            prodPieces.push(cleanLatexMath((nerdamer as any)(prod).toTeX()));
            expandedTermParts.push(prod);
          }

          const expandedStr = prodPieces.join(' + ').replace(/\+\s*-/g, '- ');
          distributionSubSteps.push({
            title: `Distribute ${factorNum} across (${cleanLatexMath((nerdamer as any)(inside).toTeX())}):`,
            math: `${cleanLatexMath((nerdamer as any)(t).toTeX())} = ${multPieces.join(' + ').replace(/\+\s*-/g, '- ')} = ${expandedStr}`,
          });
          continue;
        }
      }
      expandedTermParts.push(t);
    }

    // If any distribution was performed, output the clean 3-step pedagogical solution
    if (distributionSubSteps.length > 0) {
      const combinedFlatLatex = expandedTermParts
        .map(p => cleanLatexMath((nerdamer as any)(p).toTeX()))
        .join(' + ')
        .replace(/\+\s*-/g, '- ');

      const originalLatex = expressionToLatex(cleanEq);

      // Step 1: Expand using distributive property
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Apply the distributive property $a(b + c) = ab + ac$ to distribute and expand the expression:',
        math: `\\begin{aligned} &${originalLatex} \\\\[4pt] &= ${combinedFlatLatex} \\end{aligned}`,
        subSteps: distributionSubSteps,
      });

      // Parse terms for grouping
      interface ParsedTerm {
        coeff: number;
        varPart: string;
        key: string;
        orig: string;
      }

      const parsed: ParsedTerm[] = [];
      for (const t of expandedTermParts) {
        const clean = t.replace(/\s+/g, '');
        if (!clean) continue;

        if (/^[+-]?\d+(?:\.\d+)?$/.test(clean)) {
          parsed.push({ coeff: Number(clean), varPart: '', key: '_const', orig: clean });
          continue;
        }

        const m = clean.match(/^([+-]?)(\d+(?:\.\d+)?)?\*?([a-zA-Z](?:\^[0-9]+)?)$/);
        if (m) {
          const sign = m[1] === '-' ? -1 : 1;
          const num = m[2] !== undefined ? Number(m[2]) : 1;
          parsed.push({ coeff: sign * num, varPart: m[3], key: m[3], orig: clean });
          continue;
        }

        parsed.push({ coeff: 1, varPart: clean, key: clean, orig: clean });
      }

      const groups: Record<string, ParsedTerm[]> = {};
      for (const p of parsed) {
        if (!groups[p.key]) groups[p.key] = [];
        groups[p.key].push(p);
      }

      const groupKeys = Object.keys(groups);
      groupKeys.sort((a, b) => {
        if (a === '_const') return 1;
        if (b === '_const') return -1;
        return a.localeCompare(b);
      });

      // Step 2: Group and combine like terms in one coherent step
      const groupedParts = groupKeys.map(k => {
        const items = groups[k];
        const joined = items
          .map((it, idx) => {
            const sign = it.coeff >= 0 ? (idx === 0 ? '' : '+ ') : '- ';
            const absC = Math.abs(it.coeff);
            const cStr = it.varPart ? (absC === 1 ? '' : absC.toString()) : absC.toString();
            return `${sign}${cStr}${it.varPart}`;
          })
          .join(' ');
        return `(${joined})`;
      }).join(' + ').replace(/\+\s*-/g, '- ');

      const arithmeticParts: string[] = [];
      const cancellationNotes: string[] = [];

      for (const k of groupKeys) {
        const items = groups[k];
        if (k === '_const') {
          const sum = items.reduce((acc, it) => acc + it.coeff, 0);
          arithmeticParts.push(sum >= 0 ? `+ ${sum}` : `- ${Math.abs(sum)}`);
        } else {
          const sumCoeff = items.reduce((acc, it) => acc + it.coeff, 0);
          const coeffNumbers = items.map(it => it.coeff);
          const coeffArithmetic = coeffNumbers
            .map((c, idx) => {
              const sign = c >= 0 ? (idx === 0 ? '' : '+ ') : '- ';
              return `${sign}${Math.abs(c)}`;
            })
            .join(' ');

          arithmeticParts.push(`(${coeffArithmetic})${k}`);
          if (sumCoeff === 0) {
            cancellationNotes.push(`$${k}$ terms cancel: $${coeffArithmetic} = 0$`);
          }
        }
      }

      const arithmeticLine = arithmeticParts.join(' ').replace(/^\+\s*/, '');
      const simplified = (nerdamer as any)(cleanEq).toString();
      const finalLatex = cleanLatexMath((nerdamer as any)(simplified).toTeX());

      let alignLines = `&${groupedParts} \\\\[4pt] &= ${arithmeticLine}`;
      if (cancellationNotes.length > 0) {
        alignLines += ` \\\\[4pt] &= ${finalLatex} \\quad \\text{(${cancellationNotes.join(', ')})}`;
      } else if (arithmeticLine !== finalLatex) {
        alignLines += ` \\\\[4pt] &= ${finalLatex}`;
      }

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Group like terms together and combine their coefficients:',
        math: `\\begin{aligned} ${alignLines} \\end{aligned}`,
      });

      // Step 3: Final simplified result
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Write the final simplified result:',
        math: finalLatex,
      });

      return {
        type: 'polynomial',
        steps,
        finalAnswer: finalLatex,
        inputInterpretation: `\\text{Simplify: } ${expressionToLatex(rawEq)}`,
        numericRoots: [],
      };
    } else {
      // If no distribution, check if there are simple parentheses with signs to remove (e.g. -26r+(+7r)+(-15p)+(-7p))
      let step1Expr = cleanEq
        .replace(/\+\s*\(\s*\+\s*([^()]+)\s*\)/g, ' + $1')
        .replace(/\+\s*\(\s*-\s*([^()]+)\s*\)/g, ' - $1')
        .replace(/-\s*\(\s*\+\s*([^()]+)\s*\)/g, ' - $1')
        .replace(/-\s*\(\s*-\s*([^()]+)\s*\)/g, ' + $1')
        .replace(/\(\s*\+\s*([^()]+)\s*\)/g, '$1')
        .replace(/\(\s*-\s*([^()]+)\s*\)/g, '-$1')
        .trim();
      step1Expr = step1Expr.replace(/^\+\s*/, '');

      if (step1Expr !== cleanEq.trim()) {
        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Remove parentheses and apply sign rules: $+(-a) = -a$ and $+(+a) = +a$.',
          math: cleanLatexMath(step1Expr.replace(/\*/g, '')),
        });

        // Use the terms from step1Expr
        expandedTermParts.length = 0;
        const normalized = step1Expr.replace(/\s+/g, '');
        const matched = normalized.match(/([+-]?[^+-]+)/g) || [];
        expandedTermParts.push(...matched);
      }
    }

    // 2. Parse all terms for grouping and coefficient combination
    interface ParsedTerm {
      coeff: number;
      varPart: string;
      key: string;
      orig: string;
    }

    const parsed: ParsedTerm[] = [];
    for (const t of expandedTermParts) {
      const clean = t.replace(/\s+/g, '');
      if (!clean) continue;

      if (/^[+-]?\d+(?:\.\d+)?$/.test(clean)) {
        parsed.push({ coeff: Number(clean), varPart: '', key: '_const', orig: clean });
        continue;
      }

      const m = clean.match(/^([+-]?)(\d+(?:\.\d+)?)?\*?([a-zA-Z](?:\^[0-9]+)?)$/);
      if (m) {
        const sign = m[1] === '-' ? -1 : 1;
        const num = m[2] !== undefined ? Number(m[2]) : 1;
        parsed.push({ coeff: sign * num, varPart: m[3], key: m[3], orig: clean });
        continue;
      }

      // Default fallback
      parsed.push({ coeff: 1, varPart: clean, key: clean, orig: clean });
    }

    // Group terms by variable/power
    const groups: Record<string, ParsedTerm[]> = {};
    for (const p of parsed) {
      if (!groups[p.key]) groups[p.key] = [];
      groups[p.key].push(p);
    }

    const groupKeys = Object.keys(groups);
    // Sort keys so variables are alphabetical (x, x^2, y) and constants are last
    groupKeys.sort((a, b) => {
      if (a === '_const') return 1;
      if (b === '_const') return -1;
      return a.localeCompare(b);
    });

    const hasCombineableTerms = groupKeys.some(k => groups[k].length > 1);

    if (hasCombineableTerms || distributionSubSteps.length > 0) {
      // 3. Group Like Terms Step
      const groupedLatexParts = groupKeys.map(k => {
        const items = groups[k];
        const joined = items
          .map((it, idx) => {
            const sign = it.coeff >= 0 ? (idx === 0 ? '' : '+ ') : '- ';
            const absC = Math.abs(it.coeff);
            const cStr = it.varPart ? (absC === 1 ? '' : absC.toString()) : absC.toString();
            return `${sign}${cStr}${it.varPart}`;
          })
          .join(' ');
        const label = k === '_const' ? '\\text{Constants: }' : `\\text{Group } ${k}\\text{ terms: }`;
        return `${label}(${joined})`;
      }).join(' \\quad ');

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Group like terms containing the same variables together.',
        math: groupedLatexParts,
      });

      // 4. Coefficient Arithmetic Step per variable / constant group
      for (const k of groupKeys) {
        const items = groups[k];
        const label = k === '_const' ? '\\text{constants}' : k;
        if (k === '_const') {
          const sum = items.reduce((acc, it) => acc + it.coeff, 0);
          const coeffStr = items
            .map((it, idx) => {
              const sign = it.coeff >= 0 ? (idx === 0 ? '' : '+ ') : '- ';
              return `${sign}${Math.abs(it.coeff)}`;
            })
            .join(' ');

          let constMath = `${coeffStr} = ${sum}`;
          if (sum === 0 && items.length > 1) {
            const canceledConst = items
              .map((it, idx) => {
                const sign = it.coeff >= 0 ? (idx === 0 ? '' : '+ ') : '- ';
                return `${sign}\\cancel{${Math.abs(it.coeff)}}`;
              })
              .join(' ');
            constMath = `${canceledConst} = ${coeffStr} = 0 \\quad \\text{(constants cancel out completely)}`;
          }

          steps.push({
            stepNumber: stepNumber++,
            explanation: `Combine coefficients for like terms in $${label}$:`,
            math: constMath,
          });
        } else {
          const sumCoeff = items.reduce((acc, it) => acc + it.coeff, 0);
          const coeffNumbers = items.map(it => it.coeff);
          const coeffArithmetic = coeffNumbers
            .map((c, idx) => {
              const sign = c >= 0 ? (idx === 0 ? '' : '+ ') : '- ';
              return `${sign}${Math.abs(c)}`;
            })
            .join(' ');

          let explanationMath = `(${coeffArithmetic})${k} = ${sumCoeff}${k}`;
          if (sumCoeff === 0) {
            const canceledTerms = items
              .map((it, idx) => {
                const sign = it.coeff >= 0 ? (idx === 0 ? '' : '+ ') : '- ';
                const absC = Math.abs(it.coeff);
                const cStr = it.varPart ? (absC === 1 ? '' : absC.toString()) : absC.toString();
                return `${sign}\\cancel{${cStr}${it.varPart}}`;
              })
              .join(' ');

            explanationMath = `${canceledTerms} = (${coeffArithmetic})${k} = \\cancel{0${k}} = 0 \\quad \\text{(${k} terms cancel out completely)}`;
          }

          steps.push({
            stepNumber: stepNumber++,
            explanation: `Combine coefficients for like terms in $${label}$:`,
            math: explanationMath,
          });
        }
      }
    }

    // 5. Final simplified expression
    const simplified = (nerdamer as any)(cleanEq).toString();
    const finalLatex = cleanLatexMath((nerdamer as any)(simplified).toTeX());

    steps.push({
      stepNumber: stepNumber++,
      explanation: 'Combine all simplified terms to get the final simplified expression.',
      math: finalLatex,
    });

    return {
      type: 'polynomial',
      steps,
      finalAnswer: finalLatex,
      inputInterpretation: `\\text{Simplify: } ${expressionToLatex(rawEq)}`,
      numericRoots: [],
    };
  } catch (err) {
    return null;
  }
}

// ─── Variable-Free Arithmetic Equality Solver ───────────────────────────────

function trySolveVariableFreeEquation(cleanEq: string, originalEq: string): SolverResult | null {
  if (!cleanEq.includes('=')) return null;
  const parts = cleanEq.split('=');
  if (parts.length !== 2) return null;

  const [lhs, rhs] = parts;
  const reservedLetters = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs', 'pi', 'e', 'i']);
  const tokens = (cleanEq.match(/[a-zA-Z]+/g) || []).filter(t => !reservedLetters.has(t.toLowerCase()));
  if (tokens.length > 0) return null; // Has variables, not variable-free

  try {
    const lhsVal = math.evaluate(lhs.trim());
    const rhsVal = math.evaluate(rhs.trim());

    if (typeof lhsVal !== 'number' || typeof rhsVal !== 'number' || !Number.isFinite(lhsVal) || !Number.isFinite(rhsVal)) {
      return null;
    }

    const lhsFmt = fmtFraction(lhsVal);
    const rhsFmt = fmtFraction(rhsVal);
    const isTrue = Math.abs(lhsVal - rhsVal) < 1e-9;
    const finalAnswer = isTrue
      ? `${lhsFmt} = ${rhsFmt} \\implies \\text{True}`
      : `${lhsFmt} = ${rhsFmt} \\implies \\text{False}`;

    const lhsLatex = expressionToLatex(lhs.trim());
    const rhsLatex = expressionToLatex(rhs.trim());

    const steps: SolutionStep[] = [
      {
        stepNumber: 1,
        explanation: 'Evaluate the arithmetic expression on the left-hand side (LHS).',
        math: `\\text{LHS} = ${lhsLatex} = ${lhsFmt}`,
      },
      {
        stepNumber: 2,
        explanation: 'Evaluate the arithmetic expression on the right-hand side (RHS).',
        math: `\\text{RHS} = ${rhsLatex} = ${rhsFmt}`,
      },
      {
        stepNumber: 3,
        explanation: isTrue
          ? 'Compare the two sides: both sides evaluate to the exact same value.'
          : 'Compare the two sides: the left-hand side does not equal the right-hand side.',
        math: isTrue
          ? `${lhsFmt} = ${rhsFmt} \\quad (\\text{Statement is True})`
          : `${lhsFmt} \\neq ${rhsFmt} \\quad (\\text{Statement is False})`,
      },
    ];

    return {
      type: 'polynomial',
      equationType: 'arithmetic_check',
      steps,
      finalAnswer,
      inputInterpretation: `\\text{Arithmetic Equality Check: } ${lhsLatex} = ${rhsLatex}`,
      rawEquation: originalEq,
    };
  } catch {
    return null;
  }
}

// ─── Two-Variable Linear Equation Solver ────────────────────────────────────

function trySolveTwoVariableLinearEquation(cleanEq: string, originalEq: string): SolverResult | null {
  if (!cleanEq.includes('=')) return null;
  const parts = cleanEq.split('=');
  if (parts.length !== 2) return null;

  const reservedLetters = new Set(['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs', 'pi', 'e', 'i']);
  const tokens = (cleanEq.match(/[a-zA-Z]+/g) || []).filter(t => !reservedLetters.has(t.toLowerCase()) && t.length === 1);
  const distinctVars = Array.from(new Set(tokens));

  // Must have exactly two distinct variables (e.g. x and y)
  if (distinctVars.length !== 2) return null;

  // Make sure neither variable is in an exponent, power >= 2, or radical/trig/log
  if (/\^[2-9]|\^\([^)]+\)|sqrt|cbrt|\/|sin|cos|tan|log|ln|exp/i.test(cleanEq)) return null;

  const vX = distinctVars.includes('x') ? 'x' : distinctVars[0];
  const vY = distinctVars.includes('y') ? 'y' : distinctVars.find(v => v !== vX) || distinctVars[1];

  try {
    const [lhsStr, rhsStr] = parts;
    const exprStandard = `(${lhsStr}) - (${rhsStr})`;
    const compiled = math.compile(exprStandard);

    const f00 = Number(compiled.evaluate({ [vX]: 0, [vY]: 0 }));
    const f10 = Number(compiled.evaluate({ [vX]: 1, [vY]: 0 }));
    const f01 = Number(compiled.evaluate({ [vX]: 0, [vY]: 1 }));
    const f11 = Number(compiled.evaluate({ [vX]: 1, [vY]: 1 }));

    const A = f10 - f00;
    const B = f01 - f00;
    const C = f00;

    // Linearity check
    if (Math.abs(f11 - (A + B + C)) > 1e-5) return null;
    if (Math.abs(A) < 1e-9 || Math.abs(B) < 1e-9) return null;

    const slope = -A / B;
    const yIntercept = -C / B;
    const xIntercept = -C / A;

    const slopeFmt = fmtFraction(slope);
    const yIntFmt = fmtFraction(yIntercept);
    const xIntFmt = fmtFraction(xIntercept);

    const yLatex = slope === 1 ? `${vX}` : slope === -1 ? `-${vX}` : `${slopeFmt}${vX}`;
    const yConstSign = yIntercept >= 0 ? `+ ${fmtFraction(Math.abs(yIntercept))}` : `- ${fmtFraction(Math.abs(yIntercept))}`;
    const slopeInterceptEq = `${vY} = ${yLatex} ${yIntercept !== 0 ? yConstSign : ''}`.trim();

    const invSlope = -B / A;
    const invSlopeFmt = fmtFraction(invSlope);
    const xLatex = invSlope === 1 ? `${vY}` : invSlope === -1 ? `-${vY}` : `${invSlopeFmt}${vY}`;
    const xConstSign = xIntercept >= 0 ? `+ ${fmtFraction(Math.abs(xIntercept))}` : `- ${fmtFraction(Math.abs(xIntercept))}`;
    const xInTermsOfY = `${vX} = ${xLatex} ${xIntercept !== 0 ? xConstSign : ''}`.trim();

    const steps: SolutionStep[] = [
      {
        stepNumber: 1,
        explanation: `Identify as a linear equation in two variables ($${vX}$ and $${vY}$) and convert to standard form $Ax + By = C$.`,
        math: `${fmt(A)}${vX} ${B >= 0 ? '+' : '-'} ${fmt(Math.abs(B))}${vY} = ${fmt(-C)}`,
      },
      {
        stepNumber: 2,
        explanation: 'Calculate the slope $m$ and the coordinate axis intercepts.',
        math: `\\begin{aligned} \\text{Slope } m: \\quad & m = -\\frac{A}{B} = ${slopeFmt} \\\\[4pt] \\text{y-intercept } (0, y): \\quad & \\left(0, \\; ${yIntFmt}\\right) \\\\[4pt] \\text{x-intercept } (x, 0): \\quad & \\left(${xIntFmt}, \\; 0\\right) \\end{aligned}`,
      },
      {
        stepNumber: 3,
        explanation: `Solve for $${vY}$ in terms of $${vX}$ (slope-intercept form):`,
        math: slopeInterceptEq,
      },
      {
        stepNumber: 4,
        explanation: `Solve for $${vX}$ in terms of $${vY}$:`,
        math: xInTermsOfY,
      },
    ];

    const finalAnswer = `${slopeInterceptEq} \\quad \\left(m = ${slopeFmt},\\; \\text{y-int} = ${yIntFmt},\\; \\text{x-int} = ${xIntFmt}\\right)`;

    return {
      type: 'polynomial',
      equationType: 'linear_2var',
      steps,
      finalAnswer,
      inputInterpretation: `\\text{Two-Variable Linear Equation: } ${expressionToLatex(cleanEq)}`,
      rawEquation: originalEq,
    };
  } catch {
    return null;
  }
}

// ─── Main Solver Functions ──────────────────────────────────────────────────

function _solvePolynomialRaw(equation: string, method: QuadraticMethod = 'auto'): SolverResult {
  const hadEquals = equation.includes('=');
  let cleanEq = equation.trim();
  cleanEq = autoBalanceParens(cleanEq);
  cleanEq = normalizeExpression(cleanEq);

  // 1. Variable-free arithmetic equality check (e.g. 3 = 1 - 2(-7))
  const varFreeResult = trySolveVariableFreeEquation(cleanEq, equation);
  if (varFreeResult) {
    return varFreeResult;
  }

  // 2. Radical simplification without = (e.g. sqrt(50) -> 5\sqrt{2})
  if (!hadEquals) {
    const radicalResult = trySimplifyRadicalExpression(cleanEq, equation);
    if (radicalResult) {
      return radicalResult;
    }
  }

  // 3. Pure arithmetic without = and no variables (e.g. 8/(2/3))
  const reservedWords = new Set([
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'log', 'ln', 'exp', 'sqrt', 'abs', 'ceil', 'floor', 'round', 'sign',
    'pi', 'PI', 'e', 'i', 'nthRoot', 'pow', 'mod'
  ]);
  const varTokens = cleanEq.match(/[a-zA-Z]+/g) || [];
  const hasVariable = varTokens.some(tok => tok.length === 1 && !reservedWords.has(tok));

  if (!hadEquals && !hasVariable) {
    let evalVal: number;
    try {
      evalVal = Number(math.evaluate(cleanEq));
    } catch {
      try {
        evalVal = Number((nerdamer as any)(cleanEq).evaluate().text());
      } catch {
        evalVal = NaN;
      }
    }
    if (!isNaN(evalVal) && isFinite(evalVal)) {
      const frac = toFraction(evalVal);
      const exactStr = frac && frac.d > 1 ? fmtFraction(evalVal) : fmt(evalVal);
      const decStr = frac && frac.d > 1 ? fmt(evalVal) : undefined;
      return {
        type: 'arithmetic',
        equationType: 'arithmetic',
        steps: [
          {
            stepNumber: 1,
            explanation: 'Evaluate the arithmetic expression following standard order of operations (PEMDAS):',
            math: `${expressionToLatex(equation)} = ${exactStr}`,
          },
        ],
        finalAnswer: exactStr,
        decimalAnswer: decStr,
        numericRoots: [evalVal],
        inputInterpretation: `\\text{Evaluate arithmetic expression: } ${expressionToLatex(equation)}`,
      };
    }
  }

  // 3. Two-variable linear equation (e.g. y = 10 - 3x, 3x + 2y = 12)
  const twoVarResult = trySolveTwoVariableLinearEquation(cleanEq, equation);
  if (twoVarResult) {
    return twoVarResult;
  }

  // 4. Function / curve root solving notation: y = f(x) or f(x) = ... to solve for roots / x-intercepts
  // (Note: two-variable linear equations like y = 10 - 3x have already been handled above)
  if (/^(?:y|f\s*\(\s*[a-zA-Z]\s*\))\s*=/i.test(cleanEq)) {
    const rhsPart = cleanEq.replace(/^(?:y|f\s*\(\s*[a-zA-Z]\s*\))\s*=/i, '').trim();
    if (/[a-zA-Z]/.test(rhsPart)) {
      cleanEq = `${rhsPart} = 0`;
    }
  }

  // If expression without = contains radicals or rational expressions, simplify directly
  if (!cleanEq.includes('=')) {
    const rationalResult = trySimplifyRationalExpression(cleanEq, equation);
    if (rationalResult) {
      return rationalResult;
    }

    const algebraicResult = trySimplifyAlgebraicExpression(cleanEq, equation);
    if (algebraicResult) {
      return algebraicResult;
    }

    // Algebraic expressions without = that have like terms or parentheses to simplify (e.g. (7x^(2)-2x)+(4x^(2)-x))
    if (hasVariable) {
      const varName = detectVariable(cleanEq);
      const polyNoEq = extractCoefficients(cleanEq, varName);
      if (polyNoEq && polyNoEq.degree >= 1) {
        const simplifiedPolyStr = formatPolynomial(polyNoEq.coeffs, varName);
        const isAlreadyCanonical = cleanEq.replace(/[\s*()]/g, '') === simplifiedPolyStr.replace(/[\s*()]/g, '');
        if (!isAlreadyCanonical) {
          let rootsStr = '';
          const numRoots: number[] = [];
          if (polyNoEq.degree === 1) {
            const [a, b] = polyNoEq.coeffs;
            const r = -b / a;
            numRoots.push(r);
            const f = toFraction(r);
            rootsStr = `${varName} = ${f && f.d > 1 ? fmtFraction(r) : fmt(r)}`;
          } else if (polyNoEq.degree === 2) {
            const [a, b, c] = polyNoEq.coeffs;
            const d = b * b - 4 * a * c;
            if (d >= 0) {
              const sqD = Math.sqrt(d);
              const r1 = (-b - sqD) / (2 * a);
              const r2 = (-b + sqD) / (2 * a);
              const sorted = [r1, r2].sort((x, y) => x - y);
              numRoots.push(sorted[0]);
              const f1 = toFraction(sorted[0]);
              const d1 = f1 && f1.d > 1 ? fmtFraction(sorted[0]) : fmt(sorted[0]);
              if (Math.abs(r1 - r2) < 1e-8) {
                rootsStr = `${varName} = ${d1}`;
              } else {
                numRoots.push(sorted[1]);
                const f2 = toFraction(sorted[1]);
                const d2 = f2 && f2.d > 1 ? fmtFraction(sorted[1]) : fmt(sorted[1]);
                rootsStr = `${varName} = ${d1}, \\; ${d2}`;
              }
            }
          }

          const steps: SolutionStep[] = [
            {
              stepNumber: 1,
              explanation: 'Expand parentheses and combine like terms by grouping coefficients of matching powers:',
              math: `\\begin{aligned} &${expressionToLatex(equation)} \\\\[4pt] &= ${simplifiedPolyStr} \\end{aligned}`,
            },
            {
              stepNumber: 2,
              explanation: 'Write the final simplified polynomial expression:',
              math: simplifiedPolyStr,
            },
          ];

          if (rootsStr) {
            steps.push({
              stepNumber: 3,
              explanation: `If setting the simplified expression equal to zero ($${simplifiedPolyStr} = 0$), solve for roots:`,
              math: `\\text{If set } = 0: \\quad ${rootsStr}`,
            });
          }

          return {
            type: 'polynomial',
            equationType: polyNoEq.degree === 1 ? 'linear' : polyNoEq.degree === 2 ? 'quadratic' : 'polynomial',
            steps,
            finalAnswer: simplifiedPolyStr,
            numericRoots: numRoots,
            inputInterpretation: `\\text{Simplify: } ${expressionToLatex(equation)}`,
          };
        }
      }
    }
  }

  // If equation WITH = is a rational equation (contains fractions with variables in denominator)
  if (cleanEq.includes('=')) {
    const rationalEqResult = trySolveRationalEquation(cleanEq, equation);
    if (rationalEqResult) {
      return rationalEqResult;
    }

    const radicalEqResult = trySolveRadicalEquation(cleanEq, equation);
    if (radicalEqResult) {
      return radicalEqResult;
    }

    const absEqResult = trySolveAbsoluteValueEquation(cleanEq, equation);
    if (absEqResult) {
      return absEqResult;
    }
  }

  // Check if this is an Ordinary Differential Equation (ODE)
  if (detectODE(cleanEq).isODE) {
    try {
      return solveODE(cleanEq);
    } catch {
      // fall through
    }
  }

  // Auto-interpret expression without = as = 0
  const interpretation = autoInterpretEquals(cleanEq);
  if (interpretation.interpreted) {
    cleanEq = interpretation.expr;
  }

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

  // Check if auto-interpreted expression is an Absolute Value Equation
  if (cleanEq.includes('=')) {
    const absEqResult = trySolveAbsoluteValueEquation(cleanEq, equation);
    if (absEqResult) {
      if (interpretation.interpreted) {
        absEqResult.inputInterpretation = `\\text{Interpreted as: } ${cleanEq.replace(/\*/g, '')} \\text{. Solve for } ${detectVariable(cleanEq)}`;
      }
      return absEqResult;
    }
  }

  // Check if this is a U-Substitution (Quadratic-in-Disguise) Equation
  // Non-polynomial equations with trig, exp, log, radical functions (e.g. 2sin^2(x) - 3sin(x) + 1 = 0, (ln(x))^2 - 3ln(x) + 2 = 0, x - 5sqrt(x) + 6 = 0)
  const isPurePolynomial = !/(?:sin|cos|tan|sec|csc|cot|log|ln|sqrt|exp)\b/i.test(cleanEq) &&
    !/(?:\^x|\^\([^)]*x[^)]*\)|e\^)/i.test(cleanEq);
  if (!isPurePolynomial) {
    const uSubResult = trySolveUSubstitutionEquation(cleanEq, equation);
    if (uSubResult) {
      if (interpretation.interpreted) {
        const suffix = uSubResult.type === 'trigonometric' ? ' \\text{ on } [0, 2\\pi)' : '';
        uSubResult.inputInterpretation = `\\text{Interpreted as: } ${cleanEq.replace(/\*/g, '')} \\text{. Solve for } ${detectVariable(cleanEq)}${suffix}`;
      }
      return uSubResult;
    }
  }

  // Check if this is an Exponential Equation (e.g. 3^(2x+1) - 10*3^x + 3 = 0, 4^x - 3*2^x + 2 = 0)
  const exponentialResult = trySolveExponentialEquation(cleanEq, equation);
  if (exponentialResult) {
    if (interpretation.interpreted) {
      exponentialResult.inputInterpretation = `\\text{Interpreted as: } ${cleanEq.replace(/\*/g, '')} \\text{. Solve for } ${detectVariable(cleanEq)}`;
    }
    return exponentialResult;
  }

  // Check if this is a Logarithmic Equation (e.g. log_2(x-1) + log_2(x+1) = 3)
  const logarithmicResult = trySolveLogarithmicEquation(cleanEq, equation);
  if (logarithmicResult) {
    if (interpretation.interpreted) {
      logarithmicResult.inputInterpretation = `\\text{Interpreted as: } ${cleanEq.replace(/\*/g, '')} \\text{. Solve for } ${detectVariable(cleanEq)}`;
    }
    return logarithmicResult;
  }

  // Check if this is a Trigonometric Equation (e.g. 2sin^2(x) - 3sin(x) + 1 = 0, cos(2x) + sin(x) = 0, tan(x) + cot(x) = 2)
  const trigResult = trySolveTrigonometricEquation(cleanEq, equation);
  if (trigResult) {
    if (interpretation.interpreted) {
      trigResult.inputInterpretation = `\\text{Interpreted as: } ${cleanEq.replace(/\*/g, '')} \\text{. Solve for } ${detectVariable(cleanEq)} \\text{ on } [0, 2\\pi)`;
    }
    return trigResult;
  }

  // Check if this is a Transcendental Equation
  if (detectTranscendental(cleanEq).isTranscendental && cleanEq.includes('=')) {
    try {
      return solveTranscendental(cleanEq);
    } catch {
      // fall through to algebraic solver
    }
  }

  // Check if this is a parametric equation (e.g. 2x^2 + 3x - m + 2 = 0)
  if (detectParametricEquation(cleanEq).isParametric) {
    try {
      return solveParametricEquation(cleanEq);
    } catch {
      // fall through to standard numeric/symbolic solver
    }
  }

  const variable = detectVariable(cleanEq);
  const hasSubscripts = /[a-zA-Z]_\d+/.test(cleanEq);
  
  // Generate input interpretation string
  const displayEq = cleanEq
    .replace(/\*/g, '')
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/\^(\([^)]+\))/g, '^{$1}');
  const interpretationLatex = interpretation.interpreted
    ? `\\text{Interpreted as: } ${displayEq} \\text{. Solve for } ${variable} \\text{ over } \\mathbb{R} \\text{ and } \\mathbb{C}`
    : `\\text{Solve } ${displayEq} \\text{ for variable } ${variable} \\text{ over } \\mathbb{R} \\text{ and } \\mathbb{C}`;

  // Normalize equation to "LHS - RHS" standard form
  let [lhs, rhs] = cleanEq.split('=');
  let standardExpr = '';
  if (rhs !== undefined && rhs.trim() !== '') {
    standardExpr = `(${lhs.trim()}) - (${rhs.trim()})`;
  } else {
    standardExpr = lhs.trim();
  }

  const lhsTrim = lhs ? lhs.trim() : '';
  const rhsTrim = rhs !== undefined ? rhs.trim() : '';
  const lhsPoly = lhsTrim ? extractCoefficients(lhsTrim, variable) : null;
  const rhsPoly = rhsTrim && rhsTrim !== '0' ? extractCoefficients(rhsTrim, variable) : null;
  const equationSides = {
    lhs: lhsTrim,
    rhs: rhsTrim,
    lhsCoeffs: lhsPoly?.coeffs,
    rhsCoeffs: rhsPoly?.coeffs,
    rawEquation: equation,
  };

  // Extract exact polynomial coefficients and degree
  const poly = extractCoefficients(standardExpr, variable);

  if (poly && poly.degree === 0) {
    const [b] = poly.coeffs;
    if (Math.abs(b) < 1e-9) {
      const steps: SolutionStep[] = [
        {
          stepNumber: 1,
          explanation: 'Subtract the right-hand side from both sides and combine like terms:',
          math: `\\begin{aligned} \\text{Given equation:} \\quad & ${expressionToLatex(lhsTrim)} = ${expressionToLatex(rhsTrim || '0')} \\\\[4pt] \\text{Move all terms to LHS:} \\quad & (${expressionToLatex(lhsTrim)}) - (${expressionToLatex(rhsTrim || '0')}) = 0 \\\\[4pt] \\text{Combine like terms:} \\quad & 0 = 0 \\end{aligned}`,
        },
        {
          stepNumber: 2,
          explanation: 'Analyze the resulting statement:',
          math: `0 = 0 \\quad \\text{is an identity that is true for all real values of } ${variable}.`,
        },
        {
          stepNumber: 3,
          explanation: 'State the final solution set:',
          math: `${variable} \\in \\mathbb{R} \\quad \\text{(All real numbers)}`,
        },
      ];
      return {
        type: 'polynomial',
        equationType: 'linear',
        steps,
        finalAnswer: '\\text{All real numbers}',
        numericRoots: [],
        inputInterpretation: interpretationLatex,
      };
    } else {
      const bStr = fmt(b);
      const steps: SolutionStep[] = [
        {
          stepNumber: 1,
          explanation: 'Subtract the right-hand side from both sides and combine like terms:',
          math: `\\begin{aligned} \\text{Given equation:} \\quad & ${expressionToLatex(lhsTrim)} = ${expressionToLatex(rhsTrim || '0')} \\\\[4pt] \\text{Move all terms to LHS:} \\quad & (${expressionToLatex(lhsTrim)}) - (${expressionToLatex(rhsTrim || '0')}) = 0 \\\\[4pt] \\text{Combine like terms:} \\quad & ${bStr} = 0 \\end{aligned}`,
        },
        {
          stepNumber: 2,
          explanation: 'Analyze the resulting statement:',
          math: `${bStr} = 0 \\quad \\text{is a contradiction (false for all values of } ${variable}).`,
        },
        {
          stepNumber: 3,
          explanation: 'Conclude that no value of $' + variable + '$ satisfies the equation:',
          math: '\\text{No solution } (\\emptyset)',
        },
      ];
      return {
        type: 'polynomial',
        equationType: 'linear',
        steps,
        finalAnswer: '\\text{No solution}',
        numericRoots: [],
        inputInterpretation: interpretationLatex,
      };
    }
  }

  if (poly && poly.degree >= 1) {
    const { degree, coeffs } = poly;

    // ─── DEGREE 1 (LINEAR): ax + b = 0 ──────────────────────────────────────
    if (degree === 1) {
      const [a, b] = coeffs;
      const rootVal = -b / a;
      const frac = toFraction(rootVal);
      const steps = generateLinearSteps(a, b, variable, equationSides);
      return {
        type: 'polynomial',
        equationType: 'linear',
        steps,
        finalAnswer: `${variable} = ${frac && frac.d > 1 ? fmtFraction(rootVal) : fmt(rootVal)}`,
        decimalAnswer: frac && frac.d > 1 ? `${variable} = ${fmt(rootVal)}` : undefined,
        numericRoots: [rootVal],
        inputInterpretation: interpretationLatex,
      };
    }

    // ─── DEGREE 2 (QUADRATIC): ax^2 + bx + c = 0 ────────────────────────────
    if (degree === 2) {
      const [a, b, c] = coeffs;
      const steps = generateQuadraticSteps(a, b, c, variable, method, equationSides);
      const delta = b * b - 4 * a * c;
      let finalAnswer = '';
      let decimalAnswer: string | undefined = undefined;
      const numericRoots: number[] = [];

      if (delta >= 0) {
        const rootDelta = Math.sqrt(delta);
        const x1 = (-b + rootDelta) / (2 * a);
        const x2 = (-b - rootDelta) / (2 * a);
        if (Math.abs(delta) < 1e-8) {
          numericRoots.push(x1);
          const frac1 = toFraction(x1);
          finalAnswer = `${variable} = ${frac1 && frac1.d > 1 ? fmtFraction(x1) : fmt(x1)}`;
          if (frac1 && frac1.d > 1) {
            decimalAnswer = `${variable} = ${fmt(x1)}`;
          }
        } else {
          const sorted = [x1, x2].sort((n1, n2) => n1 - n2);
          numericRoots.push(sorted[0], sorted[1]);
          const frac1 = toFraction(sorted[0]);
          const frac2 = toFraction(sorted[1]);
          const disp1 = frac1 && frac1.d > 1 ? fmtFraction(sorted[0]) : fmt(sorted[0]);
          const disp2 = frac2 && frac2.d > 1 ? fmtFraction(sorted[1]) : fmt(sorted[1]);
          finalAnswer = `${variable}_1 = ${disp1}, \\quad ${variable}_2 = ${disp2}`;
          decimalAnswer = `${variable}_1 = ${fmt(sorted[0])}, \\quad ${variable}_2 = ${fmt(sorted[1])}`;
        }
      } else {
        const realPart = -b / (2 * a);
        const imagPart = Math.sqrt(-delta) / (2 * Math.abs(a));
        
        const fracRe = toFraction(realPart);
        const fracIm = toFraction(imagPart);
        const dispRe = fracRe && fracRe.d > 1 ? fmtFraction(realPart) : fmt(realPart);
        const dispIm = fracIm && fracIm.d > 1 ? fmtFraction(imagPart) : fmt(imagPart);
        
        const realStr = Math.abs(realPart) < 1e-6 ? '' : `${dispRe} \\pm `;
        const pmStr = Math.abs(realPart) < 1e-6 ? '\\pm ' : '';
        const imStr = Math.abs(imagPart - 1) < 1e-6 ? 'i' : `${dispIm}\\,i`;
        finalAnswer = `${variable} = ${realStr}${pmStr}${imStr}`;
      }

      return {
        type: 'polynomial',
        equationType: 'quadratic',
        steps,
        finalAnswer,
        decimalAnswer,
        numericRoots,
        inputInterpretation: interpretationLatex,
        quadraticMethod: method,
      };
    }

    // ─── DEGREE 3 (CUBIC): ax^3 + bx^2 + cx + d = 0 ─────────────────────────
    if (degree === 3) {
      const [a, b, c, d] = coeffs;
      const roots = solvePolynomialNumerical(coeffs);
      const steps = generateCubicSteps(a, b, c, d, roots, variable, equationSides);
      const { exact, decimal, numericRoots } = formatFinalRoots(roots, variable, hasSubscripts);
      return {
        type: 'polynomial',
        equationType: 'polynomial',
        steps,
        finalAnswer: exact,
        decimalAnswer: decimal,
        numericRoots,
        inputInterpretation: interpretationLatex,
      };
    }

    // ─── DEGREE 4 (QUARTIC): ax^4 + bx^3 + cx^2 + dx + e = 0 ────────────────
    if (degree === 4) {
      const roots = solvePolynomialNumerical(coeffs);
      const steps = generateQuarticSteps(coeffs, roots, variable, equationSides);
      const { exact, decimal, numericRoots } = formatFinalRoots(roots, variable, hasSubscripts);
      return {
        type: 'polynomial',
        equationType: 'polynomial',
        steps,
        finalAnswer: exact,
        decimalAnswer: decimal,
        numericRoots,
        inputInterpretation: interpretationLatex,
      };
    }

    // ─── DEGREE 5+ (HIGHER ORDER): ax^n + ... = 0 (Abel–Ruffini) ────────────
    if (degree >= 5) {
      const roots = solvePolynomialNumerical(coeffs);
      const steps = generateDegree5PlusSteps(coeffs, roots, variable, equationSides);
      const { exact, decimal, numericRoots } = formatFinalRoots(roots, variable, hasSubscripts);
      return {
        type: 'polynomial',
        steps,
        finalAnswer: exact,
        decimalAnswer: decimal,
        numericRoots,
        inputInterpretation: interpretationLatex,
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
        inputInterpretation: interpretationLatex,
      };
    }
  } catch {
    // fall through
  }

  // Attempt transcendental numerical Newton-Raphson ONLY if transcendental functions are detected
  if (detectTranscendental(cleanEq).isTranscendental) {
    try {
      return solveTranscendental(cleanEq, variable);
    } catch {
      // fall through
    }
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
    inputInterpretation: interpretationLatex,
  };
}

export function solvePolynomial(equation: string, method: QuadraticMethod = 'auto'): SolverResult {
  const primaryVar = detectVariable(equation);
  const detectedClassification = classifyEquation(equation, primaryVar);
  const res = _solvePolynomialRaw(equation, method);
  if (!res.equationType) {
    res.equationType = (res.type && res.type !== 'polynomial' ? res.type : detectedClassification) as any;
  }
  const nonPolyTypes = ['trigonometric', 'logarithmic', 'exponential', 'rational', 'radical', 'absolute_value', 'system', 'ode'];
  if (nonPolyTypes.includes(detectedClassification)) {
    res.type = detectedClassification as any;
  }
  return res;
}

export function solveSystem(equations: string[], variables: string[]): SolverResult {
  const vars = variables.length > 0 ? variables : ['x', 'y'];

  // Check if system contains nonlinear equations (circles, parabolas, product terms, etc.)
  if (isNonlinearSystem(equations)) {
    try {
      return solveNonlinearSystem(equations, vars);
    } catch {
      // fall back to linear approximation if possible
    }
  }

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
    } else {
      const detX = vecB[0] * matA[1][1] - vecB[1] * matA[0][1];
      const detY = matA[0][0] * vecB[1] - matA[1][0] * vecB[0];
      if (Math.abs(detX) < 1e-9 && Math.abs(detY) < 1e-9) {
        return { type: 'system', steps, finalAnswer: '\\text{Infinitely many solutions}' };
      } else {
        return { type: 'system', steps, finalAnswer: '\\text{No solution}' };
      }
    }
  }

  // 3x3 and larger: Gaussian elimination
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

    let isDependent = false;
    for (let row = 0; row < n; row++) {
      let allZeros = true;
      for (let col = 0; col < n; col++) {
        if (Math.abs(aug[row][col]) > 1e-12) allZeros = false;
      }
      if (allZeros) {
        if (Math.abs(aug[row][n]) > 1e-12) {
          return { type: 'system', steps, finalAnswer: '\\text{No solution}' };
        } else {
          isDependent = true;
        }
      }
    }

    if (isDependent) {
      return { type: 'system', steps, finalAnswer: '\\text{Infinitely many solutions}' };
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
    finalAnswer: '\\text{No solution}',
  };
}

export function solveInequality(inequality: string): SolverResult {
  let cleanIneq = autoBalanceParens(inequality.trim());
  cleanIneq = normalizeExpression(cleanIneq);
  
  let rel = '>';
  if (cleanIneq.includes('>=')) rel = '>=';
  else if (cleanIneq.includes('<=')) rel = '<=';
  else if (cleanIneq.includes('>')) rel = '>';
  else if (cleanIneq.includes('<')) rel = '<';

  const [lhs, rhs] = cleanIneq.split(rel);
  const diffExpr = `(${lhs}) - (${rhs || 0})`;
  const variable = detectVariable(diffExpr);
  
  // Generate interpretation
  const relLatex = rel === '>=' ? '\\geq' : rel === '<=' ? '\\leq' : rel;
  const displayLhs = lhs.trim().replace(/\*/g, '').replace(/\^(\d+)/g, '^{$1}');
  const displayRhs = (rhs || '0').trim().replace(/\*/g, '').replace(/\^(\d+)/g, '^{$1}');
  const interpretationLatex = `\\text{Solve } ${displayLhs} ${relLatex} ${displayRhs} \\text{ for variable } ${variable}`;

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
        inputInterpretation: interpretationLatex,
      };
    }

    if (poly && poly.degree === 2) {
      const [a, b, c] = poly.coeffs;
      const delta = b * b - 4 * a * c;
      if (delta >= 0) {
        let r1 = (-b - Math.sqrt(delta)) / (2 * a);
        let r2 = (-b + Math.sqrt(delta)) / (2 * a);
        if (r1 > r2) [r1, r2] = [r2, r1];
        const fmtVal = (v: number) => (Number.isInteger(v) ? v.toString() : v.toFixed(4));
        const openOrClosed = rel.includes('=') ? ['\\leq', '\\geq'] : ['<', '>'];

        let latex: string;
        if (a > 0) {
          if (rel === '>' || rel === '>=') {
            latex = `${variable} ${openOrClosed[0]} ${fmtVal(r1)} \\quad \\text{or} \\quad ${variable} ${openOrClosed[1]} ${fmtVal(r2)}`;
          } else {
            latex = `${fmtVal(r1)} ${openOrClosed[0]} ${variable} ${openOrClosed[0]} ${fmtVal(r2)}`;
          }
        } else {
          if (rel === '>' || rel === '>=') {
            latex = `${fmtVal(r1)} ${openOrClosed[0]} ${variable} ${openOrClosed[0]} ${fmtVal(r2)}`;
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
          inputInterpretation: interpretationLatex,
        };
      }
    }

    const steps = generateInequalitySteps(poly?.coeffs || [1, 0, 0], 'general');
    return {
      type: 'inequality',
      steps,
      finalAnswer: steps[steps.length - 1]?.math || `${variable} \\in \\mathbb{R}`,
      inputInterpretation: interpretationLatex,
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
      inputInterpretation: interpretationLatex,
    };
  }
}

export function solveSymbolic(equation: string, solveFor: string): SolverResult {
  const target = (solveFor || 'x').trim();
  let cleanEq = autoBalanceParens(equation.trim());
  cleanEq = normalizeExpression(cleanEq);
  const [lhs, rhs] = cleanEq.includes('=') ? cleanEq.split('=') : [cleanEq, '0'];
  const standardExpr = `(${lhs}) - (${rhs})`;
  
  // Generate interpretation
  const displayEq = cleanEq.replace(/\*/g, '').replace(/\^(\d+)/g, '^{$1}');
  const interpretationLatex = `\\text{Solve } ${displayEq} \\text{ for } ${target}`;

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
      inputInterpretation: interpretationLatex,
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
