'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useGraphStore } from '@/stores/graphStore';
import EquationInput from './EquationInput';
import DataTableInput from './DataTableInput';
import CSVUploader from './CSVUploader';
import ExportButton from './ExportButton';
import SavedGraphsList from './SavedGraphsList';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Printer, Compass } from 'lucide-react';
import FunctionAnalysisPanel from './FunctionAnalysisPanel';
import UnitCircleModal from './UnitCircleModal';

const FunctionPlotter = dynamic(() => import('./FunctionPlotter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] md:min-h-[560px] bg-white dark:bg-[#1B1B1B] rounded-2xl flex items-center justify-center border border-[#E0E0E0] dark:border-[#2E2825]">
      <span className="text-xs font-mono text-[#757575] dark:text-[#8D827A] animate-pulse">Initializing Plotter Engine...</span>
    </div>
  ),
});

const DataChart = dynamic(() => import('./DataChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-white dark:bg-[#1B1B1B] rounded-2xl flex items-center justify-center border border-[#E0E0E0] dark:border-[#2E2825]">
      <span className="text-xs font-mono text-[#757575] dark:text-[#8D827A] animate-pulse">Loading Chart Engine...</span>
    </div>
  ),
});

const CollageExport = dynamic(() => import('./CollageExport'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] bg-white dark:bg-[#1B1B1B] rounded-2xl flex items-center justify-center border border-[#E0E0E0] dark:border-[#2E2825]">
      <span className="text-xs font-mono text-[#757575] dark:text-[#8D827A] animate-pulse">Preparing Collage Studio...</span>
    </div>
  ),
});

export default function GraphModule() {
  const { inputMode, setInputMode, chartType, setChartType, regressionType, setRegressionType } = useGraphStore();
  const [isUnitCircleOpen, setIsUnitCircleOpen] = React.useState(false);

  return (
    <div className="flex flex-col h-full space-y-4 animate-fade-in text-[#131313] dark:text-[#F5F5F5]">
      {/* Unit Circle Modal */}
      <UnitCircleModal isOpen={isUnitCircleOpen} onClose={() => setIsUnitCircleOpen(false)} />

      {/* Top App Bar / Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E0E0E0] dark:border-[#2E2825] pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#131313] dark:text-white">
                Graphing Studio
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] text-[10px] font-mono font-bold uppercase dark:border-[#5D4037]/50">
                2D PLOTTER
              </span>
            </div>
            <p className="text-[11px] text-[#616161] dark:text-[#A19891] hidden sm:block">
              Laboratory-grade 2D function plotting, implicit curves, and print sheets
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
          {/* Unit Circle Tool Button */}
          <button
            type="button"
            onClick={() => setIsUnitCircleOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 border border-[#E0E0E0] dark:border-[#2E2825] bg-white dark:bg-[#1B1B1B] text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#EFEBE9] dark:hover:bg-[#3E2723]/60 shadow-xs"
            title="Interactive Unit Circle"
          >
            <Compass size={14} />
            <span className="hidden sm:inline">Unit Circle</span>
          </button>

          <div className="flex overflow-x-auto scrollbar-none space-x-1 bg-[#F5F5F5] dark:bg-[#131313] p-1 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] w-full sm:w-auto transition-colors">
            {(
              [
                { id: 'equation', label: 'Equation' },
                { id: 'table', label: 'Table' },
                { id: 'file', label: 'CSV File' },
                { id: 'collage', label: 'Collage Sheet' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setInputMode(item.id)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[32px] border ${
                  inputMode === item.id
                    ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs font-bold'
                    : 'bg-transparent text-[#616161] border-transparent hover:text-[#131313] hover:bg-[#EFEBE9] dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#22201F]'
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
      </header>

      {/* Main Multi-Pane Content Area */}
      {inputMode === 'collage' ? (
        <CollageExport />
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Mobile Only: Graph Canvas placed prominently at the top */}
          <div className="w-full min-w-0 lg:hidden">
            {inputMode === 'equation' ? <FunctionPlotter /> : <DataChart />}
          </div>

          {/* Left Panel - Inputs & Controls */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col space-y-4">
            <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
              {inputMode === 'equation' && <EquationInput />}
              {inputMode === 'table' && <DataTableInput />}
              {inputMode === 'file' && <CSVUploader />}
            </div>

            {/* Function Analysis Side Panel */}
            {inputMode === 'equation' && <FunctionAnalysisPanel />}

            {(inputMode === 'table' || inputMode === 'file') && (
              <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 flex flex-col space-y-3 transition-colors shadow-sm">
                <div>
                  <label className="block text-xs font-mono font-medium text-[#5D4037] dark:text-[#D7CCC8] mb-1">Chart Type</label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as any)}
                    className="math-input py-2 text-xs bg-white dark:bg-[#131313] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
                  >
                    <option value="line">Line</option>
                    <option value="scatter">Scatter</option>
                    <option value="bar">Bar</option>
                    <option value="area">Area</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono font-medium text-[#5D4037] dark:text-[#D7CCC8] mb-1">Regression</label>
                  <select
                    value={regressionType}
                    onChange={(e) => setRegressionType(e.target.value as any)}
                    className="math-input py-2 text-xs bg-white dark:bg-[#131313] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#332D2A]"
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
            <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 shadow-sm transition-colors">
              <SavedGraphsList />
            </div>

            {/* Quick Export & Print */}
            <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 shadow-sm transition-colors">
              <ExportButton />
            </div>
          </div>

          {/* Desktop Right Panel - Chart / Canvas (Hidden on mobile to avoid duplication) */}
          <div className="hidden lg:block flex-1 w-full min-w-0">
            {inputMode === 'equation' ? <FunctionPlotter /> : <DataChart />}
          </div>
        </div>
      )}
    </div>
  );
}
