import { SolutionStep } from '@/types/solver';
import { parse, derivative, simplify } from 'mathjs';

export function differentiate(expr: string, variable: string): { result: string, latex: string, steps: SolutionStep[] } {
  const steps: SolutionStep[] = [];
  let stepCount = 1;

  try {
    const parsedExpr = parse(expr);
    steps.push({
      stepNumber: stepCount++,
      explanation: 'Identify the expression and the variable of differentiation.',
      math: `f(${variable}) = ${parsedExpr.toTex()}`
    });

    const deriv = derivative(parsedExpr, variable);
    
    steps.push({
      stepNumber: stepCount++,
      explanation: 'Apply differentiation rules.',
      math: `f'(${variable}) = \\frac{d}{d${variable}} [${parsedExpr.toTex()}]`
    });

    const result = deriv.toString();
    const latex = deriv.toTex();

    steps.push({
      stepNumber: stepCount++,
      explanation: 'Simplify the derivative.',
      math: `f'(${variable}) = ${latex}`
    });

    return { result, latex, steps };
  } catch (error) {
    return { result: 'Error', latex: '\\text{Error computing derivative}', steps: [] };
  }
}

export function simplifyExpression(expr: string): { result: string, latex: string } {
  try {
    const simplified = simplify(expr);
    return {
      result: simplified.toString(),
      latex: simplified.toTex()
    };
  } catch (error) {
    return { result: 'Error', latex: '\\text{Error simplifying expression}' };
  }
}

export function expressionToLatex(expr: string): string {
  try {
    return parse(expr).toTex();
  } catch (error) {
    return expr;
  }
}
