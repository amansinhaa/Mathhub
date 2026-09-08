import { solveMatrix } from '@/lib/math/matrixSolver';
import { convertUnit, convertCurrency } from '@/lib/math/units';
import * as math from 'mathjs';

describe('Matrix Solver Audit', () => {
  describe('1. Matrix determinant accuracy', () => {
    it('2x2 determinant', () => {
      const result = solveMatrix('determinant', [[3, 8], [4, 6]]);
      expect(result.result).toBe(-14);
    });
    it('3x3 singular determinant', () => {
      const result = solveMatrix('determinant', [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      expect(result.result).toBe(0);
    });
    it('3x3 determinant', () => {
      const result = solveMatrix('determinant', [[2, 0, 1], [3, 1, 0], [1, 2, 3]]);
      expect(result.result).toBe(11);
    });
    it('Identity matrix 3x3 determinant', () => {
      const result = solveMatrix('determinant', [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      expect(result.result).toBe(1);
    });
  });

  describe('2. Matrix inverse accuracy', () => {
    it('2x2 inverse', () => {
      const result = solveMatrix('inverse', [[1, 2], [3, 4]]);
      expect(result.result).toEqual([[-2, 1], [1.5, -0.5]]);
    });
    it('Verify A * A^(-1) = I', () => {
      const A = [[1, 2], [3, 4]];
      const invA = solveMatrix('inverse', A).result as number[][];
      const I = solveMatrix('multiply', A, invA).result as number[][];
      expect(I[0][0]).toBeCloseTo(1);
      expect(I[0][1]).toBeCloseTo(0);
      expect(I[1][0]).toBeCloseTo(0);
      expect(I[1][1]).toBeCloseTo(1);
    });
    it('Singular matrix throws error', () => {
      const result = solveMatrix('inverse', [[1, 2], [2, 4]]);
      expect(result.error).toMatch(/Determinant is 0/);
    });
  });

  describe('3. Matrix multiplication accuracy', () => {
    it('2x2 * 2x2', () => {
      const result = solveMatrix('multiply', [[1, 2], [3, 4]], [[5, 6], [7, 8]]);
      expect(result.result).toEqual([[19, 22], [43, 50]]);
    });
    it('Matrix * Identity', () => {
      const A = [[1, 2], [3, 4]];
      const I = [[1, 0], [0, 1]];
      const result = solveMatrix('multiply', A, I);
      expect(result.result).toEqual(A);
    });
    it('Non-square multiply', () => {
      const result = solveMatrix('multiply', [[1, 2, 3], [4, 5, 6]], [[7], [8], [9]]);
      expect(result.result).toEqual([[50], [122]]);
    });
    it('Dimension mismatch throws error', () => {
      const result = solveMatrix('multiply', [[1, 2]], [[1, 2]]);
      expect(result.error).toBeDefined();
    });
  });

  describe('4. RREF accuracy', () => {
    it('Reduces dependent system', () => {
      const result = solveMatrix('rref', [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      const rref = result.result as number[][];
      expect(rref[0][0]).toBeCloseTo(1);
      expect(rref[0][1]).toBeCloseTo(0);
      expect(rref[0][2]).toBeCloseTo(-1);
      expect(rref[1][0]).toBeCloseTo(0);
      expect(rref[1][1]).toBeCloseTo(1);
      expect(rref[1][2]).toBeCloseTo(2);
      expect(rref[2][0]).toBeCloseTo(0);
      expect(rref[2][1]).toBeCloseTo(0);
      expect(rref[2][2]).toBeCloseTo(0);
    });
    it('Already RREF', () => {
      const result = solveMatrix('rref', [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      expect(result.result).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    });
    it('2x3 dependent', () => {
      const result = solveMatrix('rref', [[2, 4, 6], [1, 2, 3]]);
      const rref = result.result as number[][];
      expect(rref[0][0]).toBeCloseTo(1);
      expect(rref[0][1]).toBeCloseTo(2);
      expect(rref[0][2]).toBeCloseTo(3);
      expect(rref[1][0]).toBeCloseTo(0);
      expect(rref[1][1]).toBeCloseTo(0);
      expect(rref[1][2]).toBeCloseTo(0);
    });
  });

  describe('5. Rank accuracy', () => {
    it('Rank 2', () => {
      const result = solveMatrix('rank', [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      expect(result.result).toBe(2);
    });
    it('Identity rank', () => {
      const result = solveMatrix('rank', [[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      expect(result.result).toBe(3);
    });
    it('Zero matrix rank', () => {
      const result = solveMatrix('rank', [[0, 0], [0, 0]]);
      expect(result.result).toBe(0);
    });
  });

  describe('6. Trace accuracy', () => {
    it('2x2 trace', () => {
      const result = solveMatrix('trace', [[1, 2], [3, 4]]);
      expect(result.result).toBe(5);
    });
    it('3x3 trace', () => {
      const result = solveMatrix('trace', [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
      expect(result.result).toBe(15);
    });
  });

  describe('7. Transpose accuracy', () => {
    it('2x3 to 3x2', () => {
      const result = solveMatrix('transpose', [[1, 2, 3], [4, 5, 6]]);
      expect(result.result).toEqual([[1, 4], [2, 5], [3, 6]]);
    });
  });

  describe('8. Matrix add/subtract accuracy', () => {
    it('Addition', () => {
      const result = solveMatrix('add', [[1, 2], [3, 4]], [[5, 6], [7, 8]]);
      expect(result.result).toEqual([[6, 8], [10, 12]]);
    });
    it('Dimension mismatch add', () => {
      const result = solveMatrix('add', [[1, 2]], [[1, 2], [3, 4]]);
      expect(result.error).toBeDefined();
    });
  });

  describe('9. Scalar multiplication', () => {
    it('Scalar * matrix', () => {
      const result = solveMatrix('scalar', [[1, 2], [3, 4]], undefined, 3);
      expect(result.result).toEqual([[3, 6], [9, 12]]);
    });
  });

  describe('10. Matrix power', () => {
    it('Matrix cubed', () => {
      const result = solveMatrix('power', [[1, 1], [0, 1]], undefined, 3);
      expect(result.result).toEqual([[1, 3], [0, 1]]);
    });
  });

  describe('11. Eigenvalues', () => {
    it('Real eigenvalues', () => {
      const result = solveMatrix('eigenvalues', [[2, 0], [0, 3]]);
      const vals = result.result as any;
      expect(vals).toContain(2);
      expect(vals).toContain(3);
    });
    it('Complex eigenvalues', () => {
      const result = solveMatrix('eigenvalues', [[0, -1], [1, 0]]);
      const vals = result.result as any;
      expect(vals[0].im).toBe(1);
      expect(vals[1].im).toBe(-1);
    });
  });
});

describe('Units Audit', () => {
  describe('12. Unit conversion accuracy', () => {
    it('1 km = 1000 m', () => {
      expect(convertUnit(1, 'km', 'm')).toBeCloseTo(1000);
    });
    it('1 mile ≈ 1.60934 km', () => {
      expect(convertUnit(1, 'mi', 'km')).toBeCloseTo(1.60934, 4);
    });
    it('100°C = 212°F', () => {
      expect(convertUnit(100, 'degC', 'degF')).toBeCloseTo(212);
    });
    it('0 K = -273.15°C', () => {
      expect(convertUnit(0, 'K', 'degC')).toBeCloseTo(-273.15);
    });
    it('1 atm ≈ 101325 Pa', () => {
      expect(convertUnit(1, 'atm', 'Pa')).toBeCloseTo(101325, 0);
    });
    it('1 gallon ≈ 3.78541 liters', () => {
      expect(convertUnit(1, 'gal', 'l')).toBeCloseTo(3.78541, 4);
    });
    it('1 kWh = 3600000 J', () => {
      expect(convertUnit(1, 'kWh', 'J')).toBeCloseTo(3600000);
    });
  });

  describe('13. Currency conversion', () => {
    const rates = { USD: 1.0, EUR: 0.92, GBP: 0.79 };
    it('Same currency', () => {
      expect(convertCurrency(100, 'USD', 'USD', rates)).toBe(100);
    });
    it('Round trip USD -> EUR -> USD', () => {
      const euros = convertCurrency(100, 'USD', 'EUR', rates);
      const dollars = convertCurrency(euros, 'EUR', 'USD', rates);
      expect(dollars).toBeCloseTo(100);
    });
    it('Missing rate handling', () => {
      expect(convertCurrency(100, 'USD', 'XYZ', rates)).toBe(100);
    });
  });
});
