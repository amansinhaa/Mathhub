import { solveMatrix } from '../../src/lib/math/matrixSolver';
import { solveSystem, solveInequality } from '../../src/lib/math/solver';

describe('Matrix operations', () => {
  it('determinant 2x2', () => {
    const res = solveMatrix('determinant', [[3, 8], [4, 6]]);
    expect(res.result).toBe(-14);
  });
  it('determinant 3x3 singular', () => {
    const res = solveMatrix('determinant', [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    expect(res.result).toBe(0);
  });
  it('determinant 3x3 non-singular', () => {
    const res = solveMatrix('determinant', [[2, 0, 1], [3, 1, 0], [1, 2, 3]]);
    expect(res.result).toBe(11);
  });
  it('determinant 3x3 identity', () => {
    const res = solveMatrix('determinant', [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    expect(res.result).toBe(1);
  });

  it('inverse 2x2', () => {
    const res = solveMatrix('inverse', [[1, 2], [3, 4]]);
    expect(res.result).toEqual([[-2, 1], [1.5, -0.5]]);
  });
  it('inverse 2x2 singular', () => {
    const res = solveMatrix('inverse', [[1, 2], [2, 4]]);
    expect(res.error).toBeDefined(); // should return error
  });

  it('multiply 2x2', () => {
    const res = solveMatrix('multiply', [[1, 2], [3, 4]], [[5, 6], [7, 8]]);
    expect(res.result).toEqual([[19, 22], [43, 50]]);
  });
  it('multiply non-square', () => {
    const res = solveMatrix('multiply', [[1, 2, 3], [4, 5, 6]], [[7], [8], [9]]);
    expect(res.result).toEqual([[50], [122]]);
  });
  it('multiply dimension mismatch', () => {
    const res = solveMatrix('multiply', [[1, 2], [3, 4]], [[1, 2, 3]]);
    expect(res.error).toBeDefined();
  });

  it('rref', () => {
    const res = solveMatrix('rref', [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
    expect(res.result).toEqual([[1, 0, -1], [0, 1, 2], [0, 0, 0]]);
  });
});

describe('System Solver', () => {
  it('solve system 1', () => {
    const res = solveSystem(['2x + y = 5', 'x - y = 1'], ['x', 'y']);
    expect(res.finalAnswer).toBeDefined();
    console.log('system 1 res:', res);
  });
  it('solve system 2', () => {
    const res = solveSystem(['x + y + z = 6', '2x - y + z = 3', 'x + 2y - z = 2'], ['x', 'y', 'z']);
    console.log('system 2 res:', res);
  });
  it('inconsistent system', () => {
    const res = solveSystem(['x + y = 1', 'x + y = 2'], ['x', 'y']);
    console.log('inconsistent res:', res);
  });
  it('dependent system', () => {
    const res = solveSystem(['x + y = 1', '2x + 2y = 2'], ['x', 'y']);
    console.log('dependent res:', res);
  });
});

describe('Inequality Solver', () => {
  it('ineq 1', () => {
    const res = solveInequality('2x - 4 >= 0');
    console.log('ineq 1 res:', res);
  });
  it('ineq 2', () => {
    const res = solveInequality('x^2 - 4 > 0');
    console.log('ineq 2 res:', res);
  });
  it('ineq 3', () => {
    const res = solveInequality('-x^2 + 4 > 0');
    console.log('ineq 3 res:', res);
  });
});
