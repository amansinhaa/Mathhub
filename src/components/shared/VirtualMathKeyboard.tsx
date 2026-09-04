'use client';

import React, { useState } from 'react';
import { Delete, ChevronDown, X } from 'lucide-react';

interface VirtualMathKeyboardProps {
  onInsert: (text: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onClose?: () => void;
  className?: string;
}

type KeyboardTab = '123' | 'fx' | 'calc' | 'abc';

interface KeyConfig {
  label: string;
  val?: string;
  isBackspace?: boolean;
  highlight?: boolean;
  accent?: boolean;
  title?: string;
}

export function VirtualMathKeyboard({
  onInsert,
  onBackspace,
  onClear,
  onClose,
  className = '',
}: VirtualMathKeyboardProps) {
  const [activeTab, setActiveTab] = useState<KeyboardTab>('123');

  // Helper to prevent input blur and mobile OS keyboard pop-up when tapping keys
  const handleKeyInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent browser from transferring focus away or triggering the phone's software keyboard
    e.preventDefault();
  };

  // ── Tab 1: 123 (Core Numbers, Operators & Variables) ──
  const keys123: KeyConfig[] = [
    // Row 1: Variables & Powers
    { label: 'x', val: 'x', highlight: true },
    { label: 'y', val: 'y', highlight: true },
    { label: 'x²', val: '²', accent: true, title: 'Squared' },
    { label: 'aᵇ', val: '^', accent: true, title: 'Exponent / Power' },
    { label: '√', val: '√(', accent: true, title: 'Square root' },

    // Row 2: 7 8 9 ( )
    { label: '7', val: '7' },
    { label: '8', val: '8' },
    { label: '9', val: '9' },
    { label: '(', val: '(', accent: true },
    { label: ')', val: ')', accent: true },

    // Row 3: 4 5 6 × ÷
    { label: '4', val: '4' },
    { label: '5', val: '5' },
    { label: '6', val: '6' },
    { label: '×', val: ' × ', accent: true },
    { label: '÷', val: ' ÷ ', accent: true },

    // Row 4: 1 2 3 + −
    { label: '1', val: '1' },
    { label: '2', val: '2' },
    { label: '3', val: '3' },
    { label: '+', val: ' + ', accent: true },
    { label: '−', val: ' − ', accent: true },

    // Row 5: 0 . = π ⌫
    { label: '0', val: '0' },
    { label: '.', val: '.' },
    { label: '=', val: '=' },
    { label: 'π', val: 'π', highlight: true, title: 'Pi constant' },
    { label: '⌫', isBackspace: true, title: 'Backspace' },
  ];

  // ── Tab 2: f(x) (Trigonometry & Functions) ──
  const keysFx: KeyConfig[] = [
    // Row 1
    { label: 'sin', val: 'sin(' },
    { label: 'cos', val: 'cos(' },
    { label: 'tan', val: 'tan(' },
    { label: 'ln', val: 'ln(', title: 'Natural log' },
    { label: 'log', val: 'log(', title: 'Base-10 log' },

    // Row 2
    { label: 'sin⁻¹', val: 'sin⁻¹(' },
    { label: 'cos⁻¹', val: 'cos⁻¹(' },
    { label: 'tan⁻¹', val: 'tan⁻¹(' },
    { label: 'e', val: 'e', highlight: true },
    { label: 'eˣ', val: 'e^', title: 'e^x' },

    // Row 3
    { label: 'sec', val: 'sec(' },
    { label: 'csc', val: 'csc(' },
    { label: 'cot', val: 'cot(' },
    { label: '|x|', val: 'abs(', title: 'Absolute value' },
    { label: '∛', val: '∛(', title: 'Cube root' },

    // Row 4
    { label: 'sinh', val: 'sinh(' },
    { label: 'cosh', val: 'cosh(' },
    { label: 'tanh', val: 'tanh(' },
    { label: '1/x', val: '⁻¹', title: 'Reciprocal' },
    { label: 'n!', val: '!', title: 'Factorial' },

    // Row 5
    { label: '( )', val: '()' },
    { label: 'x', val: 'x', highlight: true },
    { label: 'y', val: 'y', highlight: true },
    { label: 'π', val: 'π', highlight: true },
    { label: '⌫', isBackspace: true, title: 'Backspace' },
  ];

  // ── Tab 3: Calc (Calculus, Relations & Limits) ──
  const keysCalc: KeyConfig[] = [
    // Row 1
    { label: 'd/dx', val: 'd/dx(', accent: true, title: 'Derivative' },
    { label: '∫', val: '∫ ', accent: true, title: 'Integral' },
    { label: 'lim', val: 'lim(', accent: true, title: 'Limit' },
    { label: 'Σ', val: 'sum(', accent: true, title: 'Summation' },
    { label: '∞', val: '∞', title: 'Infinity' },

    // Row 2
    { label: '<', val: ' < ' },
    { label: '>', val: ' > ' },
    { label: '≤', val: ' <= ' },
    { label: '≥', val: ' >= ' },
    { label: '≠', val: ' != ' },

    // Row 3
    { label: 'dx', val: ' dx' },
    { label: 'dy', val: ' dy' },
    { label: 'dt', val: ' dt' },
    { label: 'θ', val: 'θ', highlight: true },
    { label: '|x|', val: 'abs(' },

    // Row 4
    { label: 'x', val: 'x', highlight: true },
    { label: 'y', val: 'y', highlight: true },
    { label: 't', val: 't', highlight: true },
    { label: 'r', val: 'r', highlight: true },
    { label: 'k', val: 'k', highlight: true },

    // Row 5
    { label: '+', val: ' + ', accent: true },
    { label: '−', val: ' − ', accent: true },
    { label: '=', val: '=' },
    { label: '0', val: '0' },
    { label: '⌫', isBackspace: true, title: 'Backspace' },
  ];

  // ── Tab 4: αβγ (Greek Alphabet & Variables) ──
  const keysAbc: KeyConfig[] = [
    // Row 1
    { label: 'θ', val: 'θ', highlight: true },
    { label: 'α', val: 'α', highlight: true },
    { label: 'β', val: 'β', highlight: true },
    { label: 'γ', val: 'γ', highlight: true },
    { label: 'λ', val: 'λ', highlight: true },

    // Row 2
    { label: 'μ', val: 'μ', highlight: true },
    { label: 'π', val: 'π', highlight: true },
    { label: 'σ', val: 'σ', highlight: true },
    { label: 'ω', val: 'ω', highlight: true },
    { label: 'φ', val: 'φ', highlight: true },

    // Row 3
    { label: 'Δ', val: 'Δ', highlight: true },
    { label: 'a', val: 'a' },
    { label: 'b', val: 'b' },
    { label: 'c', val: 'c' },
    { label: 'k', val: 'k' },

    // Row 4
    { label: 'm', val: 'm' },
    { label: 'n', val: 'n' },
    { label: 'r', val: 'r' },
    { label: 't', val: 't' },
    { label: 'z', val: 'z' },

    // Row 5
    { label: 'x', val: 'x', highlight: true },
    { label: 'y', val: 'y', highlight: true },
    { label: '(', val: '(' },
    { label: ')', val: ')' },
    { label: '⌫', isBackspace: true, title: 'Backspace' },
  ];

  const currentKeys =
    activeTab === '123'
      ? keys123
      : activeTab === 'fx'
      ? keysFx
      : activeTab === 'calc'
      ? keysCalc
      : keysAbc;

  return (
    <div
      className={`bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#332D2A] rounded-2xl p-2.5 shadow-md select-none transition-all ${className}`}
    >
      {/* Top Header & Category Tabs */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E0E0E0] dark:border-[#282422] gap-1.5">
        {/* Category Pills (Concept 1: 123, f(x), calc, αβγ) */}
        <div className="flex items-center gap-1 bg-[#F5F5F5] dark:bg-[#131313] p-0.5 sm:p-1 rounded-xl border border-[#E0E0E0] dark:border-[#282422] overflow-x-auto scrollbar-none">
          {(
            [
              { id: '123', label: '1 2 3' },
              { id: 'fx', label: 'f(x)' },
              { id: 'calc', label: 'Calc ∫' },
              { id: 'abc', label: 'αβγ' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onMouseDown={handleKeyInteraction}
              onTouchStart={handleKeyInteraction}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#5D4037] text-white shadow-xs'
                  : 'text-[#616161] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Controls: Clear, Backspace & Hide */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onMouseDown={handleKeyInteraction}
            onTouchStart={handleKeyInteraction}
            onClick={onClear}
            className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-red-600 dark:text-[#FFAB91] bg-red-50 dark:bg-[#3E2723]/60 border border-red-200 dark:border-[#5D4037]/60 hover:bg-red-100 transition-colors"
            title="Clear input"
          >
            CLR
          </button>
          {onClose && (
            <button
              type="button"
              onMouseDown={handleKeyInteraction}
              onTouchStart={handleKeyInteraction}
              onClick={onClose}
              className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-mono font-medium text-[#757575] hover:text-[#131313] hover:bg-[#EFEBE9] dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#282422] border border-[#E0E0E0] dark:border-[#2E2825] transition-colors"
              title="Hide math keyboard"
              aria-label="Hide math keyboard"
            >
              <ChevronDown size={14} />
              <span className="text-[11px]">Hide</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Column Compact Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {currentKeys.map((k, idx) => {
          if (k.isBackspace) {
            return (
              <button
                key={idx}
                type="button"
                onMouseDown={handleKeyInteraction}
                onTouchStart={handleKeyInteraction}
                onClick={onBackspace}
                className="h-9 sm:h-9.5 rounded-xl text-sm font-mono font-semibold transition-all active:scale-95 flex items-center justify-center border shadow-2xs bg-[#F5F5F5] hover:bg-[#EFEBE9] text-[#616161] hover:text-[#131313] border-[#E0E0E0] dark:bg-[#221F1E] dark:hover:bg-[#2C2724] dark:text-[#A19891] dark:hover:text-white dark:border-[#332D2A]"
                title="Backspace"
                aria-label="Backspace"
              >
                <Delete size={16} />
              </button>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onMouseDown={handleKeyInteraction}
              onTouchStart={handleKeyInteraction}
              onClick={() => k.val && onInsert(k.val)}
              title={k.title || k.label}
              className={`h-9 sm:h-9.5 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all active:scale-95 flex items-center justify-center border shadow-2xs ${
                k.highlight
                  ? 'bg-[#EFEBE9] text-[#5D4037] border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] dark:border-[#5D4037] font-bold'
                  : k.accent
                  ? 'bg-[#FAFAFA] text-[#5D4037] border-[#E0E0E0] hover:bg-[#EFEBE9] dark:bg-[#1E1C1A] dark:text-[#D7CCC8] dark:border-[#332D2A] dark:hover:bg-[#2A2522]'
                  : 'bg-white dark:bg-[#181818] text-[#131313] dark:text-white border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#F5F5F5] dark:hover:bg-[#22201F]'
              }`}
            >
              {k.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
