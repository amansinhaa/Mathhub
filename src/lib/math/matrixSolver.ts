import * as math from 'mathjs';

export type MatrixOperation =
  | 'determinant'
  | 'inverse'
  | 'multiply'
  | 'add'
  | 'subtract'
  | 'transpose'
  | 'rref'
  | 'rank'
  | 'trace'
  | 'power'
  | 'scalar'
  | 'eigenvalues';

export interface MatrixResult {
  operation: MatrixOperation;
  input: number[][];
  inputB?: number[][];
  scalar?: number;
  result: number[][] | number[] | number | string;
  steps: { explanation: string; math?: string }[];
  error?: string;
}

export function solveMatrix(
  op: MatrixOperation,
  matrixA: number[][],
  matrixB?: number[][],
  scalar: number = 2
): MatrixResult {
  const steps: { explanation: string; math?: string }[] = [];
  const rows = matrixA.length;
  const cols = matrixA[0]?.length || 0;

  try {
    if (op === 'determinant') {
      if (rows !== cols) throw new Error("Matrix must be square (same number of rows and columns) to compute determinant.");
      
      let detResult: number;
      if (rows === 2) {
        const [a, b] = matrixA[0];
        const [c, d] = matrixA[1];
        detResult = a * d - b * c;
        steps.push({
          explanation: "For a 2×2 matrix, calculate ad - bc:",
          math: `(${a} \\times ${d}) - (${b} \\times ${c}) = ${a * d} - ${b * c} = ${detResult}`
        });
      } else if (rows === 3) {
        const [[a, b, c], [d, e, f], [g, h, i]] = matrixA;
        const detA = e * i - f * h;
        const detB = d * i - f * g;
        const detC = d * h - e * g;
        detResult = a * detA - b * detB + c * detC;
        steps.push({
          explanation: "For a 3×3 matrix, expand by minors along row 1:",
          math: `${a}(${e}\\cdot${i} - ${f}\\cdot${h}) - ${b}(${d}\\cdot${i} - ${f}\\cdot${g}) + ${c}(${d}\\cdot${h} - ${e}\\cdot${g})`
        });
        steps.push({
          explanation: "Evaluate the 2×2 cofactors:",
          math: `${a}(${detA}) - ${b}(${detB}) + ${c}(${detC}) = ${a * detA} - ${b * detB} + ${c * detC} = ${detResult}`
        });
      } else {
        detResult = Number(math.det(matrixA));
        steps.push({
          explanation: `Computed determinant using LU decomposition for a ${rows}×${cols} matrix:`,
          math: `\\det(A) = ${Number.isInteger(detResult) ? detResult : detResult.toFixed(4)}`
        });
      }
      return { operation: op, input: matrixA, result: detResult, steps };
      
    } else if (op === 'inverse') {
      if (rows !== cols) throw new Error("Matrix must be square to have an inverse.");
      
      const detVal = Number(math.det(matrixA));
      if (Math.abs(detVal) < 1e-12) {
        throw new Error("Determinant is 0 (det = 0). The matrix is singular and does not have an inverse.");
      }

      let invResult: number[][];
      if (rows === 2) {
        const [a, b] = matrixA[0];
        const [c, d] = matrixA[1];
        invResult = [
          [d / detVal, -b / detVal],
          [-c / detVal, a / detVal]
        ];
        steps.push({
          explanation: "Step 1: Compute determinant det(A) = ad - bc:",
          math: `\\det(A) = (${a})(${d}) - (${b})(${c}) = ${detVal}`
        });
        steps.push({
          explanation: "Step 2: Form the adjugate matrix (swap a and d, negate b and c), and divide by det(A):",
          math: `A^{-1} = \\frac{1}{${detVal}} \\begin{pmatrix} ${d} & ${-b} \\\\ ${-c} & ${a} \\end{pmatrix}`
        });
      } else {
        invResult = math.inv(matrixA) as number[][];
        steps.push({
          explanation: "Step 1: Verify non-zero determinant:",
          math: `\\det(A) = ${Number.isInteger(detVal) ? detVal : detVal.toFixed(4)} \\neq 0`
        });
        steps.push({
          explanation: "Step 2: Compute inverse via Gaussian elimination and cofactor transposition [A | I] → [I | A⁻¹].",
        });
      }
      return { operation: op, input: matrixA, result: invResult, steps };

    } else if (op === 'transpose') {
      const transResult: number[][] = Array.from({ length: cols }, (_, c) =>
        Array.from({ length: rows }, (_, r) => matrixA[r][c])
      );
      steps.push({
        explanation: `Transpose interchanges rows and columns: original (${rows}×${cols}) becomes (${cols}×${rows}).`,
      });
      steps.push({
        explanation: "Element mapping: (Aᵀ)ᵢⱼ = Aⱼᵢ",
      });
      return { operation: op, input: matrixA, result: transResult, steps };

    } else if (op === 'trace') {
      if (rows !== cols) throw new Error("Matrix must be square to compute trace.");
      let tr = 0;
      const terms: string[] = [];
      for (let i = 0; i < rows; i++) {
        tr += matrixA[i][i];
        terms.push(matrixA[i][i].toString());
      }
      steps.push({
        explanation: "The trace tr(A) is the sum of elements along the main diagonal:",
        math: `\\text{tr}(A) = ${terms.join(' + ')} = ${tr}`
      });
      return { operation: op, input: matrixA, result: tr, steps };

    } else if (op === 'rank') {
      let m = matrixA.map(row => [...row]);
      let r = 0;
      let c = 0;
      while (r < rows && c < cols) {
        let pivotRow = r;
        for (let i = r + 1; i < rows; i++) {
          if (Math.abs(m[i][c]) > Math.abs(m[pivotRow][c])) {
            pivotRow = i;
          }
        }
        if (Math.abs(m[pivotRow][c]) < 1e-10) {
          c++;
          continue;
        }
        if (pivotRow !== r) {
          const temp = m[r];
          m[r] = m[pivotRow];
          m[pivotRow] = temp;
        }
        const pivot = m[r][c];
        for (let j = c; j < cols; j++) m[r][j] /= pivot;
        for (let i = 0; i < rows; i++) {
          if (i !== r) {
            const factor = m[i][c];
            if (Math.abs(factor) > 1e-10) {
              for (let j = c; j < cols; j++) {
                m[i][j] -= factor * m[r][j];
              }
            }
          }
        }
        r++;
        c++;
      }
      let nonZeroRows = 0;
      for (let i = 0; i < rows; i++) {
        const isNonZero = m[i].some(v => Math.abs(v) > 1e-8);
        if (isNonZero) nonZeroRows++;
      }
      steps.push({
        explanation: "Rank is the maximum number of linearly independent row vectors (the number of non-zero rows in row echelon form).",
      });
      steps.push({
        explanation: `After Gaussian reduction, there are ${nonZeroRows} non-zero pivot rows:`,
        math: `\\text{rank}(A) = ${nonZeroRows}`
      });
      return { operation: op, input: matrixA, result: nonZeroRows, steps };

    } else if (op === 'scalar') {
      const k = scalar;
      const res: number[][] = matrixA.map(row => row.map(v => v * k));
      steps.push({
        explanation: `Multiply each individual entry of matrix A by scalar k = ${k}:`,
        math: `(${k}) \\cdot A_{ij}`
      });
      return { operation: op, input: matrixA, scalar: k, result: res, steps };

    } else if (op === 'power') {
      if (rows !== cols) throw new Error("Matrix must be square to raise to a power.");
      const p = Math.max(1, Math.min(6, Math.floor(scalar || 2)));
      let current = matrixA;
      for (let powerStep = 2; powerStep <= p; powerStep++) {
        current = math.multiply(current, matrixA) as number[][];
      }
      steps.push({
        explanation: `Repeated matrix multiplication for power A^${p}:`,
        math: `A^{${p}} = ${Array(p).fill('A').join(' \\times ')}`
      });
      return { operation: op, input: matrixA, scalar: p, result: current, steps };

    } else if (op === 'add' || op === 'subtract') {
      if (!matrixB) throw new Error(`${op === 'add' ? 'Addition' : 'Subtraction'} requires a second matrix B.`);
      const rowsB = matrixB.length;
      const colsB = matrixB[0]?.length || 0;
      if (rows !== rowsB || cols !== colsB) {
        throw new Error(`Matrices must have identical dimensions for ${op}. Matrix A is ${rows}×${cols}, but Matrix B is ${rowsB}×${colsB}.`);
      }

      const res: number[][] = Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) =>
          op === 'add' ? matrixA[r][c] + matrixB[r][c] : matrixA[r][c] - matrixB[r][c]
        )
      );

      steps.push({
        explanation: `${op === 'add' ? 'Add' : 'Subtract'} corresponding elements entry-by-entry: Cᵢⱼ = Aᵢⱼ ${op === 'add' ? '+' : '−'} Bᵢⱼ`,
      });
      if (rows <= 3 && cols <= 3) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            steps.push({
              explanation: `Position (${r + 1}, ${c + 1}):`,
              math: `${matrixA[r][c]} ${op === 'add' ? '+' : '-'} ${matrixB[r][c]} = ${res[r][c]}`
            });
          }
        }
      }
      return { operation: op, input: matrixA, inputB: matrixB, result: res, steps };

    } else if (op === 'multiply') {
      if (!matrixB) throw new Error("Multiplication requires a second matrix B.");
      const rowsB = matrixB.length;
      const colsB = matrixB[0]?.length || 0;
      if (cols !== rowsB) {
        throw new Error(`Inner matrix dimensions must agree: Columns in A (${cols}) must equal Rows in B (${rowsB}).`);
      }

      const mulResult = math.multiply(matrixA, matrixB) as number[][];
      steps.push({
        explanation: `Multiplying matrix A (${rows}×${cols}) by matrix B (${rowsB}×${colsB}) produces a (${rows}×${colsB}) matrix:`,
        math: `C_{ij} = \\sum_{k=1}^{${cols}} A_{ik} B_{kj}`
      });

      if (rows <= 3 && cols <= 3 && colsB <= 3) {
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < colsB; j++) {
            const terms = [];
            for (let k = 0; k < cols; k++) {
              terms.push(`(${matrixA[i][k]} \\times ${matrixB[k][j]})`);
            }
            steps.push({
              explanation: `Row ${i + 1}, Column ${j + 1}:`,
              math: `${terms.join(' + ')} = ${mulResult[i][j]}`
            });
          }
        }
      }
      return { operation: op, input: matrixA, inputB: matrixB, result: mulResult, steps };
      
    } else if (op === 'rref') {
      let m = matrixA.map(row => [...row]);
      let r = 0;
      let c = 0;
      steps.push({ explanation: "Starting Reduced Row Echelon Form (RREF) Gaussian-Jordan elimination:" });
      
      while (r < rows && c < cols) {
        let pivotRow = r;
        for (let i = r + 1; i < rows; i++) {
          if (Math.abs(m[i][c]) > Math.abs(m[pivotRow][c])) {
            pivotRow = i;
          }
        }
        
        if (Math.abs(m[pivotRow][c]) < 1e-10) {
          c++;
          continue;
        }
        
        if (pivotRow !== r) {
          const temp = m[r];
          m[r] = m[pivotRow];
          m[pivotRow] = temp;
          steps.push({ explanation: `Swap Row ${r + 1} with Row ${pivotRow + 1}` });
        }
        
        const pivot = m[r][c];
        if (Math.abs(pivot - 1) > 1e-10) {
          for (let j = c; j < cols; j++) m[r][j] /= pivot;
          steps.push({ explanation: `Scale Row ${r + 1} by 1/${Number.isInteger(pivot) ? pivot : pivot.toFixed(3)} to create leading 1` });
        }
        
        for (let i = 0; i < rows; i++) {
          if (i !== r) {
            const factor = m[i][c];
            if (Math.abs(factor) > 1e-10) {
              for (let j = c; j < cols; j++) {
                m[i][j] -= factor * m[r][j];
              }
              steps.push({ explanation: `Eliminate column ${c + 1} entry in Row ${i + 1}: R${i + 1} ← R${i + 1} - (${Number.isInteger(factor) ? factor : factor.toFixed(2)}) × R${r + 1}` });
            }
          }
        }
        r++;
        c++;
      }
      return { operation: op, input: matrixA, result: m, steps };

    } else if (op === 'eigenvalues') {
      if (rows !== cols) throw new Error("Matrix must be square to compute eigenvalues.");
      const eigen = math.eigs(matrixA);
      steps.push({ explanation: "Eigenvalues are roots of the characteristic polynomial: det(A - λI) = 0." });
      steps.push({ explanation: "Characteristic decomposition results:" });
      return { operation: op, input: matrixA, result: eigen.values as unknown as number[], steps };
    }
    
    throw new Error("Unsupported matrix operation");
  } catch (err: any) {
    return {
      operation: op,
      input: matrixA,
      inputB: matrixB,
      scalar,
      result: [],
      steps,
      error: err.message || 'An error occurred'
    };
  }
}
