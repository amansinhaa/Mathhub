'use client';

import React from 'react';
import { useGraphStore } from '@/stores/graphStore';
import EquationInput from './EquationInput';
import DataTableInput from './DataTableInput';
import CSVUploader from './CSVUploader';
import FunctionPlotter from './FunctionPlotter';
import DataChart from './DataChart';
import ExportButton from './ExportButton';
import SavedGraphsList from './SavedGraphsList';
import CollageExport from './CollageExport';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Layers, Printer } from 'lucide-react';

export default function GraphModule() {
  const { inputMode, setInputMode, chartType, setChartType, regressionType, setRegressionType } = useGraphStore();

  return (
    <div className="flex flex-col h-full space-y-4 sm:space-y-6 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--card-border)] pb-3 sm:pb-4 gap-3 sm:gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-xl sm:text-3xl font-bold text-transparent">
            Graphing Tool
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Plot mathematical functions, analyze table data, or build multi-graph printable notebook sheets
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
          <div className="flex overflow-x-auto scrollbar-none space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto">
            {(
              [
                { id: 'equation', label: 'From Equation' },
                { id: 'table', label: 'From Table' },
                { id: 'file', label: 'From File' },
                { id: 'collage', label: 'Collage (Print)' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setInputMode(item.id)}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[34px] ${
                  inputMode === item.id
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                aria-label={`Switch to ${item.label} mode`}
              >
                {item.id === 'collage' && <Printer size={13} />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content Area */}
      {inputMode === 'collage' ? (
        <CollageExport />
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
          {/* Left Panel - Inputs & Saved Graphs */}
          <div className="w-full lg:w-1/3 flex flex-col space-y-4 sm:space-y-5">
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

            {/* My Graphs Saved Snapshot List */}
            <div className="math-card">
              <SavedGraphsList />
            </div>

            <div className="math-card">
              <ExportButton />
            </div>
          </div>

          {/* Right Panel - Chart */}
          <div className="w-full lg:w-2/3 min-w-0">
            {inputMode === 'equation' ? <FunctionPlotter /> : <DataChart />}
          </div>
        </div>
      )}
    </div>
  );
}
