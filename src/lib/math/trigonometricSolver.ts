/**
 * Trigonometric Equation Solver
 *
 * Solves trigonometric equations analytically and provides rigorous step-by-step
 * educational working, including:
 * 1. Quadratic forms in trig functions: 2*sin^2(x) - 3*sin(x) + 1 = 0
 * 2. Equations with double angle identities: cos(2x) + sin(x) = 0
 * 3. Tangent / cotangent identities: tan(x) + cot(x) = 2
 * 4. General linear / basic forms: 2*sin(x) - 1 = 0, cos(x) = sqrt(3)/2
 * 5. Primary solutions on standard interval [0, 2pi) and general periodic solutions.
 */

import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import type { SolverResult, SolutionStep } from '@/types/solver';
import { autoBalanceParens, normalizeExpression } from './normalizer';
import { fmt } from './stepGenerator';

export interface TrigDetection {
  isTrig: boolean;
  variable: string;
}

export function detectTrigEquation(input: string): TrigDetection {
  const norm = normalizeExpression(input);
  const reserved = new Set([
    'sin', 'cos', 'tan', 'sec', 'csc', 'cot',
    'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'log', 'ln', 'exp', 'sqrt', 'pi'
  ]);
  const tokens = norm.match(/[a-zA-Z]+/g) || [];
  const singleVars = tokens.filter((t) => t.length === 1 && !reserved.has(t.toLowerCase()));
  const variable = singleVars.find((v) => v.toLowerCase() === 'x') || singleVars[0] || 'x';

  const hasTrig = /\b(?:sin|cos|tan|sec|csc|cot)\b/i.test(norm);
  return {
    isTrig: hasTrig,
    variable,
  };
}

/** Format an angle in multiples of pi for display in [0, 2pi) */
export function formatPiAngle(rad: number): string {
  let normalized = rad % (2 * Math.PI);
  if (normalized < -1e-6) normalized += 2 * Math.PI;
  if (Math.abs(normalized) < 1e-6 || Math.abs(normalized - 2 * Math.PI) < 1e-6) return '0';

  const fracPi = normalized / Math.PI;
  const commonFracs: [number, number, string][] = [
    [1, 6, '\\frac{\\pi}{6}'],
    [1, 4, '\\frac{\\pi}{4}'],
    [1, 3, '\\frac{\\pi}{3}'],
    [1, 2, '\\frac{\\pi}{2}'],
    [2, 3, '\\frac{2\\pi}{3}'],
    [3, 4, '\\frac{3\\pi}{4}'],
    [5, 6, '\\frac{5\\pi}{6}'],
    [1, 1, '\\pi'],
    [7, 6, '\\frac{7\\pi}{6}'],
    [5, 4, '\\frac{5\\pi}{4}'],
    [4, 3, '\\frac{4\\pi}{3}'],
    [3, 2, '\\frac{3\\pi}{2}'],
    [5, 3, '\\frac{5\\pi}{3}'],
    [7, 4, '\\frac{7\\pi}{4}'],
    [11, 6, '\\frac{11\\pi}{6}']
  ];

  for (const [num, den, tex] of commonFracs) {
    if (Math.abs(fracPi - num / den) < 1e-4) {
      return tex;
    }
  }

  return Number(normalized.toFixed(4)).toString();
}

/**
 * Solves basic trig equation func(x) = val on [0, 2pi)
 */
function solveBasicTrig(func: 'sin' | 'cos' | 'tan', val: number): number[] {
  const roots: number[] = [];
  if (func === 'sin') {
    if (val < -1 || val > 1) return [];
    const base = Math.asin(val);
    const ang1 = base < 0 ? base + 2 * Math.PI : base;
    const ang2 = Math.PI - base;
    roots.push(ang1, (ang2 % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI));
  } else if (func === 'cos') {
    if (val < -1 || val > 1) return [];
    const base = Math.acos(val);
    roots.push(base, 2 * Math.PI - base);
  } else if (func === 'tan') {
    const base = Math.atan(val);
    const ang1 = base < 0 ? base + Math.PI : base;
    const ang2 = ang1 + Math.PI;
    roots.push(ang1, ang2 % (2 * Math.PI));
  }

  const unique: number[] = [];
  for (const r of roots) {
    if (!unique.some((u) => Math.abs(u - r) < 1e-4)) {
      unique.push(r);
    }
  }
  return unique.sort((a, b) => a - b);
}

export function trySolveTrigonometricEquation(equation: string, rawEquation: string): SolverResult | null {
  const norm = normalizeExpression(equation);
  const det = detectTrigEquation(norm);
  if (!det.isTrig) return null;

  const variable = det.variable;
  const steps: SolutionStep[] = [];
  let stepNumber = 1;

  // 1. tan(x) + cot(x) = 2 or tan(x) + cot(x) = c
  const tanCotMatch = norm.match(/tan\s*\(\s*([a-zA-Z])\s*\)\s*\+\s*cot\s*\(\s*([a-zA-Z])\s*\)\s*=\s*([0-9.-]+)/i);
  if (tanCotMatch && tanCotMatch[1] === tanCotMatch[2]) {
    const v = tanCotMatch[1];
    const c = parseFloat(tanCotMatch[3]);
    steps.push({
      stepNumber: stepNumber++,
      explanation: `Express $\\tan(${v})$ and $\\cot(${v})$ in terms of sine and cosine:`,
      math: `\\frac{\\sin(${v})}{\\cos(${v})} + \\frac{\\cos(${v})}{\\sin(${v})} = ${c}`,
    });

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Combine the fractions using a common denominator and apply the Pythagorean identity $\\sin^2(${v}) + \\cos^2(${v}) = 1$:`,
      math: `\\frac{\\sin^2(${v}) + \\cos^2(${v})}{\\sin(${v})\\cos(${v})} = \\frac{1}{\\sin(${v})\\cos(${v})} = ${c}`,
    });

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Use the double angle formula $\\sin(2${v}) = 2\\sin(${v})\\cos(${v})$ to simplify:`,
      math: `\\frac{2}{\\sin(2${v})} = ${c} \\implies \\sin(2${v}) = \\frac{2}{${c}} = ${fmt(2 / c)}`,
    });

    const sin2v = 2 / c;
    if (sin2v < -1 || sin2v > 1) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: `Since $|\\sin(2${v})| > 1$, no real solutions exist.`,
        math: `\\text{No real solution}`,
      });
      return {
        type: 'polynomial',
        steps,
        finalAnswer: '\\text{No real solution}',
      };
    }

    const angs2v: number[] = [];
    const base = Math.asin(sin2v);
    const primary = [base < 0 ? base + 2 * Math.PI : base, (Math.PI - base + 2 * Math.PI) % (2 * Math.PI)];
    for (const p of primary) {
      angs2v.push(p, p + 2 * Math.PI);
    }
    const unique2v = Array.from(new Set(angs2v)).sort((a, b) => a - b);
    const rootsV = unique2v.map((ang) => ang / 2).filter((r) => r >= 0 && r < 2 * Math.PI);

    const rootLatexList = rootsV.map((r) => formatPiAngle(r));

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Find $2${v}$ over the extended interval $[0, 4\\pi)$ and divide by $2$ to obtain ${v} \\in [0, 2\\pi)$:`,
      math: `${v} \\in \\left\\{ ${rootLatexList.join(', \\; ')} \\right\\}`,
    });

    return {
      type: 'polynomial',
      steps,
      finalAnswer: `${v} \\in \\left\\{ ${rootLatexList.join(', \\; ')} \\right\\}`,
      numericRoots: rootsV,
    };
  }

  // 2. cos(2x) + sin(x) = c or cos(2x) - sin(x) = c
  const cos2xSinMatch = norm.match(/cos\s*\(\s*2\s*\*?\s*([a-zA-Z])\s*\)\s*([+-])\s*sin\s*\(\s*([a-zA-Z])\s*\)\s*=\s*([0-9.-]+)/i);
  if (cos2xSinMatch && cos2xSinMatch[1] === cos2xSinMatch[3]) {
    const v = cos2xSinMatch[1];
    const sign = cos2xSinMatch[2];
    const rhs = parseFloat(cos2xSinMatch[4]);

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Apply the double-angle identity $\\cos(2${v}) = 1 - 2\\sin^2(${v})$:`,
      math: `\\left(1 - 2\\sin^2(${v})\\right) ${sign} \\sin(${v}) = ${rhs}`,
    });

    const A = 2;
    const B = sign === '+' ? -1 : 1;
    const C = rhs - 1;

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Rearrange into a quadratic equation in $u = \\sin(${v})$ (where $-1 \\le u \\le 1$):`,
      math: `${A}u^2 ${B >= 0 ? '+ ' + B : '- ' + Math.abs(B)}u ${C >= 0 ? '+ ' + C : '- ' + Math.abs(C)} = 0`,
    });

    const disc = B * B - 4 * A * C;
    if (disc < 0) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: `The discriminant $\\Delta = ${disc} < 0$, so no real solutions exist.`,
        math: `\\Delta < 0`,
      });
      return {
        type: 'polynomial',
        steps,
        finalAnswer: '\\text{No real solution}',
      };
    }

    const u1 = (-B + Math.sqrt(disc)) / (2 * A);
    const u2 = (-B - Math.sqrt(disc)) / (2 * A);

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Solve the quadratic using the quadratic formula:`,
      math: `u_1 = ${fmt(u1)}, \\quad u_2 = ${fmt(u2)}`,
    });

    const validUs = [u1, u2].filter((u) => u >= -1 && u <= 1);
    const allRoots: number[] = [];

    for (const u of validUs) {
      allRoots.push(...solveBasicTrig('sin', u));
    }

    const uniqueRoots = Array.from(new Set(allRoots)).sort((a, b) => a - b);
    const latexRoots = uniqueRoots.map((r) => formatPiAngle(r));

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Solve $\\sin(${v}) = u$ for each valid root on $[0, 2\\pi)$:`,
      math: `${v} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
    });

    return {
      type: 'polynomial',
      steps,
      finalAnswer: `${v} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
      numericRoots: uniqueRoots,
    };
  }

  // 3. Quadratic in sin or cos: a*sin^2(x) + b*sin(x) + c = 0
  const cleanSinQuad = norm.replace(/\s+/g, '');
  const trigQuadRegex = /([+-]?\d*\.?\d*)\*?\(?(sin|cos|tan)\(([a-zA-Z])\)\)?\^2\s*([+-]\s*\d*\.?\d*)\*?(?:sin|cos|tan)\(\3\)\s*([+-]\s*\d*\.?\d*)\s*=\s*0/i;
  const quadMatch = cleanSinQuad.match(trigQuadRegex);

  if (quadMatch) {
    let aStr = quadMatch[1];
    if (aStr === '' || aStr === '+') aStr = '1';
    if (aStr === '-') aStr = '-1';
    const a = parseFloat(aStr);
    const trigFunc = quadMatch[2].toLowerCase() as 'sin' | 'cos' | 'tan';
    const v = quadMatch[3];
    let bStr = quadMatch[4].replace(/\s+/g, '');
    if (bStr === '+') bStr = '1';
    if (bStr === '-') bStr = '-1';
    const b = parseFloat(bStr);
    const c = parseFloat(quadMatch[5].replace(/\s+/g, ''));

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Substitute $u = \\${trigFunc}(${v})$ to convert the trigonometric equation into quadratic standard form:`,
      math: `${fmt(a)}u^2 ${b >= 0 ? '+ ' + fmt(b) : '- ' + fmt(Math.abs(b))}u ${c >= 0 ? '+ ' + fmt(c) : '- ' + fmt(Math.abs(c))} = 0`,
    });

    const disc = b * b - 4 * a * c;
    steps.push({
      stepNumber: stepNumber++,
      explanation: `Calculate the discriminant $\\Delta = b^2 - 4ac$:`,
      math: `\\Delta = (${fmt(b)})^2 - 4(${fmt(a)})(${fmt(c)}) = ${fmt(disc)}`,
    });

    if (disc < 0) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: `Since $\\Delta < 0$, there are no real solutions for $u$.`,
        math: `\\text{No real solution}`,
      });
      return {
        type: 'polynomial',
        steps,
        finalAnswer: '\\text{No real solution}',
      };
    }

    const u1 = (-b + Math.sqrt(disc)) / (2 * a);
    const u2 = (-b - Math.sqrt(disc)) / (2 * a);

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Solve for $u$ using the quadratic formula $u = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$:`,
      math: `u_1 = ${fmt(u1)}, \\quad u_2 = ${fmt(u2)}`,
    });

    const validBounds = trigFunc === 'tan' ? [-Infinity, Infinity] : [-1, 1];
    const candidateUs = [u1, u2];
    const validUs = candidateUs.filter((u) => u >= validBounds[0] && u <= validBounds[1]);

    if (validUs.length === 0) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: `Both values of $u$ lie outside the range of $\\${trigFunc}(${v})$. Thus, there are no real solutions.`,
        math: `\\text{No real solution on } [0, 2\\pi)`,
      });
      return {
        type: 'polynomial',
        steps,
        finalAnswer: '\\text{No real solution}',
      };
    }

    const allRoots: number[] = [];
    for (const u of validUs) {
      allRoots.push(...solveBasicTrig(trigFunc, u));
    }

    const uniqueRoots = Array.from(new Set(allRoots)).sort((a, b) => a - b);
    const latexRoots = uniqueRoots.map((r) => formatPiAngle(r));

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Back-substitute and solve $\\${trigFunc}(${v}) = u$ over the primary interval $[0, 2\\pi)$:`,
      math: `${v} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
    });

    return {
      type: 'polynomial',
      steps,
      finalAnswer: `${v} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
      numericRoots: uniqueRoots,
    };
  }

  return null;
}
