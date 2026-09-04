'use client';

import React, { useState } from 'react';
import { MatrixOperation, solveMatrix, MatrixResult } from '@/lib/math/matrixSolver';

export default function MatrixSolverWidget() {
  const [size, setSize] = useState<number>(2);
  const [op, setOp] = useState<MatrixOperation>('determinant');
  
  // Matrix states
  const [matrixA, setMatrixA] = useState<string[][]>(Array(2).fill(Array(2).fill('')));
  const [matrixB, setMatrixB] = useState<string[][]>(Array(2).fill(Array(2).fill('')));
  
  const [result, setResult] = useState<MatrixResult | null>(null);

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setSize(newSize);
    setMatrixA(Array(newSize).fill(Array(newSize).fill('')));
    setMatrixB(Array(newSize).fill(Array(newSize).fill('')));
    setResult(null);
  };

  const updateMatrix = (matrix: 'A' | 'B', row: number, col: number, val: string) => {
    if (matrix === 'A') {
      const newM = matrixA.map(r => [...r]);
      newM[row][col] = val;
      setMatrixA(newM);
    } else {
      const newM = matrixB.map(r => [...r]);
      newM[row][col] = val;
      setMatrixB(newM);
    }
  };

  const calculate = () => {
    try {
      const numA = matrixA.map(row => row.map(cell => {
        const val = parseFloat(cell);
        if (isNaN(val)) throw new Error("All fields must contain valid numbers.");
        return val;
      }));
      
      let numB: number[][] | undefined = undefined;
      if (op === 'multiply') {
        numB = matrixB.map(row => row.map(cell => {
          const val = parseFloat(cell);
          if (isNaN(val)) throw new Error("All fields must contain valid numbers.");
          return val;
        }));
      }

      const res = solveMatrix(op, numA, numB);
      setResult(res);
    } catch (e: any) {
      setResult({
        operation: op,
        input: [],
        result: [],
        steps: [],
        error: e.message
      });
    }
  };

  const renderMatrixInput = (matrix: 'A' | 'B', data: string[][]) => (
    <div className="flex flex-col items-center space-y-2">
      <h3 className="font-semibold text-lg">Matrix {matrix}</h3>
      <div 
        className="grid gap-2" 
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {data.map((row, rIdx) => 
          row.map((cell, cIdx) => (
            <input
              key={`${rIdx}-${cIdx}`}
              type="text"
              value={cell}
              onChange={(e) => updateMatrix(matrix, rIdx, cIdx, e.target.value)}
              className="w-16 h-12 text-center border border-[#E0E0E0] dark:border-[#5D4037] rounded bg-white dark:bg-[#131313] text-[#5D4037] dark:text-[#EFEBE9] focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="0"
            />
          ))
        )}
      </div>
    </div>
  );

  const formatResult = (res: any) => {
    if (Array.isArray(res) && Array.isArray(res[0])) {
      return (
        <div className="grid gap-2 mt-4" style={{ gridTemplateColumns: `repeat(${res[0].length}, minmax(0, 1fr))` }}>
          {res.map((row, r) => 
            row.map((val: number, c: number) => (
              <div key={`${r}-${c}`} className="w-16 h-12 flex items-center justify-center border border-[#E0E0E0] dark:border-[#5D4037] rounded bg-[#EFEBE9] dark:bg-[#131313]">
                {Number.isInteger(val) ? val : parseFloat(val.toFixed(4))}
              </div>
            ))
          )}
        </div>
      );
    } else if (Array.isArray(res)) {
      return <div className="mt-4">{res.map((v: any) => typeof v === 'number' ? parseFloat(v.toFixed(4)) : v.toString()).join(', ')}</div>;
    }
    return <div className="mt-4 text-xl font-bold">{typeof res === 'number' ? parseFloat(res.toFixed(4)) : res}</div>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Matrix Size</label>
          <select 
            value={size} 
            onChange={handleSizeChange}
            className="w-full p-2 border border-[#E0E0E0] dark:border-[#5D4037] rounded bg-white dark:bg-[#131313]"
          >
            <option value={2}>2 x 2</option>
            <option value={3}>3 x 3</option>
            <option value={4}>4 x 4</option>
          </select>
        </div>
        
        <div className="space-y-2 flex-grow">
          <label className="block text-sm font-medium">Operation</label>
          <div className="flex flex-wrap gap-2">
            {(['determinant', 'inverse', 'multiply', 'rref', 'eigenvalues'] as MatrixOperation[]).map((oper) => (
              <button
                key={oper}
                onClick={() => setOp(oper)}
                className={`px-3 py-1 rounded text-sm capitalize ${op === oper ? 'bg-[#5D4037] text-white' : 'bg-[#EFEBE9] dark:bg-[#131313] text-[#5D4037] dark:text-[#EFEBE9] border border-[#E0E0E0] dark:border-[#5D4037]'}`}
              >
                {oper}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-8 justify-center items-center">
        {renderMatrixInput('A', matrixA)}
        {op === 'multiply' && renderMatrixInput('B', matrixB)}
      </div>

      <div className="text-center">
        <button 
          onClick={calculate}
          className="px-8 py-3 bg-[#5D4037] text-white rounded-lg hover:bg-opacity-90 transition font-semibold"
        >
          Calculate
        </button>
      </div>

      {result && (
        <div className="mt-8 pt-8 border-t border-[#E0E0E0] dark:border-[#5D4037]">
          {result.error ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">{result.error}</div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Result</h3>
                <div className="flex justify-center">
                  {formatResult(result.result)}
                </div>
              </div>
              
              {result.steps.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-4">Step-by-Step Solution</h3>
                  <div className="space-y-4">
                    {result.steps.map((step, i) => (
                      <div key={i} className="p-4 bg-[#EFEBE9] dark:bg-[#131313] rounded-lg border border-[#E0E0E0] dark:border-[#5D4037]">
                        <p>{step.explanation}</p>
                        {step.math && <p className="mt-2 font-mono text-center overflow-x-auto">{step.math}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
