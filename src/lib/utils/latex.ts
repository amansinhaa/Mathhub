import { parse, format } from 'mathjs';

export function expressionToLatex(expr: string): string {
  try {
    return parse(expr).toTex();
  } catch (e) {
    return expr;
  }
}

export function numberToLatex(n: number): string {
  const formatted = format(n, { fraction: 'ratio' });
  if (formatted.includes('/')) {
    const [num, den] = formatted.split('/');
    return `\\frac{${num}}{${den}}`;
  }
  return n.toString();
}

export function formatResult(result: any): { display: string; latex: string } {
  if (result === undefined || result === null) {
    return { display: '', latex: '' };
  }
  
  if (typeof result === 'number') {
    return {
      display: format(result, { precision: 14 }),
      latex: numberToLatex(result)
    };
  }
  
  if (result.isComplex) {
    const display = `${format(result.re, { precision: 14 })} ${result.im >= 0 ? '+' : '-'} ${format(Math.abs(result.im), { precision: 14 })}i`;
    return {
      display,
      latex: display
    };
  }
  
  if (Array.isArray(result) || result.isMatrix) {
    const arr = result.isMatrix ? result.toArray() : result;
    const is2D = Array.isArray(arr[0]);
    if (is2D) {
      const rows = arr.map((row: any[]) => row.join(' & ')).join(' \\\\ ');
      const latex = `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
      return {
        display: `Matrix [${arr.length}x${arr[0].length}]`,
        latex
      };
    } else {
      const latex = `\\begin{bmatrix} ${arr.join(' & ')} \\end{bmatrix}`;
      return {
        display: `Vector [${arr.length}]`,
        latex
      };
    }
  }
  
  const str = result.toString();
  return {
    display: str,
    latex: str
  };
}
