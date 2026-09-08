'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from '@/components/shared/RouterShim';
import Display from './Display';
import Keypad from './Keypad';
import HistoryPanel from './HistoryPanel';
import AngleModeToggle from './AngleModeToggle';
import MemoryIndicator from './MemoryIndicator';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { FlaskConical, History, X } from 'lucide-react';

function CalculatorQuerySync() {
  const searchParams = useSearchParams();
  const { setExpression } = useCalculatorStore();

  useEffect(() => {
    const formula = searchParams.get('formula') || searchParams.get('expr');
    if (formula) {
      setExpression(formula);
    }
  }, [searchParams, setExpression]);

  return null;
}

export default function Calculator() {
  const [showHistory, setShowHistory] = useState(false);
  const {
    isScientificMode,
    toggleScientificMode,
    appendToExpression,
    evaluate,
    clear,
    clearEntry,
  } = useCalculatorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = e.key;
      if (/^[0-9.]$/.test(key)) {
        appendToExpression(key);
      } else if (['+', '-', '*', '/', '(', ')', '^', '%'].includes(key)) {
        appendToExpression(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        evaluate();
      } else if (key === 'Escape') {
        clear();
      } else if (key === 'Backspace') {
        clearEntry();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appendToExpression, evaluate, clear, clearEntry]);

  return (
    <div className="flex flex-col h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-3.2rem)] max-h-[100dvh] overflow-hidden justify-between animate-fade-in text-[#131313] dark:text-[#F5F5F5]">
      <Suspense fallback={null}>
        <CalculatorQuerySync />
      </Suspense>
      {/* Top App Bar — Material 3 / Instrument-Grade Header */}
      <header className="flex items-center justify-between gap-3 pb-2 shrink-0 border-b border-[#E0E0E0] dark:border-[#2E2825]">
        <div className="flex items-center gap-3 pl-28 sm:pl-36 md:pl-44">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#131313] dark:text-white">
                Scientific Calculator
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] text-[10px] font-mono font-bold uppercase dark:border-[#5D4037]/50">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#616161] dark:text-[#A19891] hidden sm:block">
              Precision arithmetic, trigonometry, and scientific expressions
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleScientificMode}
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold transition-all duration-150 border ${
              isScientificMode
                ? 'bg-[#5D4037] text-white border-[#795548] shadow-xs'
                : 'bg-white text-[#616161] border-[#E0E0E0] hover:bg-[#F5F5F5] hover:text-[#131313] dark:bg-[#1B1B1B] dark:text-[#D7CCC8] dark:border-[#2E2825] dark:hover:bg-[#2A2827]'
            }`}
            title={isScientificMode ? 'Standard Mode' : 'Scientific Mode'}
            aria-label={isScientificMode ? 'Switch to Standard Mode' : 'Switch to Scientific Mode'}
          >
            <FlaskConical size={14} />
            <span className="hidden xs:inline">{isScientificMode ? 'Scientific' : 'Standard'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`rounded-xl p-2 sm:p-2.5 transition-all duration-150 lg:hidden border ${
              showHistory
                ? 'bg-[#5D4037] text-white border-[#795548]'
                : 'bg-white text-[#616161] border-[#E0E0E0] hover:text-[#131313] hover:bg-[#F5F5F5] dark:bg-[#1B1B1B] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white dark:hover:bg-[#2A2827]'
            }`}
            title="History"
            aria-label="Toggle Calculation History"
          >
            <History size={16} />
          </button>
        </div>
      </header>

      {/* Main Dual-Pane / Workspace Content Area */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-5 flex-1 min-h-0 h-full overflow-hidden pt-2">
        {/* Left Pane (Input / Tactile Keypad) */}
        <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden justify-between">
          {/* Display */}
          <Display />

          {/* Controls Row (Deg/Rad, Memory) */}
          <div className="mb-2 shrink-0 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <AngleModeToggle />
            <MemoryIndicator />
          </div>

          {/* Keypad - Dynamically Fills Available Height */}
          <div className="flex-1 min-h-0 h-full w-full overflow-hidden flex flex-col">
            <Keypad />
          </div>
        </div>

        {/* Right Pane (Output / Visual / History Log) */}
        <div className="hidden w-80 xl:w-96 lg:flex flex-col min-h-0 h-full overflow-hidden">
          <HistoryPanel />
        </div>
      </div>

      {/* Mobile History Drawer */}
      {showHistory && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setShowHistory(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[70dvh] animate-slide-up overflow-y-auto rounded-t-3xl border-t border-[#E0E0E0] dark:border-[#3E2723] bg-white dark:bg-[#1B1B1B] p-4 lg:hidden shadow-2xl">
            <div className="mb-3 flex items-center justify-between pb-2 border-b border-[#E0E0E0] dark:border-[#2E2825]">
              <h3 className="font-semibold text-sm text-[#131313] dark:text-white">Calculation History</h3>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="p-1.5 text-[#616161] hover:bg-[#F5F5F5] hover:text-[#131313] dark:text-[#A19891] dark:hover:bg-[#2A2827] dark:hover:text-white rounded-lg transition-colors"
                aria-label="Close History"
              >
                <X size={18} />
              </button>
            </div>
            <HistoryPanel />
          </div>
        </>
      )}
    </div>
  );
}
