/**
 * U-Substitution Quadratic-in-Disguise Equation Solver
 *
 * Solves equations reducible to quadratic form a*f(x)^2 + b*f(x) + c = 0 where f(x) is:
 * 1. Trigonometric: sin(x), cos(x), tan(x) (e.g. 2sin^2(x) - 3sin(x) + 1 = 0, cos(2x) + sin(x) = 0)
 * 2. Exponential: e^x, b^x (e.g. e^(2x) - 3e^x + 2 = 0, 4^x - 5*2^x + 4 = 0)
 * 3. Logarithmic: ln(x), log(x) (e.g. (ln(x))^2 - 3ln(x) + 2 = 0)
 * 4. Radical: sqrt(x) (e.g. x - 5sqrt(x) + 6 = 0)
 * 5. Biquadratic: x^2 (e.g. x^4 - 5x^2 + 4 = 0)
 *
 * Generates full, textbook-quality 4+ step working:
 * - Step 1: Substitution definition and quadratic standard form rewrite.
 * - Step 2: Solving the quadratic in u via factoring or quadratic formula with discriminant.
 * - Step 3: Back-substituting f(x) for each branch, checking range/domain restrictions,
 *           and showing detailed branch solutions (e.g. reference angles, logarithms, powers).
 * - Step 4: Combining the verified final solution set.
 */

import * as math from 'mathjs';
import nerdamer from 'nerdamer';
import type { SolverResult, SolutionStep } from '@/types/solver';
import { autoBalanceParens, normalizeExpression } from './normalizer';
import { fmt, fmtFraction, toFraction } from './stepGenerator';
import { extractCoefficients, detectVariable } from './solver';
import { formatPiAngle } from './trigonometricSolver';

export type USubKernelType = 'trig' | 'exponential' | 'logarithmic' | 'radical' | 'biquadratic';

export interface USubDetection {
  kernelType: USubKernelType;
  variable: string;
  kernelLatex: string;
  kernelPlain: string;
  domainNote: string;
  A: number;
  B: number;
  C: number;
  // Specific parameters
  trigFunc?: 'sin' | 'cos' | 'tan';
  expBase?: number;
  expBaseStr?: string;
  isNaturalLog?: boolean;
}

/**
 * Format quadratic equation in u for display
 */
function formatQuadraticU(A: number, B: number, C: number): string {
  let s = '';
  if (A === 1) s += 'u^2';
  else if (A === -1) s += '-u^2';
  else s += `${fmt(A)}u^2`;

  if (B > 0) {
    s += B === 1 ? ' + u' : ` + ${fmt(B)}u`;
  } else if (B < 0) {
    s += B === -1 ? ' - u' : ` - ${fmt(Math.abs(B))}u`;
  }

  if (C > 0) {
    s += ` + ${fmt(C)}`;
  } else if (C < 0) {
    s += ` - ${fmt(Math.abs(C))}`;
  }

  return `${s} = 0`;
}

/**
 * Format a number or exact fraction for step display
 */
function fmtVal(n: number): string {
  return fmtFraction(n);
}

/**
 * Solves basic trig equation func(x) = val on [0, 2pi]
 */
function solveBasicTrigRoots(func: 'sin' | 'cos' | 'tan', val: number): number[] {
  const roots: number[] = [];
  if (func === 'sin') {
    if (val < -1 - 1e-6 || val > 1 + 1e-6) return [];
    const clamped = Math.max(-1, Math.min(1, val));
    const base = Math.asin(clamped);
    const ang1 = base < 0 ? base + 2 * Math.PI : base;
    const ang2 = (Math.PI - base + 2 * Math.PI) % (2 * Math.PI);
    roots.push(ang1, ang2);
    if (Math.abs(val) < 1e-6) {
      roots.push(0, Math.PI, 2 * Math.PI);
    }
  } else if (func === 'cos') {
    if (val < -1 - 1e-6 || val > 1 + 1e-6) return [];
    const clamped = Math.max(-1, Math.min(1, val));
    const base = Math.acos(clamped);
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

/**
 * Detects whether an equation is quadratic in disguise: a*f(x)^2 + b*f(x) + c = 0
 */
export function detectUSubstitution(normEq: string, rawEq?: string): USubDetection | null {
  const norm = normalizeExpression(normEq);
  let lhs = norm;
  let rhs = '0';
  if (norm.includes('=')) {
    const p = norm.split('=');
    lhs = p[0].trim();
    rhs = p[1].trim();
  }
  const diffExpr = rhs && rhs !== '0' ? `(${lhs}) - (${rhs})` : lhs;
  const variable = detectVariable(diffExpr);

  // 1. Trigonometric substitution: f(x) = sin(x), cos(x), tan(x)
  // Check for double angle cos(2x) identity substitution when mixed with sin(x) or cos(x)
  let trigStandard = diffExpr;
  if (/cos\s*\(\s*2\s*\*?\s*x\s*\)/i.test(trigStandard) || /cos\s*2x\b/i.test(trigStandard)) {
    if (/\bsin\b/i.test(trigStandard)) {
      trigStandard = trigStandard.replace(/cos\s*\(\s*2\s*\*?\s*x\s*\)|cos\s*2x\b/gi, '(1 - 2*(sin(x))^2)');
    } else if (/\bcos\b/i.test(trigStandard)) {
      trigStandard = trigStandard.replace(/cos\s*\(\s*2\s*\*?\s*x\s*\)|cos\s*2x\b/gi, '(2*(cos(x))^2 - 1)');
    }
  }

  for (const fn of ['sin', 'cos', 'tan'] as const) {
    if (new RegExp('\\b' + fn + '\\b', 'i').test(trigStandard)) {
      let t = trigStandard;
      // Match squared forms: (sin(x))^2, (sin(x))^(2), sin(x)^2, sin(x)^(2), sin^2(x), sin^2x
      const sqRegex = new RegExp(
        '(?:\\(?\\s*' + fn + '\\s*\\(\\s*' + variable + '\\s*\\)\\s*\\)?\\s*\\^\\s*\\(?\\s*2\\s*\\)?|' +
        fn + '\\s*\\^\\s*\\(?\\s*2\\s*\\)?\\s*\\(\\s*' + variable + '\\s*\\)|' +
        fn + '\\s*\\^\\s*\\(?\\s*2\\s*\\)?\\s*' + variable + '\\b)',
        'gi'
      );
      t = t.replace(sqRegex, '(__u)^2');

      // Match linear forms: sin(x), sinx
      const linRegex = new RegExp('\\b' + fn + '\\s*\\(\\s*' + variable + '\\s*\\)(?!\\s*\\^)|\\b' + fn + '\\s*' + variable + '\\b(?!\\s*\\^)', 'gi');
      t = t.replace(linRegex, '(__u)');

      // Verify that no un-substituted variable remains
      const remainingVar = new RegExp('\\b' + variable + '\\b', 'i').test(t);
      if (!remainingVar) {
        const poly = extractCoefficients(t, '__u');
        if (poly && poly.degree === 2 && poly.coeffs.length === 3) {
          const [A, B, C] = poly.coeffs;
          if (Math.abs(A) > 1e-9) {
            const domainNote = fn === 'tan' ? 'for all real $u$' : 'with $-1 \\le u \\le 1$';
            return {
              kernelType: 'trig',
              variable,
              kernelLatex: `\\${fn}(${variable})`,
              kernelPlain: `${fn}(${variable})`,
              domainNote,
              A,
              B,
              C,
              trigFunc: fn,
            };
          }
        }
      }
    }
  }

  // 2. Exponential substitution: f(x) = e^x or b^x
  const expDiffExpr = diffExpr.replace(/\bexp\s*\(([^)]+)\)/gi, 'e^($1)');
  if (expDiffExpr.includes('^')) {
    // Check e^x: e^(2x), e^(2*x), (e^x)^2
    let t = expDiffExpr;
    const eSqRegex = new RegExp('(?:e\\s*\\^\\s*\\(?\\s*2\\s*\\*?\\s*' + variable + '\\s*\\)?|\\(?\\s*e\\s*\\^\\s*' + variable + '\\s*\\)?\\s*\\^\\s*\\(?\\s*2\\s*\\)?)', 'gi');
    t = t.replace(eSqRegex, '(__u)^2');
    const eLinRegex = new RegExp('e\\s*\\^\\s*(?:\\(?\\s*' + variable + '\\s*\\)?|\\b' + variable + '\\b)(?!\\s*\\^)', 'gi');
    t = t.replace(eLinRegex, '(__u)');

    const remainingVarE = new RegExp('\\b' + variable + '\\b', 'i').test(t);
    if (!remainingVarE) {
      const poly = extractCoefficients(t, '__u');
      if (poly && poly.degree === 2 && poly.coeffs.length === 3) {
        const [A, B, C] = poly.coeffs;
        if (Math.abs(A) > 1e-9) {
          return {
            kernelType: 'exponential',
            variable,
            kernelLatex: `e^{${variable}}`,
            kernelPlain: `e^${variable}`,
            domainNote: 'with $u > 0$',
            A,
            B,
            C,
            expBase: Math.E,
            expBaseStr: 'e',
          };
        }
      }
    }

    // Check base b (e.g. 4^x - 5*2^x + 4 = 0 where b=2, b^2=4)
    for (const base of [2, 3, 5, 10]) {
      const sqBase = base * base;
      let tb = expDiffExpr;
      const bSqRegex = new RegExp('(?:' + sqBase + '\\s*\\^\\s*\\(?\\s*' + variable + '\\s*\\)?|' + base + '\\s*\\^\\s*\\(?\\s*2\\s*\\*?\\s*' + variable + '\\s*\\)?)', 'gi');
      tb = tb.replace(bSqRegex, '(__u)^2');
      const bLinRegex = new RegExp(base + '\\s*\\^\\s*(?:\\(?\\s*' + variable + '\\s*\\)?|\\b' + variable + '\\b)(?!\\s*\\^)', 'gi');
      tb = tb.replace(bLinRegex, '(__u)');

      const remainingVarB = new RegExp('\\b' + variable + '\\b', 'i').test(tb);
      if (!remainingVarB) {
        const poly = extractCoefficients(tb, '__u');
        if (poly && poly.degree === 2 && poly.coeffs.length === 3) {
          const [A, B, C] = poly.coeffs;
          if (Math.abs(A) > 1e-9) {
            return {
              kernelType: 'exponential',
              variable,
              kernelLatex: `${base}^{${variable}}`,
              kernelPlain: `${base}^${variable}`,
              domainNote: 'with $u > 0$',
              A,
              B,
              C,
              expBase: base,
              expBaseStr: String(base),
            };
          }
        }
      }
    }
  }

  // 3. Logarithmic substitution: f(x) = ln(x) or log(x)
  if (/(?:ln|log)\b/i.test(diffExpr)) {
    const isLn = /ln\b/i.test(rawEq || normEq) || !/log_\d+/i.test(diffExpr);
    for (const fn of ['ln', 'log'] as const) {
      let t = diffExpr;
      // Match (ln(x))^2, (ln(x))^(2), ln(x)^2, ln^2(x)
      const sqRegex = new RegExp(
        '(?:\\(?\\s*' + fn + '\\s*\\(\\s*' + variable + '\\s*\\)\\s*\\)?\\s*\\^\\s*\\(?\\s*2\\s*\\)?|' +
        fn + '\\s*\\^\\s*\\(?\\s*2\\s*\\)?\\s*\\(\\s*' + variable + '\\s*\\))',
        'gi'
      );
      t = t.replace(sqRegex, '(__u)^2');
      const linRegex = new RegExp('\\b' + fn + '\\s*\\(\\s*' + variable + '\\s*\\)(?!\\s*\\^)', 'gi');
      t = t.replace(linRegex, '(__u)');

      const remainingVar = new RegExp('\\b' + variable + '\\b', 'i').test(t);
      if (!remainingVar) {
        const poly = extractCoefficients(t, '__u');
        if (poly && poly.degree === 2 && poly.coeffs.length === 3) {
          const [A, B, C] = poly.coeffs;
          if (Math.abs(A) > 1e-9) {
            const kernelLatex = fn === 'ln' || isLn ? `\\ln(${variable})` : `\\log(${variable})`;
            return {
              kernelType: 'logarithmic',
              variable,
              kernelLatex,
              kernelPlain: `${fn}(${variable})`,
              domainNote: 'with domain restriction $x > 0$',
              A,
              B,
              C,
              isNaturalLog: fn === 'ln' || isLn,
            };
          }
        }
      }
    }
  }

  // 4. Radical substitution: f(x) = sqrt(x)
  if (diffExpr.includes('sqrt') && !/(?:sin|cos|tan|log|ln)\b/i.test(diffExpr)) {
    let t = diffExpr;
    // Replace sqrt(x) with __u
    t = t.replace(new RegExp('\\bsqrt\\s*\\(\\s*' + variable + '\\s*\\)', 'gi'), '(__u)');
    // Replace standalone variable x with (__u)^2
    t = t.replace(new RegExp('(?<![a-zA-Z0-9_])' + variable + '(?![a-zA-Z0-9_])(?!\\s*\\^)', 'gi'), '(__u)^2');

    const remainingVar = new RegExp('\\b' + variable + '\\b', 'i').test(t);
    if (!remainingVar) {
      const poly = extractCoefficients(t, '__u');
      if (poly && poly.degree === 2 && poly.coeffs.length === 3) {
        const [A, B, C] = poly.coeffs;
        if (Math.abs(A) > 1e-9) {
          return {
            kernelType: 'radical',
            variable,
            kernelLatex: `\\sqrt{${variable}}`,
            kernelPlain: `sqrt(${variable})`,
            domainNote: 'with domain restriction $x \\ge 0$ and $u \\ge 0$',
            A,
            B,
            C,
          };
        }
      }
    }
  }

  // 5. Biquadratic substitution: f(x) = x^2
  if (!/(?:sin|cos|tan|log|ln|sqrt)\b/i.test(diffExpr)) {
    const poly = extractCoefficients(diffExpr, variable);
    if (poly && poly.degree === 4 && poly.coeffs.length === 5) {
      const [c4, c3, c2, c1, c0] = poly.coeffs;
      if (Math.abs(c3) < 1e-7 && Math.abs(c1) < 1e-7 && Math.abs(c4) > 1e-9) {
        return {
          kernelType: 'biquadratic',
          variable,
          kernelLatex: `${variable}^2`,
          kernelPlain: `${variable}^2`,
          domainNote: 'with $u \\ge 0$',
          A: c4,
          B: c2,
          C: c0,
        };
      }
    }
  }

  return null;
}

/**
 * Solves any quadratic-in-disguise equation using textbook-quality u-substitution steps.
 */
export function trySolveUSubstitutionEquation(
  cleanEq: string,
  rawEquation?: string
): SolverResult | null {
  const norm = normalizeExpression(cleanEq);
  const det = detectUSubstitution(norm, rawEquation);
  if (!det) return null;

  const { A, B, C, variable, kernelLatex, kernelType, domainNote } = det;
  const steps: SolutionStep[] = [];
  let stepNumber = 1;

  // ── Step 1: Substitution definition & rewrite in quadratic standard form ──
  steps.push({
    stepNumber: stepNumber++,
    explanation: `Identify the equation as a quadratic in disguise. Let $u = ${kernelLatex}$ (${domainNote}). Substitute $u$ into the equation to rewrite it in quadratic standard form:`,
    math: formatQuadraticU(A, B, C),
  });

  // ── Step 2: Solve the quadratic equation in u ──
  const disc = B * B - 4 * A * C;
  const discLatex = `(${fmtVal(B)})^2 - 4(${fmtVal(A)})(${fmtVal(C)}) = ${fmt(B * B)} - ${fmt(4 * A * C)} = ${fmt(disc)}`;

  if (disc < -1e-7) {
    steps.push({
      stepNumber: stepNumber++,
      explanation: `Calculate the discriminant $\\Delta = B^2 - 4AC$. Since $\\Delta = ${fmt(disc)} < 0$, the quadratic in $u$ has no real solutions:`,
      math: `\\Delta = ${discLatex} < 0 \\implies \\text{No real solution for } u`,
    });
    steps.push({
      stepNumber: stepNumber++,
      explanation: `Since there are no real values for $u$, the original equation has no real solutions for $${variable}$.`,
      math: `\\text{No real solution}`,
    });
    return {
      type: kernelType === 'trig' ? 'trigonometric' : kernelType === 'exponential' ? 'exponential' : kernelType === 'logarithmic' ? 'logarithmic' : kernelType === 'radical' ? 'radical' : 'polynomial',
      equationType: kernelType === 'trig' ? 'trigonometric' : kernelType === 'exponential' ? 'exponential' : kernelType === 'logarithmic' ? 'logarithmic' : kernelType === 'radical' ? 'radical' : 'polynomial',
      steps,
      finalAnswer: '\\text{No real solution}',
      numericRoots: [],
    };
  }

  const sqrtDisc = Math.sqrt(Math.max(0, disc));
  const u1 = (-B + sqrtDisc) / (2 * A);
  const u2 = (-B - sqrtDisc) / (2 * A);

  const uRoots = Math.abs(disc) < 1e-6 ? [u1] : [u1, u2];
  const uRootsLatex = uRoots.map((u) => fmtVal(u));

  steps.push({
    stepNumber: stepNumber++,
    explanation: `Solve the quadratic equation in $u$ using the quadratic formula $u = \\frac{-B \\pm \\sqrt{\\Delta}}{2A}$ with coefficients $A = ${fmt(A)}$, $B = ${fmt(B)}$, and $C = ${fmt(C)}$:`,
    math: `u = \\frac{-(${fmtVal(B)}) \\pm \\sqrt{${fmt(disc)}}}{2(${fmtVal(A)})} \\implies ` +
      (uRoots.length === 1 ? `u = ${uRootsLatex[0]}` : `u_1 = ${uRootsLatex[0]}, \\quad u_2 = ${uRootsLatex[1]}`),
  });

  // ── Step 3: Back-substitute f(x) for each branch and solve ──
  const branchLines: string[] = [];
  const validXRoots: number[] = [];
  const exactXLatexList: string[] = [];
  const complexLatexList: string[] = [];

  for (let idx = 0; idx < uRoots.length; idx++) {
    const uVal = uRoots[idx];
    const uLabel = uRoots.length > 1 ? `u_${idx + 1}` : 'u';
    const uValLatex = fmtVal(uVal);

    if (kernelType === 'trig') {
      const trigFn = det.trigFunc || 'sin';
      if (trigFn === 'sin' || trigFn === 'cos') {
        if (uVal < -1 - 1e-5 || uVal > 1 + 1e-5) {
          branchLines.push(
            `\\textbf{Branch } ${uLabel} = ${uValLatex}: \\quad \\${trigFn}(${variable}) = ${uValLatex} \\implies \\text{No real solution (since } |\\${trigFn}(${variable})| \\le 1 \\text{)}`
          );
          continue;
        }
      }

      const branchRoots = solveBasicTrigRoots(trigFn, uVal);
      if (branchRoots.length > 0) {
        const branchAngles = branchRoots.map((r) => formatPiAngle(r));
        for (const r of branchRoots) {
          if (!validXRoots.some((ex) => Math.abs(ex - r) < 1e-4)) {
            validXRoots.push(r);
            exactXLatexList.push(formatPiAngle(r));
          }
        }

        // Detailed angle explanation
        let refAngleText = '';
        if (Math.abs(uVal) > 1e-6 && Math.abs(Math.abs(uVal) - 1) > 1e-6) {
          const refAngle = trigFn === 'sin' ? Math.asin(Math.abs(uVal)) : trigFn === 'cos' ? Math.acos(Math.abs(uVal)) : Math.atan(Math.abs(uVal));
          refAngleText = `\\text{ (Reference angle } \\alpha = ${formatPiAngle(refAngle)}\\text{)}`;
        }

        branchLines.push(
          `\\textbf{Branch } ${uLabel} = ${uValLatex}: \\quad \\${trigFn}(${variable}) = ${uValLatex}${refAngleText} \\implies ${variable} \\in \\left\\{ ${branchAngles.join(', \\; ')} \\right\\}`
        );
      }
    } else if (kernelType === 'exponential') {
      if (uVal <= 1e-7) {
        branchLines.push(
          `\\textbf{Branch } ${uLabel} = ${uValLatex}: \\quad ${kernelLatex} = ${uValLatex} \\implies \\text{No real solution (since } ${kernelLatex} > 0 \\text{ for all real } ${variable}\\text{)}`
        );
        continue;
      }

      let xVal: number;
      let xLatex: string;
      if (det.expBaseStr === 'e' || !det.expBase || det.expBase === Math.E) {
        xVal = Math.log(uVal);
        if (Math.abs(uVal - 1) < 1e-6) xLatex = '0';
        else if (Math.abs(uVal - Math.E) < 1e-6) xLatex = '1';
        else xLatex = `\\ln(${uValLatex})`;
      } else {
        const b = det.expBase;
        xVal = Math.log(uVal) / Math.log(b);
        // Check if uVal is an exact integer power of b
        const roundedExp = Math.round(xVal);
        if (Math.abs(Math.pow(b, roundedExp) - uVal) < 1e-6) {
          xVal = roundedExp;
          xLatex = String(roundedExp);
        } else {
          xLatex = `\\log_{${b}}(${uValLatex})`;
        }
      }

      validXRoots.push(xVal);
      exactXLatexList.push(xLatex);
      branchLines.push(
        `\\textbf{Branch } ${uLabel} = ${uValLatex}: \\quad ${kernelLatex} = ${uValLatex} \\implies ${variable} = ${xLatex}${xLatex.includes('\\ln') || xLatex.includes('\\log') ? ' \\approx ' + fmt(xVal) : ''}`
      );
    } else if (kernelType === 'logarithmic') {
      const isLn = det.isNaturalLog !== false;
      let xVal: number;
      let xLatex: string;
      if (isLn) {
        xVal = Math.exp(uVal);
        if (Math.abs(uVal) < 1e-6) xLatex = '1';
        else if (Math.abs(uVal - 1) < 1e-6) xLatex = 'e';
        else if (Number.isInteger(uVal)) xLatex = `e^{${fmt(uVal)}}`;
        else xLatex = `e^{${uValLatex}}`;
      } else {
        xVal = Math.pow(10, uVal);
        if (Math.abs(uVal) < 1e-6) xLatex = '1';
        else if (Number.isInteger(uVal) && uVal > 0 && uVal <= 6) xLatex = String(Math.pow(10, uVal));
        else xLatex = `10^{${uValLatex}}`;
      }

      // Check domain restriction x > 0
      if (xVal > 1e-9) {
        validXRoots.push(xVal);
        exactXLatexList.push(xLatex);
        branchLines.push(
          `\\textbf{Branch } ${uLabel} = ${uValLatex}: \\quad ${kernelLatex} = ${uValLatex} \\implies ${variable} = ${xLatex}${xLatex.includes('e') || xLatex.includes('10^') ? ' \\approx ' + fmt(xVal) : ''} \\quad (x > 0 \\; \\checkmark)`
        );
      } else {
        branchLines.push(
          `\\textbf{Branch } ${uLabel} = ${uValLatex}: \\quad ${kernelLatex} = ${uValLatex} \\implies \\text{Discarded (violates domain } x > 0\\text{)}`
        );
      }
    } else if (kernelType === 'radical') {
      if (uVal < -1e-6) {
        branchLines.push(
          `\\textbf{Branch } ${uLabel} = ${uValLatex}: \\quad \\sqrt{${variable}} = ${uValLatex} \\implies \\text{No real solution (since } \\sqrt{${variable}} \\ge 0 \\text{)}`
        );
        continue;
      }

      const xVal = uVal * uVal;
      const xLatex = fmtVal(xVal);
      validXRoots.push(xVal);
      exactXLatexList.push(xLatex);
      branchLines.push(
        `\\textbf{Branch } ${uLabel} = ${uValLatex}: \\quad \\sqrt{${variable}} = ${uValLatex} \\implies ${variable} = (${uValLatex})^2 = ${xLatex}`
      );
    } else if (kernelType === 'biquadratic') {
      if (uVal > 1e-6) {
        const sqrtU = Math.sqrt(uVal);
        const posRootLatex = fmtVal(sqrtU);
        validXRoots.push(-sqrtU, sqrtU);
        exactXLatexList.push(`-${posRootLatex}`, posRootLatex);
        branchLines.push(
          `\\textbf{Branch } ${uLabel} = ${uValLatex}: \\quad ${variable}^2 = ${uValLatex} \\implies ${variable} = \\pm\\sqrt{${uValLatex}} = \\pm ${posRootLatex}`
        );
      } else if (Math.abs(uVal) <= 1e-6) {
        validXRoots.push(0);
        exactXLatexList.push('0');
        branchLines.push(
          `\\textbf{Branch } ${uLabel} = 0: \\quad ${variable}^2 = 0 \\implies ${variable} = 0`
        );
      } else {
        const posMag = Math.sqrt(Math.abs(uVal));
        const imStr = Math.abs(posMag - 1) < 1e-6 ? 'i' : `${fmtVal(posMag)}\\,i`;
        complexLatexList.push(`\\pm ${imStr}`);
        branchLines.push(
          `\\textbf{Branch } ${uLabel} = ${uValLatex}: \\quad ${variable}^2 = ${uValLatex} \\implies ${variable} = \\pm i\\sqrt{${fmt(Math.abs(uVal))}} = \\pm ${imStr} \\quad \\text{(Complex roots)}`
        );
      }
    }
  }

  steps.push({
    stepNumber: stepNumber++,
    explanation: `Back-substitute $u = ${kernelLatex}$ for each value of $u$ and solve each branch for $${variable}$ (discarding any values outside the allowed domain):`,
    math: `\\begin{aligned} ${branchLines.join(' \\\\[6pt] ')} \\end{aligned}`,
  });

  // ── Step 4: Combine the final verified solution set ──
  if (validXRoots.length === 0 && complexLatexList.length === 0) {
    steps.push({
      stepNumber: stepNumber++,
      explanation: `Since all candidate branches yielded no real solutions within the valid domain, the equation has no real solutions.`,
      math: `\\text{No real solution}`,
    });
    return {
      type: kernelType === 'trig' ? 'trigonometric' : kernelType === 'exponential' ? 'exponential' : kernelType === 'logarithmic' ? 'logarithmic' : kernelType === 'radical' ? 'radical' : 'polynomial',
      equationType: kernelType === 'trig' ? 'trigonometric' : kernelType === 'exponential' ? 'exponential' : kernelType === 'logarithmic' ? 'logarithmic' : kernelType === 'radical' ? 'radical' : 'polynomial',
      steps,
      finalAnswer: '\\text{No real solution}',
      numericRoots: [],
    };
  }

  // Sort roots appropriately
  let finalAnswerStr = '';
  if (kernelType === 'trig') {
    // Sort angles on [0, 2pi]
    validXRoots.sort((a, b) => a - b);
    const sortedLatex = validXRoots.map((r) => formatPiAngle(r));
    finalAnswerStr = `${variable} \\in \\left\\{ ${sortedLatex.join(', \\; ')} \\right\\}`;

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Collect all unique solutions over the standard interval $[0, 2\\pi]$:`,
      math: finalAnswerStr,
    });
  } else {
    // Sort numeric roots
    const paired = validXRoots.map((r, i) => ({ val: r, tex: exactXLatexList[i] }));
    paired.sort((a, b) => a.val - b.val);
    const sortedTex = paired.map((p) => p.tex);

    const allSolutions = [...sortedTex, ...complexLatexList];
    if (allSolutions.length === 1) {
      finalAnswerStr = `${variable} = ${allSolutions[0]}`;
    } else if (complexLatexList.length > 0) {
      finalAnswerStr = `${variable} = ${allSolutions.join(', \\; ')}`;
    } else {
      finalAnswerStr = sortedTex.map((t, i) => `${variable}_${i + 1} = ${t}`).join(', \\quad ');
    }

    steps.push({
      stepNumber: stepNumber++,
      explanation: `Collect all verified real ${complexLatexList.length > 0 ? 'and complex ' : ''}solutions for $${variable}$:`,
      math: finalAnswerStr,
    });
  }

  const resultType =
    kernelType === 'trig'
      ? 'trigonometric'
      : kernelType === 'exponential'
      ? 'exponential'
      : kernelType === 'logarithmic'
      ? 'logarithmic'
      : kernelType === 'radical'
      ? 'radical'
      : 'polynomial';

  return {
    type: resultType,
    equationType: resultType,
    steps,
    finalAnswer: finalAnswerStr,
    numericRoots: validXRoots,
  };
}
