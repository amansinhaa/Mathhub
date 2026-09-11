/**
 * Parametric Equation Solver
 *
 * Solves polynomial and algebraic equations containing symbolic parameters
 * (e.g. 2x^2 + 3x - m + 2 = 0, kx^2 + 4x + 1 = 0, ax^2 + bx + c = 0)
 *
 * Generates comprehensive pedagogical steps:
 * 1. Identify symbolic coefficients (a, b, c)
 * 2. Compute and expand the Discriminant Δ = b^2 - 4ac in terms of parameters
 * 3. Apply the Quadratic Formula x = (-b ± √Δ) / 2a with full substitutions
 * 4. Provide separate clean formulas for x_1 and x_2
 * 5. Provide Nature of Roots Analysis (Δ > 0, Δ = 0, Δ < 0) based on parameter values
 */

// @ts-ignore
import nerdamer from 'nerdamer/all.min.js';
import type { SolverResult, SolutionStep } from '@/types/solver';
import { normalizeExpression, autoBalanceParens, autoInterpretEquals } from './normalizer';

const RESERVED_IDENTIFIERS = new Set([
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
  'log', 'ln', 'exp', 'sqrt', 'cbrt', 'abs',
  'ceil', 'floor', 'round', 'sign', 'min', 'max',
  'pi', 'PI', 'e', 'i',
]);

export interface ParametricDetection {
  isParametric: boolean;
  primaryVar: string;
  parameters: string[];
}

/**
 * Detects if an equation contains a primary unknown variable (e.g. x)
 * along with one or more symbolic parameters (e.g. m, k, a, b, c).
 */
export function detectParametricEquation(input: string, preferredVar?: string): ParametricDetection {
  const clean = input.trim();
  const tokens = (clean.match(/[a-zA-Z]+/g) || []).filter(
    (tok) => tok.length === 1 && !RESERVED_IDENTIFIERS.has(tok)
  );

  const unique = Array.from(new Set(tokens));
  if (unique.length <= 1) {
    return { isParametric: false, primaryVar: unique[0] || 'x', parameters: [] };
  }

  // Determine primary variable:
  // If explicitly specified and exists:
  let primary = preferredVar && unique.includes(preferredVar) ? preferredVar : '';

  if (!primary) {
    // Standard mathematical hierarchy: x, then y, then z, then t
    if (unique.includes('x')) primary = 'x';
    else if (unique.includes('y')) primary = 'y';
    else if (unique.includes('z')) primary = 'z';
    else if (unique.includes('t')) primary = 't';
    else primary = unique[0];
  }

  const parameters = unique.filter((v) => v !== primary);

  return {
    isParametric: parameters.length > 0,
    primaryVar: primary,
    parameters,
  };
}

/**
 * Solves a parametric quadratic or polynomial equation with step-by-step analysis.
 */
export function solveParametricEquation(input: string, primaryVar?: string): SolverResult {
  let cleanEq = autoBalanceParens(input.trim());
  const interpretation = autoInterpretEquals(cleanEq);
  if (interpretation.interpreted) {
    cleanEq = interpretation.expr;
  }
  cleanEq = normalizeExpression(cleanEq);

  const detection = detectParametricEquation(cleanEq, primaryVar);
  const variable = detection.primaryVar;
  const mainParam = detection.parameters[0] || 'm';

  // Bring to LHS - RHS = 0 form
  const [lhsRaw, rhsRaw] = cleanEq.split('=');
  const lhs = (lhsRaw || '').trim();
  const rhs = (rhsRaw || '0').trim();
  const standardExpr = rhs && rhs !== '0' ? `(${lhs}) - (${rhs})` : lhs;

  // Format problem display
  const displayEq = cleanEq.replace(/\*/g, '').replace(/\^(\d+)/g, '^{$1}');
  const interpretationLatex = `\\text{Solve } ${displayEq} \\text{ for variable } ${variable} \\text{ in terms of parameter } ${detection.parameters.join(', ')}`;

  // Extract coefficients for primary variable using nerdamer
  let coeffsList: any[] = [];
  try {
    const c = (nerdamer as any).coeffs(standardExpr, variable);
    if (c && c.symbol && c.symbol.elements) {
      coeffsList = c.symbol.elements;
    }
  } catch (err: any) {
    throw new Error(`Failed to extract parametric coefficients: ${err?.message || err}`);
  }

  // Degree is length - 1
  const degree = coeffsList.length - 1;

  if (degree === 2) {
    return solveParametricQuadratic({
      standardExpr,
      coeffsList,
      variable,
      mainParam,
      allParams: detection.parameters,
      interpretationLatex,
    });
  }

  // Degree 1 (Parametric linear equation: A*x + B = 0 => x = -B/A)
  if (degree === 1) {
    const aSym = coeffsList[1];
    const bSym = coeffsList[0];
    const aTex = (nerdamer as any)(aSym).toTeX();
    const bTex = (nerdamer as any)(bSym).toTeX();
    const sol = (nerdamer as any).solve(standardExpr, variable).toString().replace(/^\[|\]$/g, '');
    const solTex = (nerdamer as any)(sol).toTeX();

    const steps: SolutionStep[] = [
      {
        stepNumber: 1,
        explanation: `Write in standard linear form $A${variable} + B = 0$:`,
        math: `A = ${aTex}, \\quad B = ${bTex}`,
      },
      {
        stepNumber: 2,
        explanation: `Isolate $${variable}$ by subtracting $B$ and dividing by $A$:`,
        math: `${variable} = -\\frac{B}{A} = ${solTex}`,
      },
    ];

    return {
      type: 'polynomial',
      steps,
      finalAnswer: `${variable} = ${solTex}`,
      inputInterpretation: interpretationLatex,
    };
  }

  // Higher degree fallback via symbolic solver
  const solutions = (nerdamer as any).solve(standardExpr, variable);
  const solElements = solutions?.symbol?.elements || [];
  const solTexs: string[] = solElements.map((s: any) => (nerdamer as any)(s).toTeX());

  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      explanation: `Express equation in standard polynomial form with variable $${variable}$:`,
      math: `f(${variable}) = 0`,
    },
    {
      stepNumber: 2,
      explanation: `Solve algebraically for $${variable}$ in terms of $${detection.parameters.join(', ')}$:`,
      math: solTexs.map((s, idx) => `${variable}_{${idx + 1}} = ${s}`).join(', \\quad '),
    },
  ];

  return {
    type: 'polynomial',
    steps,
    finalAnswer: solTexs.map((s, idx) => `${variable}_{${idx + 1}} = ${s}`).join(', \\quad '),
    inputInterpretation: interpretationLatex,
  };
}

/**
 * Handles full pedagogical quadratic parametric solution with discriminant analysis.
 */
function solveParametricQuadratic(opts: {
  standardExpr: string;
  coeffsList: any[];
  variable: string;
  mainParam: string;
  allParams: string[];
  interpretationLatex: string;
}): SolverResult {
  const { standardExpr, coeffsList, variable, mainParam, interpretationLatex } = opts;

  // nerdamer returns coeffs in ascending order: [c, b, a]
  const cSym = coeffsList[0];
  const bSym = coeffsList[1];
  const aSym = coeffsList[2];

  const aTxt = (nerdamer as any)(aSym).text();
  const bTxt = (nerdamer as any)(bSym).text();
  const cTxt = (nerdamer as any)(cSym).text();

  const aTex = (nerdamer as any)(aSym).toTeX();
  const bTex = (nerdamer as any)(bSym).toTeX();
  const cTex = (nerdamer as any)(cSym).toTeX();

  // Compute and expand discriminant Δ = b^2 - 4ac
  const discExpr = `(${bTxt})^2 - 4*(${aTxt})*(${cTxt})`;
  const deltaExpanded = (nerdamer as any)(discExpr).expand();
  const deltaTex = deltaExpanded.toTeX();
  const deltaTxt = deltaExpanded.text();

  // Solve for roots using nerdamer
  const solutions = (nerdamer as any).solve(standardExpr, variable);
  const solElements = solutions?.symbol?.elements || [];
  const solTexs: string[] = solElements.map((s: any) => (nerdamer as any)(s).toTeX());

  let x1Tex = solTexs[0] || `\\frac{-${bTex} + \\sqrt{${deltaTex}}}{2(${aTex})}`;
  let x2Tex = solTexs[1] || `\\frac{-${bTex} - \\sqrt{${deltaTex}}}{2(${aTex})}`;

  // Analyze nature of roots based on parameter
  let natureOfRootsSteps: string[] = [];
  try {
    const deltaCoeffs = (nerdamer as any).coeffs(deltaTxt, mainParam);
    if (deltaCoeffs && deltaCoeffs.symbol && deltaCoeffs.symbol.elements.length === 2) {
      // Linear in mainParam: slope * param + intercept
      const slope = Number((nerdamer as any)(deltaCoeffs.symbol.elements[1]).evaluate().text());
      const critRaw = (nerdamer as any).solve(deltaTxt, mainParam).toString().replace(/^\[|\]$/g, '');
      const critTex = (nerdamer as any)(critRaw).toTeX();

      if (!isNaN(slope) && critTex) {
        if (slope > 0) {
          natureOfRootsSteps = [
            `\\bullet \\textbf{ Two distinct real roots: } \\text{when } \\Delta > 0 \\implies ${deltaTex} > 0 \\implies \\mathbf{${mainParam} > ${critTex}}`,
            `\\bullet \\textbf{ One repeated real root: } \\text{when } \\Delta = 0 \\implies ${deltaTex} = 0 \\implies \\mathbf{${mainParam} = ${critTex}} \\quad \\left(${variable} = -\\frac{b}{2a} = -\\frac{${bTex}}{2(${aTex})}\\right)`,
            `\\bullet \\textbf{ Two complex conjugate roots: } \\text{when } \\Delta < 0 \\implies ${deltaTex} < 0 \\implies \\mathbf{${mainParam} < ${critTex}}`,
          ];
        } else {
          natureOfRootsSteps = [
            `\\bullet \\textbf{ Two distinct real roots: } \\text{when } \\Delta > 0 \\implies ${deltaTex} > 0 \\implies \\mathbf{${mainParam} < ${critTex}}`,
            `\\bullet \\textbf{ One repeated real root: } \\text{when } \\Delta = 0 \\implies ${deltaTex} = 0 \\implies \\mathbf{${mainParam} = ${critTex}} \\quad \\left(${variable} = -\\frac{b}{2a} = -\\frac{${bTex}}{2(${aTex})}\\right)`,
            `\\bullet \\textbf{ Two complex conjugate roots: } \\text{when } \\Delta < 0 \\implies ${deltaTex} < 0 \\implies \\mathbf{${mainParam} > ${critTex}}`,
          ];
        }
      }
    }
  } catch {
    // Nature of roots stays general
  }

  if (natureOfRootsSteps.length === 0) {
    natureOfRootsSteps = [
      `\\bullet \\textbf{ Two distinct real roots: } \\text{when } \\Delta = ${deltaTex} > 0`,
      `\\bullet \\textbf{ One repeated real root: } \\text{when } \\Delta = ${deltaTex} = 0`,
      `\\bullet \\textbf{ Two complex conjugate roots: } \\text{when } \\Delta = ${deltaTex} < 0`,
    ];
  }

  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      explanation: `Write in standard quadratic form $ax^2 + bx + c = 0$ and identify coefficients with respect to $${variable}$:` ,
      math: `a = ${aTex}, \\quad b = ${bTex}, \\quad c = ${cTex}`,
    },
    {
      stepNumber: 2,
      explanation: `Compute the Discriminant $\\Delta = b^2 - 4ac$:`,
      math: `\\Delta = (${bTex})^2 - 4(${aTex})(${cTex}) = ${deltaTex}`,
    },
    {
      stepNumber: 3,
      explanation: `Apply the Quadratic Formula: $${variable} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$.`,
      math: `${variable} = \\frac{-(${bTex}) \\pm \\sqrt{${deltaTex}}}{2(${aTex})}`,
    },
    {
      stepNumber: 4,
      explanation: `Simplify to obtain the final solutions for $${variable}_1$ and $${variable}_2$:`,
      math: `${variable}_1 = ${x1Tex}, \\qquad ${variable}_2 = ${x2Tex}`,
    },
    {
      stepNumber: 5,
      explanation: `Nature of the Roots (depending on parameter $${mainParam}$):`,
      math: natureOfRootsSteps.join(' \\\\[6pt] '),
    },
  ];

  const finalAnswer = `${variable}_1 = ${x1Tex}, \\quad ${variable}_2 = ${x2Tex}`;

  return {
    type: 'polynomial',
    steps,
    finalAnswer,
    inputInterpretation: interpretationLatex,
  };
}
