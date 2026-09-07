// @ts-ignore
import nerdamer from 'nerdamer/all.min.js';
import { SolverResult, SolutionStep } from '@/types/solver';
import { normalizeExpression, autoBalanceParens } from './normalizer';
import { detectVariable } from './solver';

/**
 * Common differentiation rules and their LaTeX representations.
 */
const DIFF_RULES = {
  power: {
    name: 'Power Rule',
    latex: '\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}',
    description: 'Bring the exponent in front and subtract 1 from the power.',
  },
  constant: {
    name: 'Constant Rule',
    latex: '\\frac{d}{dx}[c] = 0',
    description: 'The derivative of any constant number is zero.',
  },
  linear: {
    name: 'Linear Rule',
    latex: '\\frac{d}{dx}[c \\cdot x] = c',
    description: 'The derivative of a linear term cx is simply the coefficient c.',
  },
  sum: {
    name: 'Sum & Difference Rule',
    latex: '\\frac{d}{dx}[u \\pm v] = \\frac{du}{dx} \\pm \\frac{dv}{dx}',
    description: 'Differentiate each term individually and combine them.',
  },
  sin: {
    name: 'Sine Derivative',
    latex: '\\frac{d}{dx}[\\sin(x)] = \\cos(x)',
    description: 'The derivative of sin(x) is cos(x).',
  },
  cos: {
    name: 'Cosine Derivative',
    latex: '\\frac{d}{dx}[\\cos(x)] = -\\sin(x)',
    description: 'The derivative of cos(x) is -sin(x).',
  },
  tan: {
    name: 'Tangent Derivative',
    latex: '\\frac{d}{dx}[\\tan(x)] = \\sec^2(x)',
    description: 'The derivative of tan(x) is sec²(x).',
  },
  exp: {
    name: 'Exponential Rule',
    latex: '\\frac{d}{dx}[e^x] = e^x',
    description: 'The exponential function e^x is its own derivative.',
  },
  ln: {
    name: 'Natural Log Rule',
    latex: '\\frac{d}{dx}[\\ln(x)] = \\frac{1}{x}',
    description: 'The derivative of the natural log ln(x) is 1/x.',
  },
  product: {
    name: 'Product Rule',
    latex: '\\frac{d}{dx}[u \\cdot v] = u\'v + uv\'',
    description: 'Derivative of first times second plus first times derivative of second.',
  },
};

/**
 * Common integration rules and their LaTeX representations.
 */
const INT_RULES = {
  power: {
    name: 'Power Rule for Integration',
    latex: '\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)',
    description: 'Add 1 to the exponent and divide by the new exponent.',
  },
  constant: {
    name: 'Constant Rule for Integration',
    latex: '\\int c \\, dx = c \\cdot x + C',
    description: 'The integral of a constant c is c*x plus the constant of integration.',
  },
  sum: {
    name: 'Sum & Difference Rule',
    latex: '\\int [u \\pm v] \\, dx = \\int u \\, dx \\pm \\int v \\, dx',
    description: 'Integrate each term individually.',
  },
  oneOverX: {
    name: 'Logarithmic Integration Rule',
    latex: '\\int \\frac{1}{x} \\, dx = \\ln|x| + C',
    description: 'Special case of power rule when n = -1.',
  },
  sin: {
    name: 'Sine Integration',
    latex: '\\int \\sin(x) \\, dx = -\\cos(x) + C',
    description: 'The integral of sin(x) is -cos(x) + C.',
  },
  cos: {
    name: 'Cosine Integration',
    latex: '\\int \\cos(x) \\, dx = \\sin(x) + C',
    description: 'The integral of cos(x) is sin(x) + C.',
  },
  exp: {
    name: 'Exponential Integration',
    latex: '\\int e^x \\, dx = e^x + C',
    description: 'The integral of e^x is e^x + C.',
  },
};

/**
 * Solve step-by-step differentiation of any function f(x).
 */
export function solveDerivative(expression: string): SolverResult {
  let clean = expression.trim();
  clean = autoBalanceParens(clean);
  // Remove f(x)= or y= if user typed it
  clean = clean.replace(/^(?:f\([a-zA-Z]\)|y)\s*=\s*/, '');
  clean = normalizeExpression(clean);

  const variable = detectVariable(clean) || 'x';
  const steps: SolutionStep[] = [];
  let stepNum = 1;

  try {
    const nerdamerExpr = (nerdamer as any)(clean);
    const latexExpr = nerdamerExpr.toTeX();
    const resultDiff = (nerdamer as any).diff(clean, variable);
    const finalLatex = resultDiff.toTeX();

    // Step 1: Problem setup
    steps.push({
      stepNumber: stepNum++,
      explanation: `Set up the differentiation problem with respect to variable $${variable}$.`,
      math: `\\frac{d}{d${variable}} \\left[ ${latexExpr} \\right]`,
      formulaUsed: {
        name: 'Notation',
        latex: '\\frac{d}{d' + variable + '}[f(' + variable + ')]',
        description: 'Differentiating with respect to variable ' + variable,
      },
    });

    // Check if expression is a sum of terms (e.g. polynomial)
    const terms = clean.split(/(?=[+-])/).map((t) => t.trim()).filter(Boolean);

    if (terms.length > 1) {
      // Step 2: Sum/Difference Rule
      steps.push({
        stepNumber: stepNum++,
        explanation: 'Apply the Sum & Difference Rule: differentiate each term separately.',
        math: `\\frac{d}{d${variable}} \\left[ ${latexExpr} \\right] = ` +
          terms.map((t) => {
            const cleanT = t.replace(/^\+/, '').trim();
            const sign = t.startsWith('-') ? '- ' : '+ ';
            return `${sign}\\frac{d}{d${variable}}\\left[ ${(nerdamer as any)(cleanT).toTeX()} \\right]`;
          }).join(' ').replace(/^(\+|-)\s*/, (m) => m.startsWith('-') ? '-' : ''),
        formulaUsed: DIFF_RULES.sum,
      });

      // Step 3: Differentiate each individual term
      for (const t of terms) {
        const isNeg = t.startsWith('-');
        const cleanT = t.replace(/^[+-]/, '').trim();
        const termNerd = (nerdamer as any)(cleanT);
        const termDiff = (nerdamer as any).diff(cleanT, variable);
        const termLatex = termNerd.toTeX();
        const diffLatex = termDiff.toTeX();

        let matchedRule = DIFF_RULES.power;
        let explanation = `Differentiate $${termLatex}$ using the Power Rule.`;

        if (!cleanT.includes(variable)) {
          matchedRule = DIFF_RULES.constant;
          explanation = `The derivative of constant $${termLatex}$ is $0$.`;
        } else if (cleanT === variable || cleanT.match(new RegExp(`^\\d+\\*?${variable}$`))) {
          matchedRule = DIFF_RULES.linear;
          explanation = `The derivative of linear term $${termLatex}$ is its coefficient.`;
        } else if (cleanT.includes('sin')) {
          matchedRule = DIFF_RULES.sin;
          explanation = `Differentiate $\\sin(${variable})$ to get $\\cos(${variable})$.`;
        } else if (cleanT.includes('cos')) {
          matchedRule = DIFF_RULES.cos;
          explanation = `Differentiate $\\cos(${variable})$ to get $-\\sin(${variable})$.`;
        } else if (cleanT.includes('tan')) {
          matchedRule = DIFF_RULES.tan;
          explanation = `Differentiate $\\tan(${variable})$ to get $\\sec^2(${variable})$.`;
        } else if (cleanT.includes('exp') || cleanT.includes('e^')) {
          matchedRule = DIFF_RULES.exp;
          explanation = `Differentiate exponential term $${termLatex}$.`;
        } else if (cleanT.includes('log') || cleanT.includes('ln')) {
          matchedRule = DIFF_RULES.ln;
          explanation = `Differentiate natural logarithm term $${termLatex}$.`;
        }

        steps.push({
          stepNumber: stepNum++,
          explanation,
          math: `\\frac{d}{d${variable}}\\left[ ${termLatex} \\right] = ${diffLatex}`,
          formulaUsed: matchedRule,
        });
      }

      // Step 4: Combine all differentiated terms
      steps.push({
        stepNumber: stepNum++,
        explanation: 'Combine all term derivatives and simplify algebraic terms.',
        math: `\\frac{d}{d${variable}}\\left[ ${latexExpr} \\right] = ${finalLatex}`,
      });
    } else {
      // Single term differentiation
      let matchedRule = DIFF_RULES.power;
      if (clean.includes('sin')) matchedRule = DIFF_RULES.sin;
      else if (clean.includes('cos')) matchedRule = DIFF_RULES.cos;
      else if (clean.includes('tan')) matchedRule = DIFF_RULES.tan;
      else if (clean.includes('exp') || clean.includes('e^')) matchedRule = DIFF_RULES.exp;
      else if (clean.includes('log') || clean.includes('ln')) matchedRule = DIFF_RULES.ln;
      else if (!clean.includes(variable)) matchedRule = DIFF_RULES.constant;

      steps.push({
        stepNumber: stepNum++,
        explanation: `Apply the ${matchedRule.name} to compute the derivative.`,
        math: `\\frac{d}{d${variable}} \\left[ ${latexExpr} \\right] = ${finalLatex}`,
        formulaUsed: matchedRule,
      });
    }

    return {
      type: 'derivative',
      steps,
      finalAnswer: `f'(${variable}) = ${finalLatex}`,
      inputInterpretation: `\\text{Differentiate } f(${variable}) = ${latexExpr} \\text{ with respect to } ${variable}`,
    };
  } catch (err: any) {
    return {
      type: 'derivative',
      steps: [
        {
          stepNumber: 1,
          explanation: 'Could not compute the derivative. Please check expression syntax.',
          math: `\\text{Input: } ${expression}`,
        },
      ],
      finalAnswer: '\\text{Error evaluating derivative}',
    };
  }
}

/**
 * Solve step-by-step indefinite integration of any function f(x).
 */
export function solveIntegral(expression: string): SolverResult {
  let clean = expression.trim();
  clean = autoBalanceParens(clean);
  clean = clean.replace(/^(?:f\([a-zA-Z]\)|y)\s*=\s*/, '');
  clean = normalizeExpression(clean);

  const variable = detectVariable(clean) || 'x';
  const steps: SolutionStep[] = [];
  let stepNum = 1;

  try {
    const nerdamerExpr = (nerdamer as any)(clean);
    const latexExpr = nerdamerExpr.toTeX();
    const resultInt = (nerdamer as any).integrate(clean, variable);
    const finalLatex = resultInt.toTeX();

    // Step 1: Problem setup
    steps.push({
      stepNumber: stepNum++,
      explanation: `Set up the indefinite integral with respect to variable $${variable}$.`,
      math: `\\int \\left( ${latexExpr} \\right) \\, d${variable}`,
      formulaUsed: {
        name: 'Indefinite Integral',
        latex: '\\int f(' + variable + ') \\, d' + variable + ' = F(' + variable + ') + C',
        description: 'Finding the antiderivative function F(x) such that F\'(x) = f(x).',
      },
    });

    // Check if expression is a sum of terms
    const terms = clean.split(/(?=[+-])/).map((t) => t.trim()).filter(Boolean);

    if (terms.length > 1) {
      // Step 2: Sum/Difference Rule
      steps.push({
        stepNumber: stepNum++,
        explanation: 'Apply the Sum & Difference Rule: integrate each term separately.',
        math: `\\int \\left( ${latexExpr} \\right) \\, d${variable} = ` +
          terms.map((t) => {
            const cleanT = t.replace(/^\+/, '').trim();
            const sign = t.startsWith('-') ? '- ' : '+ ';
            return `${sign}\\int ${(nerdamer as any)(cleanT).toTeX()} \\, d${variable}`;
          }).join(' ').replace(/^(\+|-)\s*/, (m) => m.startsWith('-') ? '-' : ''),
        formulaUsed: INT_RULES.sum,
      });

      // Step 3: Integrate each individual term
      for (const t of terms) {
        const cleanT = t.replace(/^[+-]/, '').trim();
        const termNerd = (nerdamer as any)(cleanT);
        const termInt = (nerdamer as any).integrate(cleanT, variable);
        const termLatex = termNerd.toTeX();
        const intLatex = termInt.toTeX();

        let matchedRule = INT_RULES.power;
        let explanation = `Integrate term $${termLatex}$ using the Power Rule for integration.`;

        if (!cleanT.includes(variable)) {
          matchedRule = INT_RULES.constant;
          explanation = `Integrate constant $${termLatex}$ to obtain $${intLatex}$.`;
        } else if (cleanT === `1/${variable}` || cleanT === `${variable}^(-1)`) {
          matchedRule = INT_RULES.oneOverX;
          explanation = `Integrate $\\frac{1}{${variable}}$ using the natural log rule.`;
        } else if (cleanT.includes('sin')) {
          matchedRule = INT_RULES.sin;
          explanation = `Integrate $\\sin(${variable})$ to get $-\\cos(${variable})$.`;
        } else if (cleanT.includes('cos')) {
          matchedRule = INT_RULES.cos;
          explanation = `Integrate $\\cos(${variable})$ to get $\\sin(${variable})$.`;
        } else if (cleanT.includes('exp') || cleanT.includes('e^')) {
          matchedRule = INT_RULES.exp;
          explanation = `Integrate exponential term $${termLatex}$.`;
        }

        steps.push({
          stepNumber: stepNum++,
          explanation,
          math: `\\int ${termLatex} \\, d${variable} = ${intLatex}`,
          formulaUsed: matchedRule,
        });
      }

      // Step 4: Combine all integrated terms and add constant of integration + C
      steps.push({
        stepNumber: stepNum++,
        explanation: 'Combine all term antiderivatives and add the arbitrary constant of integration $C$.',
        math: `\\int \\left( ${latexExpr} \\right) \\, d${variable} = ${finalLatex} + C`,
      });
    } else {
      // Single term integration
      let matchedRule = INT_RULES.power;
      if (clean === `1/${variable}` || clean === `${variable}^(-1)`) matchedRule = INT_RULES.oneOverX;
      else if (clean.includes('sin')) matchedRule = INT_RULES.sin;
      else if (clean.includes('cos')) matchedRule = INT_RULES.cos;
      else if (clean.includes('exp') || clean.includes('e^')) matchedRule = INT_RULES.exp;
      else if (!clean.includes(variable)) matchedRule = INT_RULES.constant;

      steps.push({
        stepNumber: stepNum++,
        explanation: `Apply the ${matchedRule.name} to integrate the function.`,
        math: `\\int ${latexExpr} \\, d${variable} = ${finalLatex} + C`,
        formulaUsed: matchedRule,
      });
    }

    return {
      type: 'integral',
      steps,
      finalAnswer: `F(${variable}) = ${finalLatex} + C`,
      inputInterpretation: `\\text{Indefinite Integral: } \\int \\left( ${latexExpr} \\right) \\, d${variable}`,
    };
  } catch (err: any) {
    return {
      type: 'integral',
      steps: [
        {
          stepNumber: 1,
          explanation: 'Could not compute the integral. Please check expression syntax.',
          math: `\\text{Input: } ${expression}`,
        },
      ],
      finalAnswer: '\\text{Error evaluating integral}',
    };
  }
}
