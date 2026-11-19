'use client';

import React, { useState } from 'react';
import { MatrixOperation, solveMatrix, MatrixResult } from '@/lib/math/matrixSolver';
import { Plus, Minus, ArrowRightLeft, Sparkles, Hash } from 'lucide-react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const OPERATIONS: { value: MatrixOperation; label: string; desc: string; requiresB?: boolean; requiresSquare?: boolean; requiresScalar?: boolean }[] = [
  { value: 'determinant', label: 'det(A)', desc: 'Determinant', requiresSquare: true },
  { value: 'inverse', label: 'A⁻¹', desc: 'Matrix Inverse', requiresSquare: true },
  { value: 'transpose', label: 'Aᵀ', desc: 'Transpose (swap rows & cols)' },
  { value: 'rref', label: 'RREF', desc: 'Row Reduced Echelon Form' },
  { value: 'rank', label: 'rank(A)', desc: 'Matrix Rank' },
  { value: 'trace', label: 'tr(A)', desc: 'Trace (sum of diagonal)', requiresSquare: true },
  { value: 'power', label: 'Aⁿ', desc: 'Matrix Power', requiresSquare: true, requiresScalar: true },
  { value: 'scalar', label: 'k · A', desc: 'Scalar Multiplication', requiresScalar: true },
  { value: 'eigenvalues', label: 'Eigen (λ)', desc: 'Eigenvalues', requiresSquare: true },
  { value: 'add', label: 'A + B', desc: 'Matrix Addition', requiresB: true },
  { value: 'subtract', label: 'A − B', desc: 'Matrix Subtraction', requiresB: true },
  { value: 'multiply', label: 'A × B', desc: 'Matrix Multiplication', requiresB: true },
];

function MatrixSolverWidgetInner() {
  // Custom dimensions for Matrix A
  const [rowsA, setRowsA] = useState<number>(3);
  const [colsA, setColsA] = useState<number>(3);

  // Custom dimensions for Matrix B
  const [rowsB, setRowsB] = useState<number>(3);
  const [colsB, setColsB] = useState<number>(3);

  // Operation
  const [op, setOp] = useState<MatrixOperation>('determinant');
  const [scalar, setScalar] = useState<number>(2);

  // Matrix states (empty default inputs)
  const [matrixA, setMatrixA] = useState<string[][]>([
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]);
  const [matrixB, setMatrixB] = useState<string[][]>([
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]);

  const [result, setResult] = useState<MatrixResult | null>(null);

  const selectedOpConfig = OPERATIONS.find((o) => o.value === op) || OPERATIONS[0];
  const requiresB = Boolean(selectedOpConfig.requiresB);
  const requiresScalar = Boolean(selectedOpConfig.requiresScalar);

  // Helpers to resize matrix retaining existing cell values
  const resizeMatrix = (
    current: string[][],
    newRows: number,
    newCols: number,
    defaultFill = '0'
  ): string[][] => {
    return Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) => {
        if (current[r]?.[c] !== undefined && current[r][c] !== '') {
          return current[r][c];
        }
        return r === c ? '1' : defaultFill;
      })
    );
  };

  const handleRowsAChange = (newR: number) => {
    const clamped = Math.max(1, Math.min(6, newR));
    setRowsA(clamped);
    setMatrixA((prev) => resizeMatrix(prev, clamped, colsA));
    setResult(null);
  };

  const handleColsAChange = (newC: number) => {
    const clamped = Math.max(1, Math.min(6, newC));
    setColsA(clamped);
    setMatrixA((prev) => resizeMatrix(prev, rowsA, clamped));
    setResult(null);
  };

  const handleRowsBChange = (newR: number) => {
    const clamped = Math.max(1, Math.min(6, newR));
    setRowsB(clamped);
    setMatrixB((prev) => resizeMatrix(prev, clamped, colsB));
    setResult(null);
  };

  const handleColsBChange = (newC: number) => {
    const clamped = Math.max(1, Math.min(6, newC));
    setColsB(clamped);
    setMatrixB((prev) => resizeMatrix(prev, rowsB, clamped));
    setResult(null);
  };

  const setSquarePreset = (n: number) => {
    setRowsA(n);
    setColsA(n);
    setRowsB(n);
    setColsB(n);
    setMatrixA((prev) => resizeMatrix(prev, n, n));
    setMatrixB((prev) => resizeMatrix(prev, n, n));
    setResult(null);
  };

  const updateMatrix = (target: 'A' | 'B', row: number, col: number, val: string) => {
    if (target === 'A') {
      const next = matrixA.map((r) => [...r]);
      next[row][col] = val;
      setMatrixA(next);
    } else {
      const next = matrixB.map((r) => [...r]);
      next[row][col] = val;
      setMatrixB(next);
    }
  };

  const applyPreset = (preset: 'identity' | 'zero' | 'random' | 'clear') => {
    const fillMatrix = (rCount: number, cCount: number, fn: (r: number, c: number) => string) =>
      Array.from({ length: rCount }, (_, r) =>
        Array.from({ length: cCount }, (_, c) => fn(r, c))
      );

    if (preset === 'identity') {
      setMatrixA(fillMatrix(rowsA, colsA, (r, c) => (r === c ? '1' : '0')));
      setMatrixB(fillMatrix(rowsB, colsB, (r, c) => (r === c ? '1' : '0')));
    } else if (preset === 'zero') {
      setMatrixA(fillMatrix(rowsA, colsA, () => '0'));
      setMatrixB(fillMatrix(rowsB, colsB, () => '0'));
    } else if (preset === 'random') {
      setMatrixA(fillMatrix(rowsA, colsA, () => Math.floor(Math.random() * 9 - 3).toString()));
      setMatrixB(fillMatrix(rowsB, colsB, () => Math.floor(Math.random() * 9 - 3).toString()));
    } else if (preset === 'clear') {
      setMatrixA(fillMatrix(rowsA, colsA, () => ''));
      setMatrixB(fillMatrix(rowsB, colsB, () => ''));
      setResult(null);
    }
  };

  const swapMatrices = () => {
    const tempM = matrixA;
    const tempR = rowsA;
    const tempC = colsA;
    setMatrixA(matrixB);
    setRowsA(rowsB);
    setColsA(colsB);
    setMatrixB(tempM);
    setRowsB(tempR);
    setColsB(tempC);
    setResult(null);
  };

  const calculate = () => {
    try {
      const numA = matrixA.map((row) =>
        row.map((cell) => {
          const val = parseFloat(cell === '' ? '0' : cell);
          if (isNaN(val)) throw new Error('All matrix entries must be valid real numbers.');
          return val;
        })
      );

      let numB: number[][] | undefined = undefined;
      if (requiresB) {
        numB = matrixB.map((row) =>
          row.map((cell) => {
            const val = parseFloat(cell === '' ? '0' : cell);
            if (isNaN(val)) throw new Error('All matrix entries must be valid real numbers.');
            return val;
          })
        );
      }

      const res = solveMatrix(op, numA, numB, scalar);
      setResult(res);
    } catch (e: any) {
      setResult({
        operation: op,
        input: [],
        result: [],
        steps: [],
        error: e.message,
      });
    }
  };

  const renderMatrixInput = (
    label: 'A' | 'B',
    data: string[][],
    rows: number,
    cols: number,
    onRowChange: (r: number) => void,
    onColChange: (c: number) => void
  ) => (
    <div className="flex flex-col items-center space-y-3 bg-[#FBF9F8] dark:bg-[#181818] p-4 sm:p-5 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs">
      {/* Header with dimension controls */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 pb-2 border-b border-[#E0E0E0]/70 dark:border-[#2E2825]">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-[#5D4037] text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs">
            {label}
          </span>
          <span className="font-bold text-xs sm:text-sm text-[#131313] dark:text-white">
            Matrix {label}
          </span>
        </div>

        {/* Custom Dimension Selectors */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[11px] text-[#757575] dark:text-[#8D827A]">Size:</span>
          {/* Rows stepper */}
          <div className="flex items-center border border-[#D7CCC8] dark:border-[#3E2723] rounded-lg bg-white dark:bg-[#131313] px-1 py-0.5">
            <button
              type="button"
              onClick={() => onRowChange(rows - 1)}
              disabled={rows <= 1}
              className="px-1 text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] rounded disabled:opacity-30"
              title="Decrease rows"
            >
              −
            </button>
            <span className="px-1 font-bold text-[#5D4037] dark:text-[#D7CCC8]">{rows}r</span>
            <button
              type="button"
              onClick={() => onRowChange(rows + 1)}
              disabled={rows >= 6}
              className="px-1 text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] rounded disabled:opacity-30"
              title="Increase rows"
            >
              +
            </button>
          </div>

          <span className="text-[#8D827A]">×</span>

          {/* Cols stepper */}
          <div className="flex items-center border border-[#D7CCC8] dark:border-[#3E2723] rounded-lg bg-white dark:bg-[#131313] px-1 py-0.5">
            <button
              type="button"
              onClick={() => onColChange(cols - 1)}
              disabled={cols <= 1}
              className="px-1 text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] rounded disabled:opacity-30"
              title="Decrease columns"
            >
              −
            </button>
            <span className="px-1 font-bold text-[#5D4037] dark:text-[#D7CCC8]">{cols}c</span>
            <button
              type="button"
              onClick={() => onColChange(cols + 1)}
              disabled={cols >= 6}
              className="px-1 text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] rounded disabled:opacity-30"
              title="Increase columns"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Tactile Matrix Bracket Grid Container */}
      <div className="relative flex items-center px-2 py-3 bg-white dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#2E2825] rounded-xl shadow-2xs">
        {/* Left bracket [ */}
        <div className="w-3 self-stretch border-l-[3px] border-t-[3px] border-b-[3px] border-[#5D4037] dark:border-[#D7CCC8] rounded-l-xs mr-2" />

        {/* Grid Inputs */}
        <div
          className="grid gap-1.5 sm:gap-2 overflow-x-auto max-w-full p-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {data.map((row, rIdx) =>
            row.map((cell, cIdx) => (
              <input
                key={`${rIdx}-${cIdx}`}
                type="text"
                value={cell}
                onChange={(e) => updateMatrix(label, rIdx, cIdx, e.target.value)}
                className="w-12 h-10 sm:w-14 sm:h-12 text-center font-mono font-bold text-xs sm:text-sm border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg bg-[#FAFAFA] dark:bg-[#1B1B1B] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037] focus:border-[#5D4037] focus:outline-none transition-all shadow-xs"
                placeholder="0"
              />
            ))
          )}
        </div>

        {/* Right bracket ] */}
        <div className="w-3 self-stretch border-r-[3px] border-t-[3px] border-b-[3px] border-[#5D4037] dark:border-[#D7CCC8] rounded-r-xs ml-2" />
      </div>
    </div>
  );

  const formatResult = (res: any) => {
    if (Array.isArray(res) && Array.isArray(res[0])) {
      const resRows = res.length;
      const resCols = res[0].length;
      return (
        <div className="relative flex items-center px-4 py-3 bg-white dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#2E2825] rounded-xl shadow-xs">
          <div className="w-3 self-stretch border-l-[3px] border-t-[3px] border-b-[3px] border-[#5D4037] dark:border-[#D7CCC8] rounded-l-xs mr-2.5" />
          <div
            className="grid gap-2 p-1"
            style={{ gridTemplateColumns: `repeat(${resCols}, minmax(0, 1fr))` }}
          >
            {res.map((row, r) =>
              row.map((val: number, c: number) => (
                <div
                  key={`${r}-${c}`}
                  className="w-12 h-10 sm:w-14 sm:h-12 flex items-center justify-center font-mono font-bold text-xs sm:text-sm border border-[#E0E0E0] dark:border-[#2E2825] rounded-lg bg-[#FAFAFA] dark:bg-[#1B1B1B] text-[#5D4037] dark:text-[#D7CCC8] shadow-2xs"
                >
                  {Number.isInteger(val) ? val : parseFloat(val.toFixed(4))}
                </div>
              ))
            )}
          </div>
          <div className="w-3 self-stretch border-r-[3px] border-t-[3px] border-b-[3px] border-[#5D4037] dark:border-[#D7CCC8] rounded-r-xs ml-2.5" />
        </div>
      );
    } else if (Array.isArray(res)) {
      return (
        <div className="font-mono font-bold text-base text-[#5D4037] dark:text-[#D7CCC8] bg-white dark:bg-[#131313] p-4 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs">
          [ {res.map((v: any) => (typeof v === 'number' ? (Number.isInteger(v) ? v : parseFloat(v.toFixed(4))) : v.toString())).join(', ')} ]
        </div>
      );
    }
    return (
      <div className="font-mono font-bold text-2xl text-[#5D4037] dark:text-[#D7CCC8] bg-white dark:bg-[#131313] px-6 py-3 rounded-xl border-2 border-[#5D4037]/50 dark:border-[#5D4037]/70 shadow-xs">
        {typeof res === 'number' ? (Number.isInteger(res) ? res : parseFloat(res.toFixed(4))) : res}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Quick Presets & Dimension Shortcuts */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-[#1B1B1B] p-4 rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#757575] dark:text-[#8D827A]">
            Square Presets:
          </span>
          {[2, 3, 4].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSquarePreset(s)}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-[#F5F5F5] dark:bg-[#25201E] border border-[#E0E0E0] dark:border-[#3E2723] hover:bg-[#EFEBE9] hover:border-[#5D4037] text-[#5D4037] dark:text-[#D7CCC8] transition-all"
            >
              {s}×{s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#757575] dark:text-[#8D827A]">
            Values:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('identity')}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-[#F5F5F5] dark:bg-[#25201E] border border-[#E0E0E0] dark:border-[#3E2723] hover:bg-[#EFEBE9] hover:border-[#5D4037] text-[#5D4037] dark:text-[#D7CCC8] transition-all"
            title="Identity Matrix"
          >
            Identity (I)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('zero')}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-[#F5F5F5] dark:bg-[#25201E] border border-[#E0E0E0] dark:border-[#3E2723] hover:bg-[#EFEBE9] hover:border-[#5D4037] text-[#5D4037] dark:text-[#D7CCC8] transition-all"
            title="Zero Matrix"
          >
            Zero (0)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('random')}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-[#F5F5F5] dark:bg-[#25201E] border border-[#E0E0E0] dark:border-[#3E2723] hover:bg-[#EFEBE9] hover:border-[#5D4037] text-[#5D4037] dark:text-[#D7CCC8] transition-all"
            title="Random Integers"
          >
            Random
          </button>
          <button
            type="button"
            onClick={() => applyPreset('clear')}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 hover:bg-red-100 transition-all"
            title="Clear all entries"
          >
            Clear
          </button>
        </div>
      </div>

      {/* 2. Operations Palette */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#757575] dark:text-[#8D827A] block">
          Choose Operation
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {OPERATIONS.map((oper) => {
            const isSelected = op === oper.value;
            return (
              <button
                key={oper.value}
                type="button"
                onClick={() => {
                  setOp(oper.value);
                  setResult(null);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-[#5D4037] text-white border-[#795548] shadow-sm scale-[1.02]'
                    : 'bg-white dark:bg-[#1B1B1B] text-[#616161] dark:text-[#A19891] border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] hover:text-[#5D4037] dark:hover:text-white'
                }`}
              >
                <span className="font-mono font-bold text-xs sm:text-sm">{oper.label}</span>
                <span className="text-[10px] opacity-80 mt-0.5 line-clamp-1">{oper.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scalar parameter input (for k·A or A^n) */}
      {requiresScalar && (
        <div className="bg-[#FBF9F8] dark:bg-[#181818] p-3.5 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] flex items-center justify-between gap-4 max-w-sm">
          <label htmlFor="scalarInput" className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8]">
            {op === 'power' ? 'Exponent (Power n):' : 'Scalar Factor (k):'}
          </label>
          <input
            id="scalarInput"
            type="number"
            value={scalar}
            onChange={(e) => setScalar(parseFloat(e.target.value) || 1)}
            min={op === 'power' ? 1 : -99}
            max={op === 'power' ? 6 : 99}
            className="w-20 px-2.5 py-1 text-center font-mono font-bold text-sm rounded-lg border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037] outline-none"
          />
        </div>
      )}

      {/* 3. Matrices Interactive Arena */}
      <div className="flex flex-wrap gap-6 justify-center items-center py-3">
        {renderMatrixInput('A', matrixA, rowsA, colsA, handleRowsAChange, handleColsAChange)}

        {requiresB && (
          <>
            <div className="flex flex-col items-center gap-2">
              <span className="font-mono font-bold text-2xl text-[#5D4037] dark:text-[#D7CCC8]">
                {op === 'add' ? '+' : op === 'subtract' ? '−' : '×'}
              </span>
              <button
                type="button"
                onClick={swapMatrices}
                className="p-2 rounded-xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] shadow-xs transition-colors"
                title="Swap Matrix A and B"
              >
                <ArrowRightLeft size={16} />
              </button>
            </div>
            {renderMatrixInput('B', matrixB, rowsB, colsB, handleRowsBChange, handleColsBChange)}
          </>
        )}
      </div>

      {/* 4. Action CTA Button */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={calculate}
          className="px-8 py-3 bg-[#5D4037] hover:bg-[#4E342E] text-white rounded-xl shadow-md transition font-mono font-bold text-sm cursor-pointer border border-[#795548]/50 inline-flex items-center gap-2"
        >
          <span>Calculate {selectedOpConfig.label}</span>
        </button>
      </div>

      {/* 5. Solution & Step-by-Step Working */}
      {result && (
        <div className="mt-6 pt-6 border-t border-[#E0E0E0] dark:border-[#2E2825] animate-fade-in space-y-6">
          {result.error ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900/40 text-xs sm:text-sm font-mono leading-relaxed">
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Solution Summary Card */}
              <div className="bg-[#FBF9F8] dark:bg-[#151515] p-6 rounded-2xl border-2 border-[#5D4037]/70 dark:border-[#5D4037]/80 text-center shadow-xs">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8] block mb-3">
                  Solution
                </span>
                <div className="flex justify-center overflow-x-auto py-1">
                  {formatResult(result.result)}
                </div>
              </div>

              {/* Step-by-Step Working */}
              {result.steps.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8]">
                    Step-by-Step Working
                  </h3>
                  <div className="space-y-3">
                    {result.steps.map((step, i) => (
                      <div
                        key={i}
                        className="p-4 bg-white dark:bg-[#181818] rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] text-xs sm:text-sm shadow-2xs space-y-1.5"
                      >
                        <p className="text-[#131313] dark:text-white font-medium">{step.explanation}</p>
                        {step.math && (
                          <div className="font-mono text-[#5D4037] dark:text-[#D7CCC8] overflow-x-auto py-1 text-xs sm:text-sm font-semibold">
                            {step.math}
                          </div>
                        )}
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

export default function MatrixSolverWidget() {
  return (
    <ErrorBoundary fallbackTitle="Matrix Solver Error">
      <MatrixSolverWidgetInner />
    </ErrorBoundary>
  );
}

