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
    [1, 2],
    [3, 4],
  ]);
  const [matrixB, setMatrixB] = useState<number[][]>([
    [5, 6],
    [7, 8],
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
    <div className="math-card w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-[var(--card-border)] pb-3">
        <h3 className="text-lg font-semibold">Matrix Operations</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted)]">Size:</span>
          {[2, 3, 4].map((s) => (
            <button
              key={s}
              onClick={() => handleSizeChange(s)}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${
                size === s
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {s}×{s}
            </button>
          ))}
        </div>
      </div>

      {/* Operation tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        {[
          { id: 'add', label: 'A + B' },
          { id: 'multiply', label: 'A × B' },
          { id: 'determinant', label: 'det(A)' },
          { id: 'inverse', label: 'inv(A)' },
          { id: 'transpose', label: 'trans(A)' },
        ].map((op) => (
          <button
            key={op.id}
            onClick={() => setOperation(op.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              operation === op.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Matrices grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
        {/* Matrix A */}
        <div>
          <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Matrix A</div>
          <div
            className="grid gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-[var(--card-border)]"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
          >
            {matrixA.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`a-${r}-${c}`}
                  type="number"
                  value={val}
                  onChange={(e) => updateCell('A', r, c, parseFloat(e.target.value) || 0)}
                  className="math-input text-center font-mono py-2 text-sm"
                />
              ))
            )}
          </div>
        </div>

        {/* Matrix B */}
        {needsMatrixB && (
          <div>
            <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Matrix B</div>
            <div
              className="grid gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-[var(--card-border)]"
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
              {matrixB.map((row, r) =>
                row.map((val, c) => (
                  <input
                    key={`b-${r}-${c}`}
                    type="number"
                    value={val}
                    onChange={(e) => updateCell('B', r, c, parseFloat(e.target.value) || 0)}
                    className="math-input text-center font-mono py-2 text-sm"
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculate}
        className="w-full py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors shadow-sm mb-4"
      >
        Calculate
      </button>

      {/* Results */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
          {errorMessage}
        </div>
      )}

      {resultLatex && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-center overflow-x-auto">
          <div className="text-xs text-[var(--muted)] mb-1">Result</div>
          <MathDisplay math={resultLatex} block />
        </div>
      )}
    </div>
  );
}
