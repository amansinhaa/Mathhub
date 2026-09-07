'use client';

import React from 'react';
import dynamic from '@/components/shared/DynamicShim';
import { useGraphStore } from '@/stores/graphStore';
import EquationInput from './EquationInput';
import DataTableInput from './DataTableInput';
import CSVUploader from './CSVUploader';
import ExportButton from './ExportButton';
import SavedGraphsList from './SavedGraphsList';
import { Printer, Compass, Eye, EyeOff, Trash2, Plus, Keyboard as KeyboardIcon, ChevronDown, Copy, Check } from 'lucide-react';
import FunctionAnalysisPanel from './FunctionAnalysisPanel';
import UnitCircleModal from './UnitCircleModal';
import { VirtualMathKeyboard } from '@/components/shared/VirtualMathKeyboard';

const FunctionPlotter = dynamic(() => import('./FunctionPlotter'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[280px] md:min-h-[560px] bg-white dark:bg-[#1B1B1B] rounded-2xl flex items-center justify-center border border-[#E0E0E0] dark:border-[#2E2825]">
      <span className="text-xs font-mono text-[#757575] dark:text-[#8D827A] animate-pulse">Initializing Plotter Engine...</span>
    </div>
  ),
});

const DataChart = dynamic(() => import('./DataChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] bg-white dark:bg-[#1B1B1B] rounded-2xl flex items-center justify-center border border-[#E0E0E0] dark:border-[#2E2825]">
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
  const {
    inputMode,
    setInputMode,
    chartType,
    setChartType,
    regressionType,
    setRegressionType,
    equations,
    updateEquation,
    addEquation,
    removeEquation,
  } = useGraphStore();

  const [isUnitCircleOpen, setIsUnitCircleOpen] = React.useState(false);
  const [showMobileKeyboard, setShowMobileKeyboard] = React.useState(true);
  const [activeMobileEqId, setActiveMobileEqId] = React.useState<string>(() => equations[0]?.id || 'eq-1');
  const [copiedMobileEq, setCopiedMobileEq] = React.useState(false);

  const mobileInputRef = React.useRef<HTMLInputElement | null>(null);
  const mobileSelectionRange = React.useRef<{ start: number; end: number } | null>(null);

  const activeMobileEq = equations.find((e) => e.id === activeMobileEqId) || equations[0];

  const handleMobileInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    mobileSelectionRange.current = {
      start: e.target.selectionStart ?? e.target.value.length,
      end: e.target.selectionEnd ?? e.target.value.length,
    };
  };

  const handleMobileInsert = (text: string) => {
    const targetId = activeMobileEq?.id || equations[0]?.id;
    if (!targetId) return;
    const eq = equations.find((e) => e.id === targetId);
    if (!eq) return;

    const inputEl = mobileInputRef.current;
    let start = eq.expression.length;
    let end = eq.expression.length;

    if (inputEl && document.activeElement === inputEl) {
      start = inputEl.selectionStart ?? eq.expression.length;
      end = inputEl.selectionEnd ?? eq.expression.length;
    } else if (mobileSelectionRange.current) {
      start = mobileSelectionRange.current.start;
      end = mobileSelectionRange.current.end;
    }

    const before = eq.expression.slice(0, start);
    const after = eq.expression.slice(end);
    const newExpr = before + text + after;
    updateEquation(targetId, newExpr);

    const newPos = start + text.length;
    mobileSelectionRange.current = { start: newPos, end: newPos };

    if (inputEl) {
      // Set cursor without forcing a focus that summons the mobile OS keyboard
      inputEl.setSelectionRange(newPos, newPos);
    }
  };

  const handleMobileBackspace = () => {
    const targetId = activeMobileEq?.id || equations[0]?.id;
    if (!targetId) return;
    const eq = equations.find((e) => e.id === targetId);
    if (!eq) return;

    const inputEl = mobileInputRef.current;
    let start = eq.expression.length;
    let end = eq.expression.length;

    if (inputEl && document.activeElement === inputEl) {
      start = inputEl.selectionStart ?? eq.expression.length;
      end = inputEl.selectionEnd ?? eq.expression.length;
    } else if (mobileSelectionRange.current) {
      start = mobileSelectionRange.current.start;
      end = mobileSelectionRange.current.end;
    }

    if (start === 0 && end === 0) return;

    let newExpr = '';
    let newPos = 0;
    if (start === end) {
      newExpr = eq.expression.slice(0, start - 1) + eq.expression.slice(end);
      newPos = Math.max(0, start - 1);
    } else {
      newExpr = eq.expression.slice(0, start) + eq.expression.slice(end);
      newPos = start;
    }

    updateEquation(targetId, newExpr);
    mobileSelectionRange.current = { start: newPos, end: newPos };

    if (inputEl) {
      inputEl.setSelectionRange(newPos, newPos);
    }
  };

  const handleMobileClear = () => {
    const targetId = activeMobileEq?.id || equations[0]?.id;
    if (!targetId) return;
    updateEquation(targetId, '');
    mobileSelectionRange.current = { start: 0, end: 0 };
    if (mobileInputRef.current) {
      mobileInputRef.current.setSelectionRange(0, 0);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2 sm:space-y-3.5 animate-fade-in text-[#131313] dark:text-[#F5F5F5]">
      {/* Unit Circle Modal */}
      <UnitCircleModal isOpen={isUnitCircleOpen} onClose={() => setIsUnitCircleOpen(false)} />

      {/* Top App Bar / Header — Cleared of floating navbar overlap */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E0E0E0] dark:border-[#2E2825] pb-2 gap-2 pt-12 sm:pt-0 sm:pl-28">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-semibold tracking-widest text-[#757575] dark:text-[#9E9E9E] uppercase">
            EASYEQUATE
          </span>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-[#131313] dark:text-white">
              2D Graph Plotter
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] text-[10px] font-mono font-bold uppercase dark:border-[#5D4037]/50">
              Curves & Plots
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
          {/* Unit Circle Tool Button */}
          <button
            type="button"
            onClick={() => setIsUnitCircleOpen(true)}
            className="px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition-all flex items-center justify-center gap-1.5 border border-[#E0E0E0] dark:border-[#2E2825] bg-white dark:bg-[#1B1B1B] text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#EFEBE9] dark:hover:bg-[#3E2723]/60 shadow-xs"
            title="Interactive Unit Circle"
          >
            <Compass size={13} />
            <span className="hidden sm:inline">Unit Circle</span>
          </button>

          <div className="flex overflow-x-auto scrollbar-none space-x-1 bg-[#F5F5F5] dark:bg-[#131313] p-0.5 sm:p-1 rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] w-full sm:w-auto transition-colors">
            {(
              [
                { id: 'equation', label: 'f(x) Plot' },
                { id: 'table', label: 'Table' },
                { id: 'file', label: 'CSV File' },
                { id: 'collage', label: 'Collage Sheet' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setInputMode(item.id)}
                className={`flex-1 sm:flex-none px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap min-h-[28px] sm:min-h-[32px] border ${
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
        </div>
      </header>

      {/* Main Multi-Pane Content Area */}
      {inputMode === 'collage' ? (
        <CollageExport />
      ) : (
        <>
          {/* MOBILE-ONLY INTEGRATED ZERO-SCROLL WORKSPACE (Screen < 1024px) */}
          <div className="flex flex-col lg:hidden space-y-2 w-full pb-4">
            {inputMode === 'equation' ? (
              <>
                {/* 1. The Compact Plotter Canvas — Increased Height for Visibility */}
                <div className="w-full shrink-0">
                  <FunctionPlotter
                    compact={showMobileKeyboard}
                    mobileHeight={showMobileKeyboard ? 295 : 420}
                  />
                </div>

                {/* 2. Sleek Active Equation Input Strip directly beneath graph */}
                <div className="w-full bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-xl p-2 shadow-xs transition-colors space-y-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    {/* Equation selector tabs: [1 ●] [2 ●] [+] */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-[65%]">
                      {equations.map((eq, idx) => (
                        <button
                          key={eq.id}
                          type="button"
                          onClick={() => setActiveMobileEqId(eq.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all border shrink-0 ${
                            activeMobileEq?.id === eq.id
                              ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs'
                              : 'bg-[#F5F5F5] dark:bg-[#131313] text-[#616161] dark:text-[#A19891] border-[#E0E0E0] dark:border-[#2E2825]'
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: eq.color }}
                          />
                          <span>{idx + 1}</span>
                        </button>
                      ))}
                      {equations.length < 6 && (
                        <button
                          type="button"
                          onClick={() => {
                            addEquation();
                            setTimeout(() => {
                              const latest = useGraphStore.getState().equations;
                              const last = latest[latest.length - 1];
                              if (last) setActiveMobileEqId(last.id);
                            }, 50);
                          }}
                          className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#F5F5F5] hover:bg-[#EFEBE9] dark:bg-[#131313] dark:hover:bg-[#22201F] text-[#5D4037] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#2E2825] transition-colors shrink-0"
                          title="Add Equation"
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    {/* Quick controls: Keyboard toggle, Eye, Trash */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowMobileKeyboard(!showMobileKeyboard)}
                        className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg transition-colors border ${
                          showMobileKeyboard
                            ? 'bg-[#5D4037] text-white border-[#795548] font-bold'
                            : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825]'
                        }`}
                        title="Toggle Math Keyboard"
                      >
                        <KeyboardIcon size={12} />
                        <span>{showMobileKeyboard ? 'Hide' : 'Keys'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => activeMobileEq && updateEquation(activeMobileEq.id, undefined, !activeMobileEq.visible)}
                        className="p-1 text-[#757575] hover:text-[#131313] dark:text-[#8D827A] dark:hover:text-white"
                        title="Toggle Visibility"
                      >
                        {activeMobileEq?.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      {equations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => activeMobileEq && removeEquation(activeMobileEq.id)}
                          className="p-1 text-[#757575] hover:text-red-500 dark:text-[#8D827A] dark:hover:text-[#FFAB91]"
                          title="Remove Equation"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Input Line */}
                  <div className="flex items-center gap-2 bg-white dark:bg-[#131313] px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#332D2A] focus-within:ring-2 focus-within:ring-[#5D4037]/30 focus-within:border-[#5D4037]">
                    <span className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] shrink-0">
                      y =
                    </span>
                    <input
                      ref={mobileInputRef}
                      type="text"
                      inputMode={showMobileKeyboard ? 'none' : 'text'}
                      value={activeMobileEq ? activeMobileEq.expression : ''}
                      onFocus={() => setShowMobileKeyboard(true)}
                      onBlur={handleMobileInputBlur}
                      onChange={(e) => activeMobileEq && updateEquation(activeMobileEq.id, e.target.value)}
                      placeholder="Type formula (e.g. x² - 4, sin(x), x³)"
                      className="bg-transparent border-none outline-none w-full font-mono text-xs text-[#131313] dark:text-white placeholder-[#9E9E9E] dark:placeholder-[#8D827A]"
                    />
                    {activeMobileEq?.expression && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeMobileEq?.expression) {
                              navigator.clipboard.writeText(activeMobileEq.expression);
                              setCopiedMobileEq(true);
                              setTimeout(() => setCopiedMobileEq(false), 1500);
                            }
                          }}
                          className="p-1 text-[#757575] hover:text-[#5D4037] dark:text-[#8D827A] dark:hover:text-white transition-colors"
                          title="Copy Equation"
                          aria-label="Copy Equation"
                        >
                          {copiedMobileEq ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={handleMobileClear}
                          className="text-[10px] font-mono font-bold text-[#757575] hover:text-red-500 dark:text-[#8D827A] dark:hover:text-[#FFAB91]"
                        >
                          CLR
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Dense Scientific & Graphing Keypad with PLOT action CTA */}
                {showMobileKeyboard ? (
                  <div className="w-full shrink-0 animate-fade-in">
                    <VirtualMathKeyboard
                      onInsert={handleMobileInsert}
                      onBackspace={handleMobileBackspace}
                      onClear={handleMobileClear}
                      onPlot={() => {
                        // Triggers instant feedback and closes/confirms plot
                        if (activeMobileEq && !activeMobileEq.visible) {
                          updateEquation(activeMobileEq.id, undefined, true);
                        }
                      }}
                      onClose={() => setShowMobileKeyboard(false)}
                    />
                  </div>
                ) : (
                  <div className="w-full pt-1">
                    <button
                      type="button"
                      onClick={() => setShowMobileKeyboard(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-[#BCAAA4] dark:border-[#5D4037] bg-white dark:bg-[#1B1B1B] text-xs font-mono font-medium text-[#5D4037] dark:text-[#D7CCC8] hover:bg-[#EFEBE9] dark:hover:bg-[#282422] transition-colors shadow-2xs"
                    >
                      <KeyboardIcon size={14} />
                      <span>Show Inbuilt Math Keyboard</span>
                    </button>
                  </div>
                )}

                {/* 4. Collapsible Extra Tools & Analysis Drawer */}
                <div className="w-full pt-2">
                  <details className="group bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-xl p-3 shadow-xs">
                    <summary className="text-xs font-mono font-bold text-[#5D4037] dark:text-[#D7CCC8] cursor-pointer list-none flex items-center justify-between select-none">
                      <span>Tools, Analysis & Saved Graphs</span>
                      <ChevronDown size={14} className="text-[#757575] group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="pt-3 space-y-3">
                      <FunctionAnalysisPanel />
                      <SavedGraphsList />
                      <ExportButton />
                    </div>
                  </details>
                </div>
              </>
            ) : (
              /* Non-equation mobile modes (Table / File) */
              <>
                <div className="w-full">
                  <DataChart />
                </div>
                <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 shadow-sm">
                  {inputMode === 'table' && <DataTableInput />}
                  {inputMode === 'file' && <CSVUploader />}
                </div>
              </>
            )}
          </div>

          {/* DESKTOP WORKSPACE (Screen >= 1024px): Preserved Side-by-Side View */}
          <div className="hidden lg:flex flex-row gap-5 items-start">
            {/* Left Panel - Inputs, Keyboard, Analysis */}
            <div className="w-[380px] xl:w-[420px] shrink-0 flex flex-col space-y-4">
              <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 sm:p-5 shadow-sm transition-colors">
                {inputMode === 'equation' && <EquationInput />}
                {inputMode === 'table' && <DataTableInput />}
                {inputMode === 'file' && <CSVUploader />}
              </div>

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

              <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 shadow-sm transition-colors">
                <SavedGraphsList />
              </div>

              <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] rounded-2xl p-4 shadow-sm transition-colors">
                <ExportButton />
              </div>
            </div>

            {/* Right Panel - Full-Size Plotter Canvas */}
            <div className="flex-1 w-full min-w-0">
              {inputMode === 'equation' ? <FunctionPlotter /> : <DataChart />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

