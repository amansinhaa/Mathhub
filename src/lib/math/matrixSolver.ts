import * as math from 'mathjs';

export type MatrixOperation = 'determinant' | 'inverse' | 'multiply' | 'rref' | 'eigenvalues';

export interface MatrixResult {
  operation: MatrixOperation;
  input: number[][];
  inputB?: number[][];
  result: number[][] | number[] | number | string;
  steps: { explanation: string; math?: string }[];
  error?: string;
}

export function solveMatrix(op: MatrixOperation, matrixA: number[][], matrixB?: number[][]): MatrixResult {
  const steps: { explanation: string; math?: string }[] = [];
  const rows = matrixA.length;
  const cols = matrixA[0]?.length || 0;

  try {
    if (op === 'determinant') {
      if (rows !== cols) throw new Error("Matrix must be square to find determinant.");
      
      let detResult: number;
      if (rows === 2) {
        const [a, b] = matrixA[0];
        const [c, d] = matrixA[1];
        detResult = a * d - b * c;
        steps.push({
          explanation: "For a 2x2 matrix, use the formula ad - bc:",
          math: `(${a} \\times ${d}) - (${b} \\times ${c}) = ${a * d} - ${b * c} = ${detResult}`
        });
      } else if (rows === 3) {
        const [[a, b, c], [d, e, f], [g, h, i]] = matrixA;
        const detA = e * i - f * h;
        const detB = d * i - f * g;
        const detC = d * h - e * g;
        detResult = a * detA - b * detB + c * detC;
        steps.push({
          explanation: "For a 3x3 matrix, use cofactor expansion along the first row:",
          math: `${a}(${e}\\cdot${i} - ${f}\\cdot${h}) - ${b}(${d}\\cdot${i} - ${f}\\cdot${g}) + ${c}(${d}\\cdot${h} - ${e}\\cdot${g})`
        });
        steps.push({
          explanation: "Simplify the 2x2 determinants:",
          math: `${a}(${detA}) - ${b}(${detB}) + ${c}(${detC}) = ${a * detA} - ${b * detB} + ${c * detC} = ${detResult}`
        });
      } else {
        detResult = math.det(matrixA);
        steps.push({ explanation: `Computed determinant using standard matrix decomposition.`, math: `\\det(A) = ${detResult}` });
      }
      return { operation: op, input: matrixA, result: detResult, steps };
      
    } else if (op === 'inverse') {
      if (rows !== cols) throw new Error("Matrix must be square to find inverse.");
      
      let invResult: number[][];
      if (rows === 2) {
        const [a, b] = matrixA[0];
        const [c, d] = matrixA[1];
        const det = a * d - b * c;
        if (det === 0) throw new Error("Determinant is 0, matrix is not invertible.");
        
        invResult = [
          [d / det, -b / det],
          [-c / det, a / det]
        ];
        steps.push({
          explanation: "First, find the determinant ad - bc:",
          math: `\\det = (${a})(${d}) - (${b})(${c}) = ${det}`
        });
        steps.push({
          explanation: "Then, swap the positions of a and d, put negatives in front of b and c, and divide everything by the determinant:",
          math: `\\frac{1}{${det}} \\begin{pmatrix} ${d} & ${-b} \\\\ ${-c} & ${a} \\end{pmatrix}`
        });
      } else {
        const det = math.det(matrixA);
        if (det === 0) throw new Error("Determinant is 0, matrix is not invertible.");
        invResult = math.inv(matrixA) as number[][];
        steps.push({ explanation: "Used standard matrix inversion algorithm.", math: `A^{-1}` });
      }
      return { operation: op, input: matrixA, result: invResult, steps };
      
    } else if (op === 'multiply') {
      if (!matrixB) throw new Error("Multiplication requires a second matrix.");
      const rowsB = matrixB.length;
      const colsB = matrixB[0]?.length || 0;
      if (cols !== rowsB) throw new Error("Number of columns in first matrix must equal number of rows in second matrix.");

      const mulResult = math.multiply(matrixA, matrixB) as number[][];
      if (rows <= 3 && cols <= 3 && colsB <= 3) {
        steps.push({
          explanation: "To multiply matrices, multiply the elements of each row of the first matrix by the elements of each column in the second matrix, then add them up."
        });
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
      } else {
        steps.push({ explanation: "Computed standard matrix multiplication." });
      }
      return { operation: op, input: matrixA, inputB: matrixB, result: mulResult, steps };
      
    } else if (op === 'rref') {
      // Create a copy to manipulate
      let m = matrixA.map(row => [...row]);
      let r = 0;
      let c = 0;
      
      steps.push({ explanation: "Starting Row Reduced Echelon Form (RREF) Gaussian elimination." });
      
      while (r < rows && c < cols) {
        // Find pivot
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
        
        // Swap rows if needed
        if (pivotRow !== r) {
          const temp = m[r];
          m[r] = m[pivotRow];
          m[pivotRow] = temp;
          steps.push({ explanation: `Swapped row ${r + 1} with row ${pivotRow + 1}` });
        }
        
        // Divide by pivot
        const pivot = m[r][c];
        if (pivot !== 1) {
          for (let j = c; j < cols; j++) m[r][j] /= pivot;
          steps.push({ explanation: `Divided row ${r + 1} by ${pivot} to create a leading 1` });
        }
        
        // Eliminate other rows
        for (let i = 0; i < rows; i++) {
          if (i !== r) {
            const factor = m[i][c];
            if (Math.abs(factor) > 1e-10) {
              for (let j = c; j < cols; j++) {
                m[i][j] -= factor * m[r][j];
              }
              steps.push({ explanation: `Subtracted ${factor} * row ${r + 1} from row ${i + 1}` });
            }
          }
        }
        r++;
        c++;
      }
      return { operation: op, input: matrixA, result: m, steps };

    } else if (op === 'eigenvalues') {
      if (rows !== cols) throw new Error("Matrix must be square to find eigenvalues.");
      const eigen = math.eigs(matrixA);
      steps.push({ explanation: "Eigenvalues are found by finding the roots of the characteristic polynomial det(A - λI) = 0." });
      steps.push({ explanation: "Computed using mathjs numeric eigenvalue decomposition." });
      return { operation: op, input: matrixA, result: eigen.values as unknown as number[], steps };
    }
    
    throw new Error("Unsupported operation");
  } catch (err: any) {
    return { operation: op, input: matrixA, inputB: matrixB, result: [], steps, error: err.message || 'An error occurred' };
  }
}
