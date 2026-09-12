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

/** Format an angle in multiples of pi for display in [0, 2pi] */
export function formatPiAngle(rad: number): string {
  if (Math.abs(rad) < 1e-4) return '0';
  if (Math.abs(rad - 2 * Math.PI) < 1e-4) return '2\\pi';

  let normalized = rad % (2 * Math.PI);
  if (normalized < -1e-6) normalized += 2 * Math.PI;
  if (Math.abs(normalized) < 1e-6) return '0';
  if (Math.abs(normalized - 2 * Math.PI) < 1e-6) return '2\\pi';

  const fracPi = normalized / Math.PI;
  const commonFracs: [number, number, string][] = [
    [1, 12, '\\frac{\\pi}{12}'],
    [1, 6, '\\frac{\\pi}{6}'],
    [1, 4, '\\frac{\\pi}{4}'],
    [1, 3, '\\frac{\\pi}{3}'],
    [5, 12, '\\frac{5\\pi}{12}'],
    [1, 2, '\\frac{\\pi}{2}'],
    [7, 12, '\\frac{7\\pi}{12}'],
    [2, 3, '\\frac{2\\pi}{3}'],
    [3, 4, '\\frac{3\\pi}{4}'],
    [5, 6, '\\frac{5\\pi}{6}'],
    [11, 12, '\\frac{11\\pi}{12}'],
    [1, 1, '\\pi'],
    [13, 12, '\\frac{13\\pi}{12}'],
    [7, 6, '\\frac{7\\pi}{6}'],
    [5, 4, '\\frac{5\\pi}{4}'],
    [4, 3, '\\frac{4\\pi}{3}'],
    [17, 12, '\\frac{17\\pi}{12}'],
    [3, 2, '\\frac{3\\pi}{2}'],
    [19, 12, '\\frac{19\\pi}{12}'],
    [5, 3, '\\frac{5\\pi}{3}'],
    [7, 4, '\\frac{7\\pi}{4}'],
    [11, 6, '\\frac{11\\pi}{6}'],
    [23, 12, '\\frac{23\\pi}{12}']
  ];

  for (const [num, den, tex] of commonFracs) {
    if (Math.abs(fracPi - num / den) < 1e-3) {
      return tex;
    }
  }

  return Number(normalized.toFixed(4)).toString();
}

/**
 * Solves basic trig equation func(x) = val on [0, 2pi]
 */
function solveBasicTrig(func: 'sin' | 'cos' | 'tan', val: number): number[] {
  const roots: number[] = [];
  if (func === 'sin') {
    if (val < -1 || val > 1) return [];
    const base = Math.asin(val);
    const ang1 = base < 0 ? base + 2 * Math.PI : base;
    const ang2 = (Math.PI - base + 2 * Math.PI) % (2 * Math.PI);
    roots.push(ang1, ang2);
    if (Math.abs(val) < 1e-6) {
      roots.push(0, Math.PI, 2 * Math.PI);
    }
  } else if (func === 'cos') {
    if (val < -1 || val > 1) return [];
    const base = Math.acos(val);
    roots.push(base, 2 * Math.PI - base);
    if (Math.abs(val - 1) < 1e-6) {
      roots.push(0, 2 * Math.PI);
    }
  } else if (func === 'tan') {
    const base = Math.atan(val);
    const ang1 = base < 0 ? base + Math.PI : base;
    const ang2 = ang1 + Math.PI;
    roots.push(ang1, ang2);
    if (Math.abs(val) < 1e-6) {
      roots.push(0, Math.PI, 2 * Math.PI);
    }
  }

  const unique: number[] = [];
  for (const r of roots) {
    if (r >= -1e-5 && r <= 2 * Math.PI + 1e-5) {
      const snap = Math.abs(r) < 1e-5 ? 0 : Math.abs(r - 2 * Math.PI) < 1e-5 ? 2 * Math.PI : r;
      if (!unique.some((u) => Math.abs(u - snap) < 1e-4)) {
        unique.push(snap);
      }
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

  // 0. Basic trigonometric equations: a*func(x) = c, e.g. sin(x) = 1/2, cos(x) = 0
  let lhsSide = norm;
  let rhsSide = '0';
  if (norm.includes('=')) {
    const parts = norm.split('=');
    lhsSide = parts[0].trim();
    rhsSide = parts[1].trim();
  }

  const basicMatch = lhsSide.match(/^([+-]?\s*\d*\.?\d*)\s*\*?\s*(sin|cos|tan)\s*\(\s*([a-zA-Z])\s*\)$/i);
  if (basicMatch) {
    const rawCoeff = basicMatch[1].replace(/\s+/g, '');
    let coeff = 1;
    if (rawCoeff === '-' || rawCoeff === '-1') coeff = -1;
    else if (rawCoeff === '+' || rawCoeff === '+1') coeff = 1;
    else if (rawCoeff) {
      const p = parseFloat(rawCoeff);
      if (!isNaN(p)) coeff = p;
    }
    const trigFunc = basicMatch[2].toLowerCase() as 'sin' | 'cos' | 'tan';
    const v = basicMatch[3];

    let rhsVal: number;
    try {
      rhsVal = Number(math.evaluate(rhsSide));
    } catch {
      rhsVal = parseFloat(rhsSide);
    }

    if (!isNaN(rhsVal)) {
      const targetVal = rhsVal / coeff;

      steps.push({
        stepNumber: stepNumber++,
        explanation: `Isolate the trigonometric function $\\${trigFunc}(${v})$:`,
        math: `\\${trigFunc}(${v}) = ${fmt(targetVal)}`,
      });

      const validBounds = trigFunc === 'tan' ? [-Infinity, Infinity] : [-1, 1];
      if (targetVal < validBounds[0] || targetVal > validBounds[1]) {
        steps.push({
          stepNumber: stepNumber++,
          explanation: `Since $|\\${trigFunc}(${v})| > 1$, there are no real solutions for ${v}.`,
          math: `\\text{No real solution on } [0, 2\\pi)`,
        });
        return {
          type: 'trigonometric',
          steps,
          finalAnswer: '\\text{No real solution}',
        };
      }

      const roots = solveBasicTrig(trigFunc, targetVal);
      const rootLatexList = roots.map((r) => formatPiAngle(r));

      // General periodic solutions
      let genSolutionsLatex: string[] = [];
      if (trigFunc === 'sin') {
        const base = Math.asin(targetVal);
        const a1 = formatPiAngle(base < 0 ? base + 2 * Math.PI : base);
        const a2 = formatPiAngle((Math.PI - base + 2 * Math.PI) % (2 * Math.PI));
        genSolutionsLatex = [`${a1} + 2\\pi k`, `${a2} + 2\\pi k`];
      } else if (trigFunc === 'cos') {
        const base = Math.acos(targetVal);
        const a1 = formatPiAngle(base);
        genSolutionsLatex = [`${a1} + 2\\pi k`, `-${a1} + 2\\pi k`];
      } else {
        const base = Math.atan(targetVal);
        const a1 = formatPiAngle(base < 0 ? base + Math.PI : base);
        genSolutionsLatex = [`${a1} + \\pi k`];
      }

      steps.push({
        stepNumber: stepNumber++,
        explanation: `Solve for the general periodic solution set over $\\mathbb{R}$ ($k \\in \\mathbb{Z}$):`,
        math: `${v} = ${genSolutionsLatex.join(' \\quad \\text{or} \\quad ')}, \\quad k \\in \\mathbb{Z}`,
      });

      steps.push({
        stepNumber: stepNumber++,
        explanation: `Enumerate all concrete solutions within the domain $[0, 2\\pi]$:`,
        math: `${v} \\in \\left\\{ ${rootLatexList.join(', \\; ')} \\right\\}`,
      });

      return {
        type: 'trigonometric',
        equationType: 'trigonometric',
        steps,
        finalAnswer: `${v} \\in \\left\\{ ${rootLatexList.join(', \\; ')} \\right\\}`,
        numericRoots: roots,
      };
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Linear combination of sin and cos: a*sin(x) + b*cos(x) = c
  //    (e.g. sin(x) + cos(x) = 1, 2*sin(x) - 2*cos(x) = 2)
  // ──────────────────────────────────────────────────────────────────────────
  const linCombPattern = /^([+-]?\s*\d*\.?\d*)\s*\*?\s*(sin|cos)\s*\(\s*([a-zA-Z])\s*\)\s*([+-])\s*(\d*\.?\d*)\s*\*?\s*(sin|cos)\s*\(\s*\3\s*\)$/i;
  const linMatch = lhsSide.match(linCombPattern);
  if (linMatch && linMatch[2].toLowerCase() !== linMatch[6].toLowerCase()) {
    const rawA = linMatch[1].replace(/\s+/g, '');
    let c1 = 1;
    if (rawA === '-' || rawA === '-1') c1 = -1;
    else if (rawA === '+' || rawA === '+1') c1 = 1;
    else if (rawA) c1 = parseFloat(rawA) || 1;

    const op = linMatch[4];
    const rawB = linMatch[5].replace(/\s+/g, '');
    let c2 = 1;
    if (rawB) c2 = parseFloat(rawB) || 1;
    if (op === '-') c2 = -c2;

    const v = linMatch[3];
    const a = linMatch[2].toLowerCase() === 'sin' ? c1 : c2;
    const b = linMatch[2].toLowerCase() === 'cos' ? c1 : c2;

    let rhsVal = parseFloat(rhsSide);
    if (isNaN(rhsVal)) {
      try {
        rhsVal = Number(math.evaluate(rhsSide));
      } catch {
        rhsVal = 0;
      }
    }

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Identify the equation as a linear combination of sine and cosine $a\\sin(${v}) + b\\cos(${v}) = c$ with $a = ${fmt(a)}$, $b = ${fmt(b)}$, and $c = ${fmt(rhsVal)}$:`,
      math: `${fmt(a)}\\sin(${v}) ${b >= 0 ? '+ ' + fmt(b) : '- ' + fmt(Math.abs(b))}\\cos(${v}) = ${fmt(rhsVal)}`,
    });

    const R = Math.sqrt(a * a + b * b);
    const alpha = Math.atan2(b, a);
    const alphaLatex = formatPiAngle(alpha < 0 ? alpha + 2 * Math.PI : alpha);

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Calculate amplitude $R = \\sqrt{a^2 + b^2} = \\sqrt{${fmt(a)}^2 + (${fmt(b)})^2} = ${fmt(R)}$ and phase angle $\\alpha = \\operatorname{atan2}(b, a) = ${alphaLatex}$:`,
      math: `R = ${fmt(R)}, \\quad \\alpha = ${alphaLatex}`,
    });

    if (Math.abs(rhsVal) > R + 1e-7) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: `Since $|c| = ${fmt(Math.abs(rhsVal))} > R = ${fmt(R)}$, the equation has no real solutions.`,
        math: `|c| > R \\implies \\text{No real solution}`,
      });
      return {
        type: 'trigonometric',
        equationType: 'trigonometric',
        steps,
        finalAnswer: '\\text{No real solution}',
      };
    }

    const sinTarget = rhsVal / R;
    const theta0 = Math.asin(Math.max(-1, Math.min(1, sinTarget)));

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Rewrite using the harmonic angle addition formula $R\\sin(${v} + \\alpha) = c$:`,
      math: `${fmt(R)}\\sin\\left(${v} + ${alphaLatex}\\right) = ${fmt(rhsVal)} \\implies \\sin\\left(${v} + ${alphaLatex}\\right) = ${fmt(sinTarget)}`,
    });

    const branch1Gen = theta0 - alpha;
    const branch2Gen = Math.PI - theta0 - alpha;

    const b1Tex = formatPiAngle((branch1Gen % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI));
    const b2Tex = formatPiAngle((branch2Gen % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI));

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Solve for the general periodic solution branches over $\\mathbb{R}$ ($k \\in \\mathbb{Z}$):`,
      math: `${v} = ${b1Tex} + 2\\pi k \\quad \\text{or} \\quad ${v} = ${b2Tex} + 2\\pi k, \\quad k \\in \\mathbb{Z}`,
    });

    const rawRoots: number[] = [];
    for (let k = -4; k <= 4; k++) {
      const val1 = branch1Gen + 2 * Math.PI * k;
      const val2 = branch2Gen + 2 * Math.PI * k;
      for (const val of [val1, val2]) {
        if (val >= -1e-5 && val <= 2 * Math.PI + 1e-5) {
          const snap = Math.abs(val) < 1e-5 ? 0 : Math.abs(val - 2 * Math.PI) < 1e-5 ? 2 * Math.PI : val;
          rawRoots.push(snap);
        }
      }
    }

    const uniqueRoots: number[] = [];
    for (const r of rawRoots) {
      if (!uniqueRoots.some((u) => Math.abs(u - r) < 1e-4)) {
        uniqueRoots.push(r);
      }
    }
    uniqueRoots.sort((x, y) => x - y);
    const latexRoots = uniqueRoots.map((r) => formatPiAngle(r));

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Enumerate all concrete solutions within the domain $[0, 2\\pi]$:`,
      math: `${v} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
    });

    return {
      type: 'trigonometric',
      equationType: 'trigonometric',
      steps,
      finalAnswer: `${v} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
      numericRoots: uniqueRoots,
    };
  }

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
        type: 'trigonometric',
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
      type: 'trigonometric',
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
        type: 'trigonometric',
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
      type: 'trigonometric',
      steps,
      finalAnswer: `${v} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
      numericRoots: uniqueRoots,
    };
  }

  // 3. Quadratic in sin, cos, or tan: a*sin^2(x) + b*sin(x) + c = 0
  const cleanSinQuad = norm.replace(/\s+/g, '');
  // Matches 2*sin(x)^2 + 3*sin(x) - 2 = 0, 2*(sin(x))^2 + 3*sin(x) - 2 = 0, 2*sin^2(x) + 3*sin(x) - 2 = 0
  const trigQuadRegex = /([+-]?\d*\.?\d*)\*?(?:\(?\s*(sin|cos|tan)\(([a-zA-Z])\)\)?\^2|(sin|cos|tan)\^2\(([a-zA-Z])\))\s*([+-]\s*\d*\.?\d*)\*?(?:sin|cos|tan)\((?:\3|\5)\)\s*([+-]\s*\d*\.?\d*)\s*=\s*0/i;
  const quadMatch = cleanSinQuad.match(trigQuadRegex);

  if (quadMatch) {
    let aStr = quadMatch[1];
    if (aStr === '' || aStr === '+') aStr = '1';
    if (aStr === '-') aStr = '-1';
    const a = parseFloat(aStr);
    const trigFunc = ((quadMatch[2] || quadMatch[4])?.toLowerCase() || 'sin') as 'sin' | 'cos' | 'tan';
    const v = quadMatch[3] || quadMatch[5];
    let bStr = quadMatch[6].replace(/\s+/g, '');
    if (bStr === '+') bStr = '1';
    if (bStr === '-') bStr = '-1';
    const b = parseFloat(bStr);
    const c = parseFloat(quadMatch[7].replace(/\s+/g, ''));

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
        type: 'trigonometric',
        equationType: 'trigonometric',
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
        explanation: `Both values of $u$ lie outside the allowable range of $\\${trigFunc}(${v})$. Thus, there are no real solutions.`,
        math: `\\text{No real solution on } [0, 2\\pi]`,
      });
      return {
        type: 'trigonometric',
        equationType: 'trigonometric',
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
      explanation: `Solve $\\${trigFunc}(${v}) = u$ over the standard interval $[0, 2\\pi]$:`,
      math: `${v} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
    });

    return {
      type: 'trigonometric',
      equationType: 'trigonometric',
      steps,
      finalAnswer: `${v} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
      numericRoots: uniqueRoots,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Universal Trigonometric Scanner Fallback:
  //    Scans domain [0, 2*pi] with dense sampling to find ALL roots without
  //    ever falling back to single arbitrary negative branches.
  // ──────────────────────────────────────────────────────────────────────────
  try {
    const diffNorm = `${lhsSide} - (${rhsSide})`;
    const exprCompiled = math.compile(diffNorm);
    const fEval = (val: number): number => {
      try {
        return Number(exprCompiled.evaluate({ [variable]: val }));
      } catch {
        return NaN;
      }
    };

    const SAMPLES = 72;
    const foundRoots: number[] = [];

    // Check endpoints 0 and 2*pi
    if (Math.abs(fEval(0)) < 1e-4) foundRoots.push(0);
    if (Math.abs(fEval(2 * Math.PI)) < 1e-4) foundRoots.push(2 * Math.PI);

    for (let i = 0; i < SAMPLES; i++) {
      let xA = (i * 2 * Math.PI) / SAMPLES;
      let xB = ((i + 1) * 2 * Math.PI) / SAMPLES;
      let fA = fEval(xA);
      let fB = fEval(xB);

      if (isNaN(fA) || isNaN(fB)) continue;

      if (fA * fB <= 0) {
        // Bisection
        for (let iter = 0; iter < 40; iter++) {
          const mid = (xA + xB) / 2;
          const fM = fEval(mid);
          if (Math.abs(fM) < 1e-10) {
            xA = mid;
            break;
          }
          if (fA * fM <= 0) {
            xB = mid;
            fB = fM;
          } else {
            xA = mid;
            fA = fM;
          }
        }
        const r = (xA + xB) / 2;
        if (r >= -1e-5 && r <= 2 * Math.PI + 1e-5) {
          foundRoots.push(Math.abs(r) < 1e-5 ? 0 : Math.abs(r - 2 * Math.PI) < 1e-5 ? 2 * Math.PI : r);
        }
      }
    }

    const unique: number[] = [];
    for (const r of foundRoots) {
      if (!unique.some((u) => Math.abs(u - r) < 1e-4)) {
        unique.push(r);
      }
    }
    unique.sort((a, b) => a - b);

    if (unique.length > 0) {
      const latexRoots = unique.map((r) => formatPiAngle(r));
      steps.push({
        stepNumber: stepNumber++,
        explanation: `Solve trigonometric equation over the standard interval $[0, 2\\pi]$:`,
        math: `${variable} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
      });

      return {
        type: 'trigonometric',
        equationType: 'trigonometric',
        steps,
        finalAnswer: `${variable} \\in \\left\\{ ${latexRoots.join(', \\; ')} \\right\\}`,
        numericRoots: unique,
      };
    }
  } catch {
    // If parsing fails, fall through
  }

  return null;
}
