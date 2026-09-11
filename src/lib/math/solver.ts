import { SolverResult, QuadraticMethod, SolutionStep } from '@/types/solver';
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
      const imStr = Math.abs(comp.im) === 1 ? 'i' : `${fmt(comp.im)}\\,i`;
      const exactStr =
        Math.abs(comp.re) < 1e-6
          ? `${variable}_{${idx},${idx + 1}} = \\pm ${imStr}`
          : `${variable}_{${idx},${idx + 1}} = ${fmt(comp.re)} \\pm ${imStr}`;
      exactParts.push(exactStr);
      decimalParts.push(exactStr);
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
    const imStr = Math.abs(comp.im) === 1 ? 'i' : `${fmt(comp.im)}\\,i`;
    const exactStr =
      Math.abs(comp.re) < 1e-6
        ? `\\pm ${imStr}`
        : `${fmt(comp.re)} \\pm ${imStr}`;
    exactItems.push(exactStr);
    decimalItems.push(exactStr);
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
      type: 'polynomial',
      steps,
      finalAnswer: parsed.finalLatex,
      inputInterpretation: expressionToLatex(rawEq),
      numericRoots: [],
    };
  } catch (e) {
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
    let currentExpr = cleanEq;

    // 1. If expression has distribution, e.g. 2*(x + 3)
    if (hasDistribution) {
      const expanded = (nerdamer as any).expand(currentExpr).toString();
      if (expanded !== currentExpr) {
        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Expand and distribute factors across parentheses: $a(b + c) = ab + ac$.',
          math: cleanLatexMath((nerdamer as any)(expanded).toTeX()),
        });
        currentExpr = expanded;
      }
    }

    // 2. Remove parentheses and apply sign rules
    let step1Expr = currentExpr
      .replace(/\+\s*\(\s*\+\s*([^()]+)\s*\)/g, ' + $1')
      .replace(/\+\s*\(\s*-\s*([^()]+)\s*\)/g, ' - $1')
      .replace(/-\s*\(\s*\+\s*([^()]+)\s*\)/g, ' - $1')
      .replace(/-\s*\(\s*-\s*([^()]+)\s*\)/g, ' + $1')
      .replace(/\(\s*\+\s*([^()]+)\s*\)/g, '$1')
      .replace(/\(\s*-\s*([^()]+)\s*\)/g, '-$1')
      .trim();

    step1Expr = step1Expr.replace(/^\+\s*/, '');

    if (step1Expr !== currentExpr.trim() && !hasDistribution) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Remove parentheses and apply sign rules: $+(-a) = -a$ and $+(+a) = +a$.',
        math: cleanLatexMath(step1Expr.replace(/\*/g, '')),
      });
    }

    // 3. Parse terms and group by variable/power
    const normalizedTerms = step1Expr.replace(/\s+/g, '');
    const termMatches = normalizedTerms.match(/([+-]?[^+-]+)/g) || [];

    const groups: Record<string, string[]> = {};
    for (const term of termMatches) {
      const vMatch = term.match(/[a-zA-Z](\^[0-9]+)?/g);
      const key = vMatch ? vMatch.sort().join('') : '_const';
      if (!groups[key]) groups[key] = [];
      groups[key].push(term);
    }

    const groupKeys = Object.keys(groups);
    const hasCombineableTerms = groupKeys.some(k => groups[k].length > 1);

    if (hasCombineableTerms) {
      const groupedLatexParts: string[] = [];
      for (const k of groupKeys) {
        const terms = groups[k];
        const label = k === '_const' ? '\\text{constants}' : `\\mathbf{${k}}`;
        groupedLatexParts.push(`\\text{${label}: } (${formatTermsDisplay(terms)})`);
      }

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Group like terms containing the same variables together.',
        math: groupedLatexParts.join(' \\quad '),
      });

      for (const k of groupKeys) {
        const terms = groups[k];
        if (terms.length > 1) {
          const sumExpr = terms.join(' + ');
          const groupResult = (nerdamer as any)(sumExpr).toString();
          const cleanGroupResult = cleanLatexMath((nerdamer as any)(groupResult).toTeX());
          steps.push({
            stepNumber: stepNumber++,
            explanation: `Combine coefficients for like terms in $${k === '_const' ? '\\text{constants}' : k}$:`,
            math: `${formatTermsDisplay(terms)} = ${cleanGroupResult}`,
          });
        }
      }
    }

    // 4. Final simplified expression using nerdamer
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

// ─── Main Solver Functions ──────────────────────────────────────────────────

export function solvePolynomial(equation: string, method: QuadraticMethod = 'auto'): SolverResult {
  let cleanEq = equation.trim();
  cleanEq = autoBalanceParens(cleanEq);

  // If expression without = contains radicals, simplify radical expression directly
  if (!cleanEq.includes('=')) {
    const radicalResult = trySimplifyRadicalExpression(cleanEq, equation);
    if (radicalResult) {
      return radicalResult;
    }

    const algebraicResult = trySimplifyAlgebraicExpression(cleanEq, equation);
    if (algebraicResult) {
      return algebraicResult;
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

  // Check if this is a Transcendental Equation
  if (detectTranscendental(cleanEq).isTranscendental && cleanEq.includes('=')) {
    try {
      return solveTranscendental(cleanEq);
    } catch {
      // fall through to algebraic solver
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

  // Extract exact polynomial coefficients and degree
  const poly = extractCoefficients(standardExpr, variable);

  if (poly && poly.degree >= 1) {
    const { degree, coeffs } = poly;

    // ─── DEGREE 1 (LINEAR): ax + b = 0 ──────────────────────────────────────
    if (degree === 1) {
      const [a, b] = coeffs;
      const rootVal = -b / a;
      const frac = toFraction(rootVal);
      const steps = generateLinearSteps(a, b, variable);
      return {
        type: 'polynomial',
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
      const steps = generateQuadraticSteps(a, b, c, variable, method);
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
        const realStr = Math.abs(realPart) < 1e-6 ? '' : `${fmt(realPart)} \\pm `;
        const pmStr = Math.abs(realPart) < 1e-6 ? '\\pm ' : '';
        const imStr = Math.abs(imagPart - 1) < 1e-6 ? 'i' : `${fmt(imagPart)}\\,i`;
        finalAnswer = `${variable} = ${realStr}${pmStr}${imStr}`;
      }

      return {
        type: 'polynomial',
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
      const steps = generateCubicSteps(a, b, c, d, roots, variable);
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

    // ─── DEGREE 4 (QUARTIC): ax^4 + bx^3 + cx^2 + dx + e = 0 ────────────────
    if (degree === 4) {
      const roots = solvePolynomialNumerical(coeffs);
      const steps = generateQuarticSteps(coeffs, roots, variable);
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

    // ─── DEGREE 5+ (HIGHER ORDER): ax^n + ... = 0 (Abel–Ruffini) ────────────
    if (degree >= 5) {
      const roots = solvePolynomialNumerical(coeffs);
      const steps = generateDegree5PlusSteps(coeffs, roots, variable);
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

  // Attempt transcendental numerical Newton-Raphson before giving up
  try {
    return solveTranscendental(cleanEq, variable);
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
    inputInterpretation: interpretationLatex,
  };
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
    finalAnswer: '\\text{No unique solution}',
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
