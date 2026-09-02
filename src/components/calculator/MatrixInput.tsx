'use client';

import React, { useState } from 'react';
import {
  matrixAdd,
  matrixMultiply,
  matrixDeterminant,
  matrixInverse,
  matrixTranspose,
} from '@/lib/math/matrix';
import { MathDisplay } from '@/components/shared/MathDisplay';

export default function MatrixInput() {
  const [size, setSize] = useState<number>(2);
  const [operation, setOperation] = useState<'add' | 'multiply' | 'determinant' | 'inverse' | 'transpose'>('add');

  const [matrixA, setMatrixA] = useState<number[][]>([
    [0, 0],
    [0, 0],
  ]);
  const [matrixB, setMatrixB] = useState<number[][]>([
    [0, 0],
    [0, 0],
  ]);

  const [resultLatex, setResultLatex] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    const newA = Array(newSize)
      .fill(0)
      .map((_, i) =>
        Array(newSize)
          .fill(0)
          .map((_, j) => (matrixA[i]?.[j] !== undefined ? matrixA[i][j] : i === j ? 1 : 0))
      );
    const newB = Array(newSize)
      .fill(0)
      .map((_, i) =>
        Array(newSize)
          .fill(0)
          .map((_, j) => (matrixB[i]?.[j] !== undefined ? matrixB[i][j] : i === j ? 1 : 0))
      );
    setMatrixA(newA);
    setMatrixB(newB);
  };

  const updateCell = (matrixName: 'A' | 'B', r: number, c: number, val: number) => {
    if (matrixName === 'A') {
      const copy = matrixA.map((row) => [...row]);
      copy[r][c] = val;
      setMatrixA(copy);
    } else {
      const copy = matrixB.map((row) => [...row]);
      copy[r][c] = val;
      setMatrixB(copy);
    }
  };

  const calculate = () => {
    setErrorMessage('');
    try {
      if (operation === 'add') {
        const res = matrixAdd(matrixA, matrixB);
        setResultLatex(`A + B = ${res.latex}`);
      } else if (operation === 'multiply') {
        const res = matrixMultiply(matrixA, matrixB);
        setResultLatex(`A \\times B = ${res.latex}`);
      } else if (operation === 'determinant') {
        const res = matrixDeterminant(matrixA);
        setResultLatex(`\\det(A) = ${res.latex}`);
      } else if (operation === 'inverse') {
        const res = matrixInverse(matrixA);
        setResultLatex(`A^{-1} = ${res.latex}`);
      } else if (operation === 'transpose') {
        const res = matrixTranspose(matrixA);
        setResultLatex(`A^T = ${res.latex}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Matrix calculation failed');
      setResultLatex('');
    }
  };

  const needsMatrixB = operation === 'add' || operation === 'multiply';

  return (
    <div className="math-card w-full bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] p-4 sm:p-6 rounded-2xl transition-colors shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-[#E0E0E0] dark:border-[#2E2825] pb-3">
        <h3 className="text-base sm:text-lg font-bold text-[#131313] dark:text-white">Matrix Operations</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#616161] dark:text-[#A19891]">Dimension:</span>
          {[2, 3, 4].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSizeChange(s)}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
                size === s
                  ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs'
                  : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white'
              }`}
            >
              {s}×{s}
            </button>
          ))}
        </div>
      </div>

      {/* Operation tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {[
          { id: 'add', label: 'A + B' },
          { id: 'multiply', label: 'A × B' },
          { id: 'determinant', label: 'det(A)' },
          { id: 'inverse', label: 'inv(A)' },
          { id: 'transpose', label: 'trans(A)' },
        ].map((op) => (
          <button
            key={op.id}
            type="button"
            onClick={() => setOperation(op.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
              operation === op.id
                ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs'
                : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] hover:bg-[#EFEBE9] dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white dark:hover:bg-[#262220]'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Matrices grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-4">
        {/* Matrix A */}
        <div>
          <div className="text-xs font-mono font-bold mb-2 text-[#5D4037] dark:text-[#D7CCC8]">Matrix A</div>
          <div
            className="grid gap-2 p-3.5 bg-[#F5F5F5] dark:bg-[#131313] rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825]"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {matrixA.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`a-${r}-${c}`}
                  type="number"
                  value={val}
                  onChange={(e) => updateCell('A', r, c, parseFloat(e.target.value) || 0)}
                  className="math-input text-center font-mono py-2 text-sm bg-white dark:bg-[#1B1B1B] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
                />
              ))
            )}
          </div>
        </div>

        {/* Matrix B */}
        {needsMatrixB && (
          <div>
            <div className="text-xs font-mono font-bold mb-2 text-[#5D4037] dark:text-[#D7CCC8]">Matrix B</div>
            <div
              className="grid gap-2 p-3.5 bg-[#F5F5F5] dark:bg-[#131313] rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825]"
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
              {matrixB.map((row, r) =>
                row.map((val, c) => (
                  <input
                    key={`b-${r}-${c}`}
                    type="number"
                    value={val}
                    onChange={(e) => updateCell('B', r, c, parseFloat(e.target.value) || 0)}
                    className="math-input text-center font-mono py-2 text-sm bg-white dark:bg-[#1B1B1B] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Calculate Button */}
      <button
        type="button"
        onClick={calculate}
        className="w-full py-3 px-4 rounded-xl bg-[#5D4037] hover:bg-[#6D4C41] active:bg-[#4E342E] text-white font-bold text-sm transition-all shadow-md mb-4 border border-[#795548]/50"
      >
        Compute Matrix Result
      </button>

      {/* Results */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-[#3E2723]/60 border border-red-200 dark:border-[#5D4037]/60 text-red-600 dark:text-[#FFAB91] text-xs font-mono">
          {errorMessage}
        </div>
      )}

      {resultLatex && (
        <div className="p-4 rounded-2xl bg-[#F5F5F5] dark:bg-[#131313] border border-[#D7CCC8] dark:border-[#5D4037]/50 text-center overflow-x-auto shadow-xs">
          <div className="text-xs font-mono text-[#5D4037] dark:text-[#A1887F] mb-1.5 font-bold">Result Matrix</div>
          <MathDisplay math={resultLatex} block />
        </div>
      )}
    </div>
  );
}
