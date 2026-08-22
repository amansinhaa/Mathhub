'use client';

import React, { useState } from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { Binary, FunctionSquare } from 'lucide-react';

export default function Keypad() {
  const { isScientificMode, appendToExpression, clear, clearEntry, evaluate } =
    useCalculatorStore();

  const [mobileTab, setMobileTab] = useState<'basic' | 'scientific'>('basic');

  const handleBtnClick = (val: string) => {
    if (val === 'AC') {
      clear();
    } else if (val === 'CE') {
      clearEntry();
    } else if (val === '=') {
      evaluate();
    } else {
      appendToExpression(val);
    }
  };

  const standardButtons = [
    { label: 'AC', val: 'AC', className: 'calc-btn-action bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-900/80 text-red-600 dark:text-red-400 font-bold' },
    { label: 'CE', val: 'CE', className: 'calc-btn-action bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-700 dark:text-amber-400 font-bold' },
    { label: '%', val: '%', className: 'calc-btn-operator bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-semibold' },
    { label: '÷', val: '/', className: 'calc-btn-operator bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-semibold' },
    { label: '7', val: '7', className: 'calc-btn-number bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '8', val: '8', className: 'calc-btn-number bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '9', val: '9', className: 'calc-btn-number bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '×', val: '*', className: 'calc-btn-operator bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-semibold' },
    { label: '4', val: '4', className: 'calc-btn-number bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '5', val: '5', className: 'calc-btn-number bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '6', val: '6', className: 'calc-btn-number bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '−', val: '-', className: 'calc-btn-operator bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-semibold' },
    { label: '1', val: '1', className: 'calc-btn-number bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '2', val: '2', className: 'calc-btn-number bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '3', val: '3', className: 'calc-btn-number bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '+', val: '+', className: 'calc-btn-operator bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-semibold' },
    { label: '0', val: '0', className: 'calc-btn-number col-span-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '.', val: '.', className: 'calc-btn-number bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-gray-800 dark:text-gray-100 shadow-xs' },
    { label: '=', val: '=', className: 'calc-btn-equals bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm' },
  ];

  const scientificButtons = [
    { label: 'sin', val: 'sin(' },
    { label: 'cos', val: 'cos(' },
    { label: 'tan', val: 'tan(' },
    { label: 'π', val: 'pi' },
    { label: 'sin⁻¹', val: 'asin(' },
    { label: 'cos⁻¹', val: 'acos(' },
    { label: 'tan⁻¹', val: 'atan(' },
    { label: 'e', val: 'e' },
    { label: 'sinh', val: 'sinh(' },
    { label: 'cosh', val: 'cosh(' },
    { label: 'tanh', val: 'tanh(' },
    { label: 'i', val: 'i' },
    { label: '√', val: 'sqrt(' },
    { label: '∛', val: 'cbrt(' },
    { label: 'xʸ', val: '^' },
    { label: 'n!', val: '!' },
    { label: 'log', val: 'log10(' },
    { label: 'ln', val: 'log(' },
    { label: 'eˣ', val: 'e^' },
    { label: '|x|', val: 'abs(' },
    { label: '(', val: '(' },
    { label: ')', val: ')' },
    { label: 'nCr', val: ' combinations(' },
    { label: 'nPr', val: ' permutations(' },
    { label: '10ˣ', val: '10^' },
    { label: 'x²', val: '^2' },
    { label: 'x³', val: '^3' },
    { label: '1/x', val: '^-1' },
  ];

  return (
    <div className="flex flex-col w-full h-full min-h-0 flex-1">
      {/* Mobile-Only Scientific Keypad Tab Switcher (iOS/Android Calculator Pattern) */}
      {isScientificMode && (
        <div className="flex md:hidden items-center justify-center mb-2 shrink-0">
          <div className="inline-flex bg-gray-200 dark:bg-gray-800 p-0.5 rounded-xl text-xs font-semibold shadow-inner w-full max-w-[280px]">
            <button
              type="button"
              onClick={() => setMobileTab('basic')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileTab === 'basic'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              aria-label="Basic Keypad"
            >
              <Binary size={14} />
              <span>123 Basic</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('scientific')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileTab === 'scientific'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              aria-label="Scientific Keypad"
            >
              <FunctionSquare size={14} />
              <span>fx Scientific</span>
            </button>
          </div>
        </div>
      )}

      {/* Keypad Grid Container - Scales fluidly in available viewport height */}
      <div className="flex flex-col md:flex-row gap-1.5 sm:gap-2 w-full h-full min-h-0 flex-1">
        {/* Scientific Button Panel */}
        {isScientificMode && (
          <div
            className={`grid grid-cols-4 grid-rows-7 gap-1 sm:gap-1.5 flex-1 w-full h-full min-h-0 ${
              mobileTab === 'scientific' ? 'flex' : 'hidden md:grid'
            }`}
          >
            {scientificButtons.map((btn, idx) => (
              <button
                key={`sci-${idx}`}
                type="button"
                onClick={() => handleBtnClick(btn.val)}
                className="calc-btn-function flex items-center justify-center w-full h-full min-h-[38px] sm:min-h-[44px] rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 transition-all border border-gray-200/50 dark:border-gray-700/50 select-none touch-manipulation"
                aria-label={btn.label}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Standard Numeric & Operator Panel */}
        <div
          className={`grid grid-cols-4 grid-rows-5 gap-1 sm:gap-1.5 flex-1 w-full h-full min-h-0 ${
            isScientificMode && mobileTab === 'scientific' ? 'hidden md:grid' : 'grid'
          }`}
        >
          {standardButtons.map((btn, idx) => (
            <button
              key={`std-${idx}`}
              type="button"
              onClick={() => handleBtnClick(btn.val)}
              className={`flex items-center justify-center w-full h-full min-h-[40px] sm:min-h-[44px] rounded-lg sm:rounded-xl text-base sm:text-lg lg:text-xl active:scale-[0.98] transition-all border border-gray-200/60 dark:border-gray-700/60 select-none touch-manipulation ${
                btn.className
              }`}
              aria-label={btn.label}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
