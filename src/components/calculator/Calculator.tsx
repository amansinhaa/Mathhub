'use client';

import React, { useEffect, useState } from 'react';
import Display from './Display';
import Keypad from './Keypad';
import HistoryPanel from './HistoryPanel';
import AngleModeToggle from './AngleModeToggle';
import MemoryIndicator from './MemoryIndicator';
import UnitConverter from './UnitConverter';
import MatrixInput from './MatrixInput';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { FlaskConical, History, Calculator as CalcIcon, ArrowRightLeft, Grid3X3, X } from 'lucide-react';

export default function Calculator() {
  const [activeTab, setActiveTab] = useState<'calc' | 'units' | 'matrix'>('calc');
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
      // Don't capture keys when typing in input fields or in other tabs
      if (
        activeTab !== 'calc' ||
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
  }, [activeTab, appendToExpression, evaluate, clear, clearEntry]);

  return (
    <div className="flex flex-col h-[calc(100dvh-6.5rem)] lg:h-[calc(100dvh-3rem)] max-h-[100dvh] overflow-hidden justify-between animate-fade-in">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between gap-2 pb-1.5 shrink-0">
        <div>
          <h1 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-xl sm:text-2xl font-bold text-transparent">
            Scientific Calculator
          </h1>
          <p className="text-[11px] sm:text-xs text-[var(--muted)] hidden sm:block">
            Trigonometry, complex numbers, matrices, and unit conversions
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {activeTab === 'calc' && (
            <button
              type="button"
              onClick={toggleScientificMode}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold transition-all duration-150 ${
                isScientificMode
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              title={isScientificMode ? 'Standard Mode' : 'Scientific Mode'}
              aria-label={isScientificMode ? 'Switch to Standard Mode' : 'Switch to Scientific Mode'}
            >
              <FlaskConical size={15} />
              <span className="hidden xs:inline">{isScientificMode ? 'Scientific' : 'Standard'}</span>
            </button>
          )}

          {activeTab === 'calc' && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className={`rounded-xl p-2 sm:p-2.5 transition-all duration-150 lg:hidden ${
                showHistory
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
              title="History"
              aria-label="Toggle Calculation History"
            >
              <History size={18} />
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Mode Sub-Tabs */}
      <div className="flex gap-1.5 sm:gap-2 border-b border-[var(--card-border)] pb-1.5 mb-2 shrink-0 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('calc')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors shrink-0 ${
            activeTab === 'calc'
              ? 'bg-blue-500 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label="Calculator Mode"
        >
          <CalcIcon size={14} />
          <span>Calculator</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('units')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors shrink-0 ${
            activeTab === 'units'
              ? 'bg-blue-500 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label="Unit Converter Mode"
        >
          <ArrowRightLeft size={14} />
          <span>Unit Converter</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors shrink-0 ${
            activeTab === 'matrix'
              ? 'bg-blue-500 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label="Matrix Calculator Mode"
        >
          <Grid3X3 size={14} />
          <span>Matrices</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'calc' && (
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-4 flex-1 min-h-0 h-full overflow-hidden">
          {/* Main Calculator Area - Fixed Viewport Fit */}
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

          {/* History Panel (Desktop Sidebar) */}
          <div className="hidden w-72 xl:w-80 lg:flex flex-col min-h-0 h-full overflow-y-auto">
            <HistoryPanel />
          </div>
        </div>
      )}

      {activeTab === 'units' && (
        <div className="max-w-3xl mx-auto flex-1 overflow-y-auto w-full py-2">
          <UnitConverter />
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="max-w-3xl mx-auto flex-1 overflow-y-auto w-full py-2">
          <MatrixInput />
        </div>
      )}

      {/* Mobile History Drawer */}
      {showHistory && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setShowHistory(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[70dvh] animate-slide-up overflow-y-auto rounded-t-2xl border-t border-[var(--card-border)] bg-[var(--background)] p-4 lg:hidden shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Calculation History</h3>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
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
