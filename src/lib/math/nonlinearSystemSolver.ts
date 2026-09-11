/**
 * Nonlinear System of Equations Solver
 *
 * Solves systems of equations containing nonlinear terms (e.g. circles, parabolas,
 * hyperbolas, or quadratics intersected with lines or other curves) using the
 * algebraic substitution method and back-substitution.
 */

import nerdamer from 'nerdamer';
import type { SolverResult, SolutionStep } from '@/types/solver';
import { autoBalanceParens, normalizeExpression } from './normalizer';
import { solvePolynomial } from './solver';

export interface SolutionPair {
  x: number;
  y: number;
  xStr: string;
  yStr: string;
}

/**
 * Checks if a system of equations contains nonlinear terms.
 */
export function isNonlinearSystem(equations: string[]): boolean {
  for (const eq of equations) {
    const clean = autoBalanceParens(eq);
    // Check for powers >= 2, product terms like x*y, or nonlinear functions
    if (/\^[2-9]|\*\*|\^\{[2-9]\}|²|³|x\s*\*?\s*y|y\s*\*?\s*x|sqrt|sin|cos|exp/i.test(clean)) {
      return true;
    }
  }
  return false;
}

/**
 * Solves a 2-variable nonlinear system of equations using substitution.
 */
export function solveNonlinearSystem(equations: string[], variables: string[] = ['x', 'y']): SolverResult {
  const vars = variables.length >= 2 ? variables : ['x', 'y'];
  const [var1, var2] = vars;

  if (equations.length < 2) {
    throw new Error('A system requires at least two equations.');
  }

  const rawEq1 = autoBalanceParens(equations[0]);
  const rawEq2 = autoBalanceParens(equations[1]);

  // Determine standard forms: LHS - (RHS) = 0
  const toZeroForm = (eq: string): string => {
    if (eq.includes('=')) {
      const [lhs, rhs] = eq.split('=').map((s) => s.trim());
      return `(${normalizeExpression(lhs)}) - (${normalizeExpression(rhs)})`;
    }
    return normalizeExpression(eq);
  };

  const expr1 = toZeroForm(rawEq1);
  const expr2 = toZeroForm(rawEq2);

  // Check which equation is easier to isolate (prefer linear in var2, then var1)
  let isoEqIndex = 0; // 0 for eq1, 1 for eq2
  let isolatedVar = var2;
  let remainingVar = var1;
  let isolatedExpr: string | null = null;

  const tryIsolate = (expr: string, targetVar: string): string | null => {
    try {
      const sol = (nerdamer as any).solve(expr, targetVar);
      const solStr = String(sol || '');
      if (solStr && solStr !== '[]' && !solStr.includes('solve(')) {
        const clean = solStr.replace(/^\[|\]$/g, '').split(',')[0].trim();
        return clean;
      }
    } catch {
      // fall through
    }
    return null;
  };

  // Try isolating var2 in eq1, then eq2; then var1 in eq1, then eq2
  const iso1_y = tryIsolate(expr1, var2);
  const iso2_y = tryIsolate(expr2, var2);
  const iso1_x = tryIsolate(expr1, var1);
  const iso2_x = tryIsolate(expr2, var1);

  if (iso1_y && !iso1_y.includes('^2')) {
    isoEqIndex = 0;
    isolatedVar = var2;
    remainingVar = var1;
    isolatedExpr = iso1_y;
  } else if (iso2_y && !iso2_y.includes('^2')) {
    isoEqIndex = 1;
    isolatedVar = var2;
    remainingVar = var1;
    isolatedExpr = iso2_y;
  } else if (iso1_x && !iso1_x.includes('^2')) {
    isoEqIndex = 0;
    isolatedVar = var1;
    remainingVar = var2;
    isolatedExpr = iso1_x;
  } else if (iso2_x && !iso2_x.includes('^2')) {
    isoEqIndex = 1;
    isolatedVar = var1;
    remainingVar = var2;
    isolatedExpr = iso2_x;
  } else {
    // Default to whichever produced a solution
    isolatedExpr = iso1_y || iso2_y || iso1_x || iso2_x;
    if (!isolatedExpr) {
      throw new Error('Could not algebraically isolate any variable for substitution.');
    }
  }

  const otherExpr = isoEqIndex === 0 ? expr2 : expr1;
  const isoSourceEq = isoEqIndex === 0 ? rawEq1 : rawEq2;
  const otherSourceEq = isoEqIndex === 0 ? rawEq2 : rawEq1;

  // Substitute isolatedVar into otherExpr
  const substitutedExpr = otherExpr.replace(new RegExp(`\\b${isolatedVar}\\b`, 'g'), `(${isolatedExpr})`);

  let simplifiedSubExpr: string;
  try {
    simplifiedSubExpr = nerdamer(substitutedExpr).expand().text();
  } catch {
    simplifiedSubExpr = substitutedExpr;
  }

  // Solve the substituted univariate equation
  const polyResult = solvePolynomial(`${simplifiedSubExpr} = 0`);

  // Extract real roots
  const roots: number[] = polyResult.numericRoots && polyResult.numericRoots.length > 0
    ? polyResult.numericRoots
    : [];

  if (roots.length === 0) {
    // Attempt nerdamer roots extraction
    try {
      const sols = (nerdamer as any).solve(simplifiedSubExpr, remainingVar);
      const cleanSols = String(sols || '')
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((s: string) => Number(nerdamer(s.trim()).evaluate().text()))
        .filter((n: number) => !isNaN(n) && isFinite(n));
      roots.push(...cleanSols);
    } catch {
      // no roots
    }
  }

  // Back-substitute to find corresponding coordinates
  const solutionPairs: SolutionPair[] = [];
  for (const r of roots) {
    try {
      const backVal = Number((nerdamer as any)(isolatedExpr, { [remainingVar]: r }).evaluate().text());
      const rClean = Number(r.toFixed(4));
      const backClean = Number(backVal.toFixed(4));

      const xVal = isolatedVar === 'x' ? backClean : rClean;
      const yVal = isolatedVar === 'y' ? backClean : rClean;

      // Deduplicate
      if (!solutionPairs.some((p) => Math.abs(p.x - xVal) < 1e-4 && Math.abs(p.y - yVal) < 1e-4)) {
        solutionPairs.push({
          x: xVal,
          y: yVal,
          xStr: String(xVal),
          yStr: String(yVal),
        });
      }
    } catch {
      // skip invalid evaluation
    }
  }

  const isoLatex = nerdamer(isolatedExpr).toTeX();
  const subLatex = nerdamer(simplifiedSubExpr).toTeX();

  const pairsLatex = solutionPairs.length > 0
    ? solutionPairs.map((p) => `(${p.x}, ${p.y})`).join(',\\quad ')
    : '\\text{No real intersection points}';

  const steps: SolutionStep[] = [
    {
      stepNumber: 1,
      explanation: `Identify the nonlinear system of equations with variables $${var1}$ and $${var2}$.`,
      math: `\\begin{cases} ${nerdamer(toZeroForm(rawEq1)).toTeX()} = 0 \\\\ ${nerdamer(toZeroForm(rawEq2)).toTeX()} = 0 \\end{cases}`,
    },
    {
      stepNumber: 2,
      explanation: `Isolate variable $${isolatedVar}$ from equation: $${isoSourceEq}$.`,
      math: `${isolatedVar} = ${isoLatex}`,
    },
    {
      stepNumber: 3,
      explanation: `Substitute $${isolatedVar} = ${isoLatex}$ into the second equation: $${otherSourceEq}$.`,
      math: `${subLatex} = 0`,
    },
    {
      stepNumber: 4,
      explanation: `Solve the resulting single-variable polynomial equation for $${remainingVar}$.`,
      math: `${remainingVar} = ${roots.map((r) => Number(r.toFixed(4))).join(',\\quad ')}`,
    },
    {
      stepNumber: 5,
      explanation: `Back-substitute each root for $${remainingVar}$ into $${isolatedVar} = ${isoLatex}$ to determine the complete coordinate pairs.`,
      math: solutionPairs.map((p) => {
        const primary = isolatedVar === 'x' ? p.y : p.x;
        const secondary = isolatedVar === 'x' ? p.x : p.y;
        return `\\text{For } ${remainingVar} = ${primary} \\implies ${isolatedVar} = ${secondary}`;
      }).join('\\\\ '),
    },
    {
      stepNumber: 6,
      explanation: `Collect all real intersection solutions $(x, y)$:`,
      math: `(x, y) \\in \\{ ${pairsLatex} \\}`,
    },
  ];

  return {
    type: 'system',
    steps,
    finalAnswer: `(x, y) \\in \\{ ${pairsLatex} \\}`,
    decimalAnswer: solutionPairs.map((p) => `(${p.x}, ${p.y})`).join(', '),
    inputInterpretation: `\\begin{cases} ${rawEq1} \\\\ ${rawEq2} \\end{cases}`,
  };
}
