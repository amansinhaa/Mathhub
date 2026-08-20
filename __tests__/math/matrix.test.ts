import {
  matrixAdd,
  matrixMultiply,
  matrixDeterminant,
  matrixInverse,
  matrixTranspose,
  matrixToLatex,
} from '@/lib/math/matrix';

describe('MathHub Matrix Operations', () => {
  const matA = [
    [1, 2],
    [3, 4],
  ];
  const matB = [
    [5, 6],
    [7, 8],
  ];

  it('adds two matrices correctly', () => {
    const res = matrixAdd(matA, matB);
    expect(res.result).toEqual([
      [6, 8],
      [10, 12],
    ]);
    expect(res.latex).toContain('\\begin{bmatrix}');
  });

  it('multiplies two matrices correctly', () => {
    const res = matrixMultiply(matA, matB);
    // [1*5 + 2*7, 1*6 + 2*8] = [19, 22]
    // [3*5 + 4*7, 3*6 + 4*8] = [43, 50]
    expect(res.result).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  it('computes the determinant of a 2x2 matrix', () => {
    const res = matrixDeterminant(matA);
    // 1*4 - 2*3 = -2
    expect(res.result).toBe(-2);
  });

  it('computes matrix transpose correctly', () => {
    const res = matrixTranspose(matA);
    expect(res.result).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });

  it('computes matrix inverse', () => {
    const res = matrixInverse(matA);
    expect(res.result[0][0]).toBeCloseTo(-2, 5);
    expect(res.result[0][1]).toBeCloseTo(1, 5);
    expect(res.result[1][0]).toBeCloseTo(1.5, 5);
    expect(res.result[1][1]).toBeCloseTo(-0.5, 5);
  });

  it('formats matrices as LaTeX bmatrix', () => {
    const latex = matrixToLatex(matA);
    expect(latex).toBe('\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}');
  });
});
