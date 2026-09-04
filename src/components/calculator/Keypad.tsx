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
    { label: 'AC', val: 'AC', className: 'calc-btn-action' },
    { label: 'CE', val: 'CE', className: 'calc-btn-action' },
    { label: '%', val: '%', className: 'calc-btn-operator' },
    { label: '÷', val: ' ÷ ', className: 'calc-btn-operator' },
    { label: '7', val: '7', className: 'calc-btn-number' },
    { label: '8', val: '8', className: 'calc-btn-number' },
    { label: '9', val: '9', className: 'calc-btn-number' },
    { label: '×', val: ' × ', className: 'calc-btn-operator' },
    { label: '4', val: '4', className: 'calc-btn-number' },
    { label: '5', val: '5', className: 'calc-btn-number' },
    { label: '6', val: '6', className: 'calc-btn-number' },
    { label: '−', val: ' − ', className: 'calc-btn-operator' },
    { label: '1', val: '1', className: 'calc-btn-number' },
    { label: '2', val: '2', className: 'calc-btn-number' },
    { label: '3', val: '3', className: 'calc-btn-number' },
    { label: '+', val: ' + ', className: 'calc-btn-operator' },
    { label: '0', val: '0', className: 'calc-btn-number col-span-2' },
    { label: '.', val: '.', className: 'calc-btn-number' },
    { label: '=', val: '=', className: 'calc-btn-equals' },
  ];

  const scientificButtons = [
    { label: 'sin', val: 'sin(' },
    { label: 'cos', val: 'cos(' },
    { label: 'tan', val: 'tan(' },
    { label: 'π', val: 'π' },
    { label: 'sin⁻¹', val: 'sin⁻¹(' },
    { label: 'cos⁻¹', val: 'cos⁻¹(' },
    { label: 'tan⁻¹', val: 'tan⁻¹(' },
    { label: 'e', val: 'e' },
    { label: 'sinh', val: 'sinh(' },
    { label: 'cosh', val: 'cosh(' },
    { label: 'tanh', val: 'tanh(' },
    { label: 'i', val: 'i' },
    { label: '√', val: '√(' },
    { label: '∛', val: '∛(' },
    { label: 'xʸ', val: '^' },
    { label: 'n!', val: '!' },
    { label: 'log', val: 'log(' },
    { label: 'ln', val: 'ln(' },
    { label: 'eˣ', val: 'e^' },
    { label: '|x|', val: 'abs(' },
    { label: '(', val: '(' },
    { label: ')', val: ')' },
    { label: 'nCr', val: ' combinations(' },
    { label: 'nPr', val: ' permutations(' },
    { label: '10ˣ', val: '10^' },
    { label: 'x²', val: '²' },
    { label: 'x³', val: '³' },
    { label: '1/x', val: '⁻¹' },
  ];

  return (
    <div className="flex flex-col w-full h-full min-h-0 flex-1">
      {/* Mobile-Only Scientific Keypad Tab Switcher */}
      {isScientificMode && (
        <div className="flex md:hidden items-center justify-center mb-2 shrink-0">
          <div className="inline-flex bg-[#F5F5F5] dark:bg-[#1B1B1B] p-0.5 rounded-xl text-xs font-semibold border border-[#E0E0E0] dark:border-[#2E2825] shadow-inner w-full max-w-[280px]">
            <button
              type="button"
              onClick={() => setMobileTab('basic')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mobileTab === 'basic'
                  ? 'bg-[#5D4037] text-white shadow-xs font-bold'
                  : 'text-[#616161] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white'
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
                  ? 'bg-[#5D4037] text-white shadow-xs font-bold'
                  : 'text-[#616161] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white'
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
      <div className="flex flex-col md:flex-row gap-1.5 sm:gap-2.5 w-full h-full min-h-0 flex-1">
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
                className="calc-btn-function flex items-center justify-center w-full h-full min-h-[36px] sm:min-h-[42px] rounded-xl text-xs sm:text-sm font-medium transition-all select-none touch-manipulation shadow-2xs active:scale-[0.98]"
                aria-label={btn.label}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Standard Numeric & Operator Panel */}
        <div
          className={`grid grid-cols-4 grid-rows-5 gap-1 sm:gap-2 flex-1 w-full h-full min-h-0 ${
            isScientificMode && mobileTab === 'scientific' ? 'hidden md:grid' : 'grid'
          }`}
        >
          {standardButtons.map((btn, idx) => (
            <button
              key={`std-${idx}`}
              type="button"
              onClick={() => handleBtnClick(btn.val)}
              className={`flex items-center justify-center w-full h-full min-h-[40px] sm:min-h-[46px] rounded-xl text-base sm:text-lg lg:text-xl active:scale-[0.98] transition-all select-none touch-manipulation ${
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
