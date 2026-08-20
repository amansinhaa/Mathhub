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
import { FlaskConical, History, Calculator as CalcIcon, ArrowRightLeft, Grid3X3 } from 'lucide-react';

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
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-2xl sm:text-3xl font-bold text-transparent">
            Scientific Calculator
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Evaluate complex expressions, trigonometry, matrix operations, and unit conversions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'calc' && (
            <button
              onClick={toggleScientificMode}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                isScientificMode
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              title={isScientificMode ? 'Standard Mode' : 'Scientific Mode'}
            >
              <FlaskConical size={16} />
              <span>{isScientificMode ? 'Scientific' : 'Standard'}</span>
            </button>
          )}

          {activeTab === 'calc' && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`rounded-xl p-2.5 transition-all duration-150 lg:hidden ${
                showHistory
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
              title="History"
            >
              <History size={20} />
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Mode Sub-Tabs */}
      <div className="flex gap-2 border-b border-[var(--card-border)] pb-2">
        <button
          onClick={() => setActiveTab('calc')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'calc'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <CalcIcon size={16} />
          <span>Calculator</span>
        </button>
        <button
          onClick={() => setActiveTab('units')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'units'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ArrowRightLeft size={16} />
          <span>Unit Converter</span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'matrix'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Grid3X3 size={16} />
          <span>Matrices</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'calc' && (
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Calculator Area */}
          <div className="flex-1">
            {/* Display */}
            <Display />

            {/* Controls Row */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <AngleModeToggle />
              <MemoryIndicator />
            </div>

            {/* Keypad */}
            <Keypad />
          </div>

          {/* History Panel (Desktop Sidebar) */}
          <div className="hidden w-80 lg:block">
            <HistoryPanel />
          </div>
        </div>
      )}

      {activeTab === 'units' && (
        <div className="max-w-3xl mx-auto">
          <UnitConverter />
        </div>
      )}

      {activeTab === 'matrix' && (
        <div className="max-w-3xl mx-auto">
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
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] animate-slide-up overflow-y-auto rounded-t-2xl border-t border-[var(--card-border)] bg-[var(--background)] p-4 lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Calculation History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>
            <HistoryPanel />
          </div>
        </>
      )}
    </div>
  );
}
