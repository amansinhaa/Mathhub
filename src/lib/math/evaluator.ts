import { evaluate, parse, format } from 'mathjs';
import * as math from 'mathjs';
import { normalizeExpression, autoBalanceParens } from './normalizer';

export interface EvalResult {
  result: string;
  latex: string;
  error?: string;
}

export function evaluateExpression(
  expr: string,
  angleMode: 'DEG' | 'RAD' | 'GRAD' = 'RAD',
  scope: Record<string, any> = {}
): EvalResult {
  try {
    const customScope = { ...scope };
    const normalizedExpr = autoBalanceParens(normalizeExpression(expr));

    const toRad = (val: any) => {
      if (typeof val === 'number') {
        if (angleMode === 'DEG') return val * (Math.PI / 180);
        if (angleMode === 'GRAD') return val * (Math.PI / 200);
      }
      return val;
    };

    const fromRad = (val: any) => {
      if (typeof val === 'number') {
        if (angleMode === 'DEG') return val * (180 / Math.PI);
        if (angleMode === 'GRAD') return val * (200 / Math.PI);
      }
      return val;
    };

    if (angleMode !== 'RAD') {
      const trigFuncs = ['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'sinh', 'cosh', 'tanh'];
      const invTrigFuncs = ['asin', 'acos', 'atan', 'asec', 'acsc', 'acot'];

      trigFuncs.forEach((fn) => {
        customScope[fn] = (x: any) => {
          const m = math as any;
          return m[fn](typeof x === 'number' ? toRad(x) : x);
        };
      });

      invTrigFuncs.forEach((fn) => {
        customScope[fn] = (x: any) => {
          const m = math as any;
          const res = m[fn](x);
          return typeof res === 'number' ? fromRad(res) : res;
        };
      });
    }

    const result = evaluate(normalizedExpr, customScope);
    
    let resultStr = '';
    if (result === undefined || result === null) {
      resultStr = '';
    } else if (result.isComplex) {
      resultStr = `${format(result.re, { precision: 14 })} ${result.im >= 0 ? '+' : '-'} ${format(Math.abs(result.im), { precision: 14 })}i`;
    } else if (typeof result === 'number') {
      if (Number.isInteger(result) && Math.abs(result) < 1e16) {
        resultStr = result.toString();
      } else {
        resultStr = format(result, { precision: 14 });
      }
    } else {
      resultStr = result.toString();
    }

    return {
      result: resultStr,
      latex: toLatex(normalizedExpr)
    };
  } catch (error: any) {
    return {
      result: '',
      latex: '',
      error: error.message || 'Invalid expression'
    };
  }
}

export function toLatex(expr: string): string {
  try {
    const normalized = autoBalanceParens(normalizeExpression(expr));
    const node = parse(normalized);
    return node.toTex();
  } catch (e) {
    return expr;
  }
}
