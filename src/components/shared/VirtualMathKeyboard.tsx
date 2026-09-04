'use client';

import React, { useState } from 'react';
import { Delete, X } from 'lucide-react';

interface VirtualMathKeyboardProps {
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onClose?: () => void;
  className?: string;
}

export function VirtualMathKeyboard({
  onInsert,
  onBackspace,
  onClear,
  onClose,
  className = '',
}: VirtualMathKeyboardProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'algebra' | 'calculus'>('basic');

  const basicKeys = [
    { label: '7', val: '7' },
    { label: '8', val: '8' },
    { label: '9', val: '9' },
    { label: '÷', val: '/' },
    { label: 'x', val: 'x', highlight: true },
    { label: '4', val: '4' },
    { label: '5', val: '5' },
    { label: '6', val: '6' },
    { label: '×', val: '*' },
    { label: 'y', val: 'y', highlight: true },
    { label: '1', val: '1' },
    { label: '2', val: '2' },
    { label: '3', val: '3' },
    { label: '−', val: '-' },
    { label: 't', val: 't', highlight: true },
    { label: '0', val: '0' },
    { label: '.', val: '.' },
    { label: '=', val: '=' },
    { label: '+', val: '+' },
    { label: 'π', val: 'pi' },
  ];

  const algebraTemplates = [
    { label: 'x²', val: '^2', desc: 'Squared' },
    { label: 'x³', val: '^3', desc: 'Cubed' },
    { label: 'xⁿ', val: '^', desc: 'Power' },
    { label: 'a/b', val: '/', desc: 'Fraction' },
    { label: '√x', val: 'sqrt(', desc: 'Square Root' },
    { label: '∛x', val: 'cbrt(', desc: 'Cube Root' },
    { label: '( )', val: '()', desc: 'Parentheses' },
    { label: '|x|', val: 'abs(', desc: 'Absolute Value' },
    { label: '<', val: ' < ' },
    { label: '>', val: ' > ' },
    { label: '≤', val: ' <= ' },
    { label: '≥', val: ' >= ' },
    { label: 'e', val: 'e' },
    { label: 'log', val: 'log10(' },
    { label: 'ln', val: 'log(' },
    { label: 'eˣ', val: 'exp(' },
  ];

  const calculusTemplates = [
    { label: 'd/dx', val: '', action: 'derivative', desc: 'Derivative' },
    { label: '∫ dx', val: '', action: 'integral', desc: 'Integral' },
    { label: 'sin', val: 'sin(' },
    { label: 'cos', val: 'cos(' },
    { label: 'tan', val: 'tan(' },
    { label: 'asin', val: 'asin(' },
    { label: 'acos', val: 'acos(' },
    { label: 'atan', val: 'atan(' },
    { label: 'sec', val: 'sec(' },
    { label: 'csc', val: 'csc(' },
    { label: 'cot', val: 'cot(' },
    { label: 'x', val: 'x' },
    { label: 'dx', val: ' dx' },
    { label: 'dt', val: ' dt' },
  ];

  return (
    <div
      className={`bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#332D2A] rounded-2xl p-2.5 shadow-lg select-none ${className}`}
    >
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E0E0E0] dark:border-[#282422] gap-2">
        <div className="flex items-center gap-1 bg-[#F5F5F5] dark:bg-[#131313] p-1 rounded-xl border border-[#E0E0E0] dark:border-[#282422]">
          {(['basic', 'algebra', 'calculus'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                activeTab === tab
                  ? 'bg-[#5D4037] text-white shadow-xs'
                  : 'text-[#616161] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onBackspace}
            className="p-1.5 rounded-lg text-[#616161] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#282422] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E]"
            title="Backspace"
            aria-label="Backspace"
          >
            <Delete size={15} />
          </button>
          <button
            type="button"
            onClick={onClear}
            className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-red-600 dark:text-[#FFAB91] bg-red-50 dark:bg-[#3E2723]/60 border border-red-200 dark:border-[#5D4037]/60"
            title="Clear All"
          >
            CLEAR
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#757575] hover:text-[#131313] dark:text-[#8D827A] dark:hover:text-white"
              title="Close Keyboard"
              aria-label="Close Keyboard"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Keys Layout */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-5 gap-1.5">
          {basicKeys.map((k, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsert(k.val)}
              className={`h-9 rounded-xl text-sm font-mono font-semibold transition-all active:scale-95 flex items-center justify-center border shadow-2xs ${
                k.highlight
                  ? 'bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] dark:border-[#5D4037] font-bold'
                  : 'bg-white dark:bg-[#181818] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#F5F5F5] dark:hover:bg-[#22201F]'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'algebra' && (
        <div className="grid grid-cols-4 gap-1.5">
          {algebraTemplates.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsert(t.val)}
              className="h-9 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all active:scale-95 flex items-center justify-center border shadow-2xs bg-white dark:bg-[#181818] text-[#5D4037] dark:text-[#D7CCC8] border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E]"
              title={t.desc}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'calculus' && (
        <div className="grid grid-cols-4 gap-1.5">
          {calculusTemplates.map((c, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsert(c.val)}
              className="h-9 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all active:scale-95 flex items-center justify-center border shadow-2xs bg-white dark:bg-[#181818] text-[#5D4037] dark:text-[#D7CCC8] border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E]"
              title={c.desc}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
