'use client';

import React from 'react';
import { useGraphStore } from '@/stores/graphStore';
import EquationInput from './EquationInput';
import DataTableInput from './DataTableInput';
import CSVUploader from './CSVUploader';
import FunctionPlotter from './FunctionPlotter';
import DataChart from './DataChart';
import ExportButton from './ExportButton';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function GraphModule() {
  const { inputMode, setInputMode, chartType, setChartType, regressionType, setRegressionType } = useGraphStore();

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--card-border)] pb-4 gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-2xl sm:text-3xl font-bold text-transparent">
            Graphing Tool
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Plot mathematical functions, scatter tables, or upload CSV files with regression analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {(['equation', 'table', 'file'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  inputMode === mode
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                From {mode}
              </button>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Inputs */}
        <div className="w-full lg:w-1/3 flex flex-col space-y-6">
          <div className="math-card">
            {inputMode === 'equation' && <EquationInput />}
            {inputMode === 'table' && <DataTableInput />}
            {inputMode === 'file' && <CSVUploader />}
          </div>

          {(inputMode === 'table' || inputMode === 'file') && (
            <div className="math-card flex flex-col space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Chart Type</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  className="math-input py-2 text-sm"
                >
                  <option value="line">Line</option>
                  <option value="scatter">Scatter</option>
                  <option value="bar">Bar</option>
                  <option value="area">Area</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Regression</label>
                <select
                  value={regressionType}
                  onChange={(e) => setRegressionType(e.target.value as any)}
                  className="math-input py-2 text-sm"
                >
                  <option value="none">None</option>
                  <option value="linear">Linear (y = mx + b)</option>
                  <option value="polynomial">Polynomial (Degree 2)</option>
                  <option value="exponential">Exponential (y = ae^bx)</option>
                </select>
              </div>
            </div>
          )}

          <div className="math-card">
            <ExportButton />
          </div>
        </div>

        {/* Right Panel - Chart */}
        <div className="w-full lg:w-2/3">
          {inputMode === 'equation' ? <FunctionPlotter /> : <DataChart />}
        </div>
      </div>
    </div>
  );
}
