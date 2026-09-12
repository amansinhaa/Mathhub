/**
 * Rational Expression & Equation Solver
 *
 * Handles:
 * - Division of rational expressions: (A/B) ÷ (C/D) = (A/B) * (D/C)
 * - Multiplication of rational expressions: (A/B) * (C/D)
 * - Addition / Subtraction of rational expressions: (A/B) ± (C/D)
 * - Single fraction simplification: P(x) / Q(x)
 * - Rational equations with '=': P(x)/Q(x) = 0 or A(x)/B(x) = C(x)/D(x)
 *
 * Produces full step-by-step factoring, common factor cancellation (GCD),
 * both factored and expanded final forms, and explicit domain restrictions (excluded values).
 */

import type { SolverResult, SolutionStep } from '@/types/solver';
import * as math from 'mathjs';
// @ts-ignore
import nerdamer from 'nerdamer/all.min.js';
import { expressionToLatex } from './normalizer';

function cleanLatex(s: string): string {
  if (!s) return '';
  return s
    .replace(/\\cdot\s*([a-zA-Z])/g, '$1')
    .replace(/([0-9])\s+([a-zA-Z])/g, '$1$2')
    .replace(/\^\{1\}/g, '')
    .replace(/\^1\b/g, '')
    .trim();
}

export function stripOuterParens(s: string): string {
  let trimmed = s.trim();
  while (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    let depth = 0;
    let matched = true;
    for (let i = 0; i < trimmed.length - 1; i++) {
      if (trimmed[i] === '(') depth++;
      else if (trimmed[i] === ')') depth--;
      if (depth === 0) {
        matched = false;
        break;
      }
    }
    if (matched) {
      trimmed = trimmed.slice(1, -1).trim();
    } else {
      break;
    }
  }
  return trimmed;
}

export function splitTopLevel(expr: string, delimiter: string): [string, string] | null {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') depth--;
    else if (depth === 0 && expr.startsWith(delimiter, i)) {
      return [expr.slice(0, i).trim(), expr.slice(i + delimiter.length).trim()];
    }
  }
  return null;
}

export function polyToLatex(expr: string): string {
  try {
    return cleanLatex((nerdamer as any)(expr).toTeX());
  } catch {
    return expr;
  }
}

export function factorToLatex(expr: string): string {
  try {
    const f = (nerdamer as any)(`factor(${expr})`).toTeX();
    return cleanLatex(f);
  } catch {
    try {
      return cleanLatex((nerdamer as any)(expr).toTeX());
    } catch {
      return expr;
    }
  }
}

export function getDenominatorRoots(expr: string, variable: string = 'x'): string[] {
  try {
    const rootsStr = (nerdamer as any)(`roots(${expr}, ${variable})`).toString();
    const clean = rootsStr
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => Boolean(s) && !s.includes('i'));
    return (Array.from(new Set(clean)) as string[]).sort((a: string, b: string) => {
      const na = Number(a), nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  } catch {
    return [];
  }
}

/**
 * Detects if an expression string is a rational algebraic expression or equation.
 */
export function isRationalExpression(expr: string): boolean {
  const clean = expr.replace(/\s+/g, '');
  if (!clean.includes('/') && !clean.includes('÷') && !clean.includes('\\div')) {
    return false;
  }

  // Non-algebraic functions are handled by other solvers
  const nonAlgebraic = /\b(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|ln|exp|derivative|diff|int|integrate)\b/i;
  if (nonAlgebraic.test(clean)) {
    return false;
  }

  // Exponential equations with variable in exponent are handled by exponential solver
  if (/(?:\b\d+|e)\s*\^\s*(?:\([^)]*[a-zA-Z][^)]*\)|[a-zA-Z]\b)/i.test(clean)) {
    return false;
  }

  // Must contain a variable
  const hasVar = /[a-zA-Z]/.test(clean);
  if (!hasVar) return false;

  // Algebraic division operator ÷ is always a rational operation
  if (clean.includes('÷') || clean.includes('\\div')) return true;

  // For slash (/), at least one denominator must contain a variable (e.g. /x or /(x-1))
  const denMatches = clean.match(/\/\s*(\([^)]+\)|[a-zA-Z0-9^+-]+)/g) || [];
  const hasVarInDen = denMatches.some((d) => /[a-zA-Z]/.test(d));
  if (!hasVarInDen) {
    return false;
  }

  return true;
}

/**
 * Solves / simplifies rational expressions without '='.
 */
export function trySimplifyRationalExpression(cleanEq: string, rawEq: string): SolverResult | null {
  if (cleanEq.includes('=')) return null;
  if (!isRationalExpression(cleanEq)) return null;

  try {
    let input = cleanEq.trim();
    input = input.replace(/\\div/g, '÷');

    const variable = 'x';
    const steps: SolutionStep[] = [];
    let stepNumber = 1;

    // ──────────────────────────────────────────────────────────────────────────
    // CASE 1: Division of Fractions ((A/B) ÷ (C/D) or (A/B) / (C/D))
    // ──────────────────────────────────────────────────────────────────────────
    let divParts = splitTopLevel(input, '÷');
    if (!divParts && input.includes('/')) {
      const slashParts = splitTopLevel(stripOuterParens(input), '/');
      if (slashParts) {
        const leftFrac = splitTopLevel(stripOuterParens(slashParts[0]), '/');
        const rightFrac = splitTopLevel(stripOuterParens(slashParts[1]), '/');
        if (leftFrac && rightFrac) {
          divParts = [slashParts[0], slashParts[1]];
        }
      }
    }

    if (divParts) {
      const leftFrac = splitTopLevel(stripOuterParens(divParts[0]), '/');
      const rightFrac = splitTopLevel(stripOuterParens(divParts[1]), '/');

      const num1 = leftFrac ? stripOuterParens(leftFrac[0]) : stripOuterParens(divParts[0]);
      const den1 = leftFrac ? stripOuterParens(leftFrac[1]) : '1';
      const num2 = rightFrac ? stripOuterParens(rightFrac[0]) : stripOuterParens(divParts[1]);
      const den2 = rightFrac ? stripOuterParens(rightFrac[1]) : '1';

      const num1Tex = factorToLatex(num1);
      const den1Tex = factorToLatex(den1);
      const num2Tex = factorToLatex(num2);
      const den2Tex = factorToLatex(den2);

      // Step 1: Reciprocal multiplication (showing unfactored polynomials flipped)
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Rewrite division as multiplication by the reciprocal of the divisor fraction (flip the second fraction):',
        math: `\\frac{${polyToLatex(num1)}}{${polyToLatex(den1)}} \\cdot \\frac{${polyToLatex(den2)}}{${polyToLatex(num2)}}`,
      });

      // Step 2: Factor each polynomial and combine into a single fraction
      const combNumTex = `(${num1Tex}) \\cdot (${den2Tex})`.replace(/\(1\) \\cdot /g, '').replace(/ \\cdot \(1\)/g, '');
      const combDenTex = `(${den1Tex}) \\cdot (${num2Tex})`.replace(/\(1\) \\cdot /g, '').replace(/ \\cdot \(1\)/g, '');

      const subSteps = [
        ...(num1 !== '1' && num1 !== num1Tex ? [{ title: 'Factor Numerator 1', math: `${polyToLatex(num1)} = ${num1Tex}` }] : []),
        ...(den1 !== '1' && den1 !== den1Tex ? [{ title: 'Factor Denominator 1', math: `${polyToLatex(den1)} = ${den1Tex}` }] : []),
        ...(den2 !== '1' && den2 !== den2Tex ? [{ title: 'Factor Reciprocal Numerator', math: `${polyToLatex(den2)} = ${den2Tex}` }] : []),
        ...(num2 !== '1' && num2 !== num2Tex ? [{ title: 'Factor Reciprocal Denominator', math: `${polyToLatex(num2)} = ${num2Tex}` }] : []),
      ];

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Factor every polynomial completely and write as a single combined fraction:',
        math: `\\frac{${combNumTex}}{${combDenTex}}`,
        ...(subSteps.length > 0 ? { subSteps } : {}),
      });

      // Step 4: Expand and compute GCD for exact cancellation
      const expNum = (nerdamer as any)(`expand((${num1}) * (${den2}))`).toString();
      const expDen = (nerdamer as any)(`expand((${den1}) * (${num2}))`).toString();
      const gcdExpr = (nerdamer as any)(`gcd(${expNum}, ${expDen})`).toString();

      let simpNum = expNum;
      let simpDen = expDen;

      if (gcdExpr !== '1' && gcdExpr !== '-1') {
        const gcdTex = factorToLatex(gcdExpr);
        simpNum = (nerdamer as any)(`divide(${expNum}, ${gcdExpr})`).toString();
        simpDen = (nerdamer as any)(`divide(${expDen}, ${gcdExpr})`).toString();

        const sNumTex = factorToLatex(simpNum);
        const sDenTex = factorToLatex(simpDen);

        steps.push({
          stepNumber: stepNumber++,
          explanation: `Identify and cancel the greatest common factor $\\gcd = ${gcdTex}$ from the numerator and denominator:`,
          math: `\\frac{(${gcdTex}) \\cdot (${sNumTex})}{(${gcdTex}) \\cdot (${sDenTex})} = \\frac{${sNumTex}}{${sDenTex}}`,
        });
      }

      // Step 5: Final Answer
      const finalFactoredNum = factorToLatex(simpNum);
      const finalFactoredDen = factorToLatex(simpDen);
      const finalFactored = finalFactoredDen === '1' ? finalFactoredNum : `\\frac{${finalFactoredNum}}{${finalFactoredDen}}`;

      const expNumTex = cleanLatex((nerdamer as any)(simpNum).toTeX());
      const expDenTex = cleanLatex((nerdamer as any)(simpDen).toTeX());
      const finalExpanded = expDenTex === '1' ? expNumTex : `\\frac{${expNumTex}}{${expDenTex}}`;

      if (finalExpanded !== finalFactored) {
        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Expand the polynomial terms for the standard expanded form:',
          math: finalExpanded,
        });
      }

      // Step 6: Excluded values / Domain restrictions
      const r1 = getDenominatorRoots(den1, variable);
      const r2 = getDenominatorRoots(num2, variable);
      const r3 = getDenominatorRoots(den2, variable);
      const restrictions = (Array.from(new Set([...r1, ...r2, ...r3])) as string[]).sort((a: string, b: string) => {
        const na = Number(a), nb = Number(b);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.localeCompare(b);
      });

      if (restrictions.length > 0) {
        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Determine domain restrictions (the expression is undefined where any original denominator or divisor equals zero):',
          math: `${variable} \\neq ${restrictions.join(', ')}`,
        });
      }

      return {
        type: 'polynomial',
        steps,
        finalAnswer: finalFactored,
        inputInterpretation: `\\text{Simplify: } \\frac{${factorToLatex(num1)}}{${factorToLatex(den1)}} \\div \\frac{${factorToLatex(num2)}}{${factorToLatex(den2)}}`,
        numericRoots: [],
      };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CASE 2: Multiplication of Fractions ((A/B) * (C/D))
    // ──────────────────────────────────────────────────────────────────────────
    const multParts = splitTopLevel(input, '*');
    if (multParts) {
      const leftFrac = splitTopLevel(stripOuterParens(multParts[0]), '/');
      const rightFrac = splitTopLevel(stripOuterParens(multParts[1]), '/');

      if (leftFrac || rightFrac) {
        const num1 = leftFrac ? stripOuterParens(leftFrac[0]) : stripOuterParens(multParts[0]);
        const den1 = leftFrac ? stripOuterParens(leftFrac[1]) : '1';
        const num2 = rightFrac ? stripOuterParens(rightFrac[0]) : stripOuterParens(multParts[1]);
        const den2 = rightFrac ? stripOuterParens(rightFrac[1]) : '1';

        const num1Tex = factorToLatex(num1);
        const den1Tex = factorToLatex(den1);
        const num2Tex = factorToLatex(num2);
        const den2Tex = factorToLatex(den2);

        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Factor each numerator and denominator completely:',
          math: `\\text{Numerator 1: } ${num1Tex} \\\\[6pt] \\text{Denominator 1: } ${den1Tex} \\\\[6pt] \\text{Numerator 2: } ${num2Tex} \\\\[6pt] \\text{Denominator 2: } ${den2Tex}`,
        });

        const combNumTex = `(${num1Tex}) \\cdot (${num2Tex})`.replace(/\(1\) \\cdot /g, '').replace(/ \\cdot \(1\)/g, '');
        const combDenTex = `(${den1Tex}) \\cdot (${den2Tex})`.replace(/\(1\) \\cdot /g, '').replace(/ \\cdot \(1\)/g, '');

        steps.push({
          stepNumber: stepNumber++,
          explanation: 'Multiply numerators together and denominators together:',
          math: `\\frac{${combNumTex}}{${combDenTex}}`,
        });

        const expNum = (nerdamer as any)(`expand((${num1}) * (${num2}))`).toString();
        const expDen = (nerdamer as any)(`expand((${den1}) * (${den2}))`).toString();
        const gcdExpr = (nerdamer as any)(`gcd(${expNum}, ${expDen})`).toString();

        let simpNum = expNum;
        let simpDen = expDen;

        if (gcdExpr !== '1' && gcdExpr !== '-1') {
          const gcdTex = factorToLatex(gcdExpr);
          simpNum = (nerdamer as any)(`divide(${expNum}, ${gcdExpr})`).toString();
          simpDen = (nerdamer as any)(`divide(${expDen}, ${gcdExpr})`).toString();

          steps.push({
            stepNumber: stepNumber++,
            explanation: `Identify and cancel the greatest common factor $\\gcd = ${gcdTex}$ from the fraction:`,
            math: `\\frac{(${gcdTex}) \\cdot (${factorToLatex(simpNum)})}{(${gcdTex}) \\cdot (${factorToLatex(simpDen)})} = \\frac{${factorToLatex(simpNum)}}{${factorToLatex(simpDen)}}`,
          });
        }

        const finalFactored = simpDen === '1' ? factorToLatex(simpNum) : `\\frac{${factorToLatex(simpNum)}}{${factorToLatex(simpDen)}}`;

        const r1 = getDenominatorRoots(den1, variable);
        const r2 = getDenominatorRoots(den2, variable);
        const restrictions = (Array.from(new Set([...r1, ...r2])) as string[]).sort();

        if (restrictions.length > 0) {
          steps.push({
            stepNumber: stepNumber++,
            explanation: 'State domain restrictions (denominators cannot equal zero):',
            math: `${variable} \\neq ${restrictions.join(', ')}`,
          });
        }

        return {
          type: 'polynomial',
          steps,
          finalAnswer: finalFactored,
          inputInterpretation: `\\text{Simplify: } \\left(\\frac{${num1}}{${den1}}\\right) \\cdot \\left(\\frac{${num2}}{${den2}}\\right)`,
          numericRoots: [],
        };
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CASE 3: Single Rational Fraction P(x) / Q(x)
    // ──────────────────────────────────────────────────────────────────────────
    const singleSlash = splitTopLevel(stripOuterParens(input), '/');
    if (singleSlash) {
      const num = stripOuterParens(singleSlash[0]);
      const den = stripOuterParens(singleSlash[1]);

      const numTex = factorToLatex(num);
      const denTex = factorToLatex(den);

      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Factor the numerator and denominator completely:',
        math: `\\text{Numerator: } ${num} = ${numTex} \\\\[6pt] \\text{Denominator: } ${den} = ${denTex}`,
      });

      const g = (nerdamer as any)(`gcd(${num}, ${den})`).toString();
      let simpNum = num;
      let simpDen = den;

      if (g !== '1' && g !== '-1') {
        const gTex = factorToLatex(g);
        simpNum = (nerdamer as any)(`divide(${num}, ${g})`).toString();
        simpDen = (nerdamer as any)(`divide(${den}, ${g})`).toString();

        const sNumTex = factorToLatex(simpNum);
        const sDenTex = factorToLatex(simpDen);

        steps.push({
          stepNumber: stepNumber++,
          explanation: `Identify and cancel the common factor $\\gcd = ${gTex}$ from numerator and denominator:`,
          math: `\\frac{(${gTex}) \\cdot (${sNumTex})}{(${gTex}) \\cdot (${sDenTex})} = ${sDenTex === '1' ? sNumTex : `\\frac{${sNumTex}}{${sDenTex}}`}`,
        });
      }

      const finalFactoredNum = factorToLatex(simpNum);
      const finalFactoredDen = factorToLatex(simpDen);
      const finalAnswer = finalFactoredDen === '1' ? finalFactoredNum : `\\frac{${finalFactoredNum}}{${finalFactoredDen}}`;

      const restrictions = getDenominatorRoots(den, variable);
      if (restrictions.length > 0) {
        steps.push({
          stepNumber: stepNumber++,
          explanation: 'State domain restrictions where the original denominator equals zero ($Q(x) \\neq 0$):',
          math: `${variable} \\neq ${restrictions.join(', ')}`,
        });
      }

      return {
        type: 'polynomial',
        steps,
        finalAnswer,
        inputInterpretation: `\\text{Simplify: } \\frac{${num}}{${den}}`,
        numericRoots: [],
      };
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CASE 4: General Rational Expression Fallback
    // ──────────────────────────────────────────────────────────────────────────
    const simplified = (nerdamer as any)(`simplify(${input})`).toString();
    const finalLatex = cleanLatex((nerdamer as any)(simplified).toTeX());

    steps.push({
      stepNumber: stepNumber++,
      explanation: 'Simplify the rational expression by finding a common denominator and combining like terms:',
      math: finalLatex,
    });

    return {
      type: 'polynomial',
      steps,
      finalAnswer: finalLatex,
      inputInterpretation: `\\text{Simplify: } ${expressionToLatex(rawEq)}`,
      numericRoots: [],
    };
  } catch (e) {
    return null;
  }
}

/**
 * Solves rational equations containing '=' (e.g. (x^2-36)/x = 0 or 1/(x-1) = 2/(x+2)).
 */
export function trySolveRationalEquation(cleanEq: string, rawEq: string): SolverResult | null {
  if (!cleanEq.includes('=')) return null;
  if (!isRationalExpression(cleanEq)) return null;

  try {
    const parts = cleanEq.split('=');
    const lhs = parts[0].trim();
    const rhs = parts[1].trim();

    // Detect variable
    const varMatch = cleanEq.match(/[a-zA-Z]/);
    const variable = varMatch ? varMatch[0] : 'x';

    // Form: LHS - RHS = 0
    const standardDiff = `(${lhs}) - (${rhs})`;

    // Check denominators to find domain restrictions
    const denMatches = cleanEq.match(/\/\s*(\([^)]+\)|[a-zA-Z0-9^+-]+)/g) || [];
    const restrictionsSet = new Set<string>();

    for (const match of denMatches) {
      const denExpr = stripOuterParens(match.replace(/^\//, '').trim());
      const r = getDenominatorRoots(denExpr, variable);
      r.forEach((val) => restrictionsSet.add(val));
    }

    const restrictions = (Array.from(restrictionsSet) as string[]).sort((a: string, b: string) => {
      const na = Number(a), nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });

    const steps: SolutionStep[] = [];
    let stepNumber = 1;

    // Step 1: State domain restrictions
    if (restrictions.length > 0) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Identify domain restrictions (excluded values) by setting all denominators not equal to zero ($Q(x) \\neq 0$):',
        math: `${variable} \\neq ${restrictions.join(', ')}`,
      });
    }

    // Step 2 & 3: Decompose the rational equation into numerator and LCD
    let numExpr = '';
    let denExpr = '';

    const cleanLhs = stripOuterParens(lhs);
    const cleanRhs = stripOuterParens(rhs);

    const isSumL = splitTopLevel(cleanLhs, '+') !== null || splitTopLevel(cleanLhs, '-') !== null;
    const isSumR = splitTopLevel(cleanRhs, '+') !== null || splitTopLevel(cleanRhs, '-') !== null;

    const singleFracL = !isSumL ? splitTopLevel(cleanLhs, '/') : null;
    const singleFracR = !isSumR ? splitTopLevel(cleanRhs, '/') : null;

    if (singleFracL && (rhs === '0' || rhs === '')) {
      numExpr = stripOuterParens(singleFracL[0].trim());
      denExpr = stripOuterParens(singleFracL[1].trim());
    } else if (singleFracL && !singleFracR) {
      // E.g. (x - 1)/(1 - x) = 1
      const numL = stripOuterParens(singleFracL[0].trim());
      const denL = stripOuterParens(singleFracL[1].trim());
      denExpr = denL;
      numExpr = (nerdamer as any)(`expand((${numL}) - (${cleanRhs}) * (${denL}))`).toString();
    } else if (singleFracL && singleFracR) {
      // E.g. A/B = C/D -> A*D - B*C = 0
      const numL = stripOuterParens(singleFracL[0].trim());
      const denL = stripOuterParens(singleFracL[1].trim());
      const numR = stripOuterParens(singleFracR[0].trim());
      const denR = stripOuterParens(singleFracR[1].trim());
      denExpr = (nerdamer as any)(`expand((${denL}) * (${denR}))`).toString();
      numExpr = (nerdamer as any)(`expand((${numL}) * (${denR}) - (${numR}) * (${denL}))`).toString();
    } else {
      const simp = (nerdamer as any)(`simplify(${standardDiff})`);
      const sym = simp.symbol;
      const numTerms: string[] = [];
      const denTerms: string[] = [];

      if (sym.multiplier) {
        const numVal = sym.multiplier.num ? sym.multiplier.num.toString() : '1';
        const denVal = sym.multiplier.den ? sym.multiplier.den.toString() : '1';
        if (numVal !== '1') numTerms.push(numVal);
        if (denVal !== '1') denTerms.push(denVal);
      }

      if (sym.symbols) {
        for (const k in sym.symbols) {
          const s = sym.symbols[k];
          const pNum = s.power && s.power.num ? s.power.num.toString() : '1';
          if (pNum.startsWith('-')) {
            const absP = pNum.replace(/^-/, '');
            denTerms.push(absP === '1' ? `(${s.value})` : `(${s.value})^${absP}`);
          } else {
            numTerms.push(pNum === '1' ? `(${s.value})` : `(${s.value})^${pNum}`);
          }
        }
      } else {
        numTerms.push(sym.text());
      }

      numExpr = numTerms.length > 0 ? numTerms.join('*') : '0';
      denExpr = denTerms.length > 0 ? denTerms.join('*') : '1';

      // If nerdamer simplified away the denominator completely, reconstruct LCD from denMatches
      if (denExpr === '1' && denMatches.length > 0) {
        const rawDens = Array.from(new Set(denMatches.map((m) => stripOuterParens(m.replace(/^\//, '').trim()))));
        if (rawDens.length > 0) {
          denExpr = rawDens.map((d) => `(${d})`).join(' * ');
          numExpr = (nerdamer as any)(`expand((${standardDiff}) * (${denExpr}))`).toString();
        }
      }
    }

    // Step: Show factored denominators if any quadratic denominator exists
    const factorableDens: { raw: string; factored: string }[] = [];
    for (const match of denMatches) {
      const denExpr = stripOuterParens(match.replace(/^\//, '').trim());
      try {
        const factored = cleanLatex((nerdamer as any)(`factor(${denExpr})`).toTeX());
        const rawTeX = cleanLatex((nerdamer as any)(denExpr).toTeX());
        if (factored !== rawTeX && factored.includes('(')) {
          factorableDens.push({ raw: rawTeX, factored });
        }
      } catch {
        // ignore
      }
    }

    if (factorableDens.length > 0) {
      const factorEqs = factorableDens.map((fd) => `${fd.raw} = ${fd.factored}`).join(', \\quad ');
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Factor the denominators to identify the common denominator:',
        math: factorEqs,
      });
    }

    const lcdFactoredTeX = cleanLatex((nerdamer as any)(`factor(${denExpr})`).toTeX());
    const numExpandedStr = (nerdamer as any)(`expand(${numExpr})`).toString();
    const numExpandedTeX = cleanLatex((nerdamer as any)(`expand(${numExpr})`).toTeX())
      .replace(/\s*([+-])\s*/g, ' $1 ');
    const numFactoredTeX = cleanLatex((nerdamer as any)(`factor(${numExpr})`).toTeX())
      .replace(/\s*([+-])\s*/g, ' $1 ');

    const lhsTex = polyToLatex(lhs);
    const rhsTex = polyToLatex(rhs);
    const lcdNeedsParens = !lcdFactoredTeX.startsWith('(') && !lcdFactoredTeX.startsWith('\\left(') && (lcdFactoredTeX.includes('+') || lcdFactoredTeX.includes('-'));
    const lcdDisplay = lcdNeedsParens ? `\\left(${lcdFactoredTeX}\\right)` : lcdFactoredTeX;

    // Step: Multiply by LCD to clear fractions
    steps.push({
      stepNumber: stepNumber++,
      explanation: `Find the Least Common Denominator (LCD) and multiply both sides of the equation by $\\text{LCD} = ${lcdFactoredTeX}$ to clear all fractions:`,
      math: `${lcdDisplay} \\cdot \\left[ ${lhsTex} \\right] = ${lcdDisplay} \\cdot \\left[ ${rhsTex} \\right]`,
    });

    // Step: Simplify and combine like terms
    steps.push({
      stepNumber: stepNumber++,
      explanation: 'Expand the terms and collect like terms to simplify the equation:',
      math: `${numExpandedTeX} = 0`,
    });

    if (numFactoredTeX !== numExpandedTeX && numFactoredTeX.includes('(')) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: 'Factor the resulting polynomial equation:',
        math: `${numFactoredTeX} = 0`,
      });
    }

    // Step: Solve the polynomial numerator
    const rawSols = (nerdamer as any)(`solve(${numExpandedStr}, ${variable})`).toString();
    const cleanSols: string[] = rawSols
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    // If it's a linear equation like ax + b = 0, show the linear isolation step: ax = -b -> x = -b/a
    try {
      const deg = Number((nerdamer as any)(`deg(${numExpandedStr}, ${variable})`).toString());
      if (deg === 1 && cleanSols.length === 1) {
        const solVal = cleanSols[0];
        const solTeX = cleanLatex((nerdamer as any)(solVal).toTeX());
        steps.push({
          stepNumber: stepNumber++,
          explanation: `Solve for the variable $${variable}$ by isolating it:`,
          math: `${variable} = ${solTeX}`,
        });
      }
    } catch {
      // ignore
    }

    // Filter extraneous roots
    const validRoots: string[] = [];
    const extraneousRoots: string[] = [];

    for (const sol of cleanSols) {
      const numSol = Number(sol);
      const isExtraneous = restrictions.some((res) => {
        const numRes = Number(res);
        if (!isNaN(numSol) && !isNaN(numRes)) {
          return Math.abs(numSol - numRes) < 1e-6;
        }
        return sol === res;
      });

      if (isExtraneous) {
        extraneousRoots.push(sol);
      } else {
        validRoots.push(sol);
      }
    }

    if (extraneousRoots.length > 0) {
      steps.push({
        stepNumber: stepNumber++,
        explanation: `Check candidate roots against the domain restrictions. The candidate root(s) $${variable} = ${extraneousRoots.join(', ')}$ make the denominator zero and must be rejected as extraneous:`,
        math: `\\text{Extraneous root(s): } ${variable} = ${extraneousRoots.join(', ')} \\quad (\\text{rejected})`,
      });
    }

    const finalAnswer = validRoots.length > 0
      ? validRoots.map((r) => `${variable} = ${cleanLatex((nerdamer as any)(r).toTeX())}`).join(', ')
      : (extraneousRoots.length > 0
          ? `\\text{No real solution (extraneous root: } ${variable} = ${extraneousRoots.map((r) => cleanLatex((nerdamer as any)(r).toTeX())).join(', ')}\\text{)}`
          : '\\text{No real solution (inconsistent equation)}');

    steps.push({
      stepNumber: stepNumber++,
      explanation: 'State the final valid solution(s):',
      math: finalAnswer,
    });

    const numericRoots: number[] = validRoots
      .map((r) => parseFloat(r))
      .filter((n) => !isNaN(n) && isFinite(n));

    return {
      type: 'polynomial',
      steps,
      finalAnswer,
      inputInterpretation: `\\text{Solve rational equation: } ${expressionToLatex(cleanEq)}`,
      numericRoots,
    };
  } catch {
    return null;
  }
}
