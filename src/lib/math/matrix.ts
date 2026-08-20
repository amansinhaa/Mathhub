import { matrix, add, multiply, det, inv, transpose, Matrix } from 'mathjs';

export interface MatrixResult<T> {
  result: T;
  latex: string;
}

export function createMatrix(data: number[][]): Matrix {
  return matrix(data);
}

export function matrixToLatex(data: number[][]): string {
  const rows = data.map(row => row.join(' & ')).join(' \\\\ ');
  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}

export function matrixAdd(a: number[][], b: number[][]): MatrixResult<number[][]> {
  try {
    const res = add(a, b) as number[][];
    return {
      result: res,
      latex: matrixToLatex(res)
    };
  } catch (error: any) {
    throw new Error(error.message || 'Matrix addition failed');
  }
}

export function matrixMultiply(a: number[][], b: number[][]): MatrixResult<number[][]> {
  try {
    const res = multiply(a, b) as number[][];
    return {
      result: res,
      latex: matrixToLatex(res)
    };
  } catch (error: any) {
    throw new Error(error.message || 'Matrix multiplication failed');
  }
}

export function matrixDeterminant(a: number[][]): MatrixResult<number> {
  try {
    const res = det(a);
    return {
      result: res,
      latex: res.toString()
    };
  } catch (error: any) {
    throw new Error(error.message || 'Cannot calculate determinant');
  }
}

export function matrixInverse(a: number[][]): MatrixResult<number[][]> {
  try {
    const res = inv(a) as number[][];
    return {
      result: res,
      latex: matrixToLatex(res)
    };
  } catch (error: any) {
    throw new Error(error.message || 'Matrix inversion failed (may be singular)');
  }
}

export function matrixTranspose(a: number[][]): MatrixResult<number[][]> {
  try {
    const res = transpose(a) as number[][];
    return {
      result: res,
      latex: matrixToLatex(res)
    };
  } catch (error: any) {
    throw new Error(error.message || 'Matrix transpose failed');
  }
}
