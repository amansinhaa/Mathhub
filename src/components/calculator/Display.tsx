'use client';

import React, { useState } from 'react';
import { useCalculatorStore } from '@/stores/calculatorStore';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { Check, Copy } from 'lucide-react';

export default function Display() {
  const { expression, resultLatex, result, angleMode, isError, memory } = useCalculatorStore();
  const [copied, setCopied] = useState(false);

  const handleCopyResult = () => {
    const textToCopy = result || resultLatex;
    if (!textToCopy || isError) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex flex-col items-end justify-end p-3 sm:p-4 mb-2 sm:mb-3 bg-white dark:bg-[#1B1B1B] rounded-2xl shadow-xs min-h-[85px] sm:min-h-[110px] max-h-[140px] shrink-0 overflow-hidden border border-[#E0E0E0] dark:border-[#2E2825] transition-colors">
      {/* Angle & Memory Badges */}
      <div className="absolute top-2.5 left-3 sm:top-3.5 sm:left-4 flex items-center gap-2">
        <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#F5F5F5] text-[#5D4037] border border-[#E0E0E0] dark:bg-[#24201E] dark:text-[#D7CCC8] dark:border-[#3E2723]">
          {angleMode}
        </span>
        {memory.hasValue && (
          <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#5D4037] text-white border border-[#795548]/60 shadow-xs">
            M ({memory.value})
          </span>
        )}
      </div>

      {/* Copied Feedback Badge */}
      {copied && (
        <div className="absolute top-2.5 right-3 flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-[#81C784] bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md animate-fade-in">
          <Check size={12} />
          <span>Copied</span>
        </div>
      )}

      {/* Dynamic Expression Line */}
      <div className="w-full overflow-x-auto text-right whitespace-nowrap scrollbar-none text-sm sm:text-lg font-mono text-[#616161] dark:text-[#A19891] min-h-[1.25rem] sm:min-h-[1.5rem]">
        {expression || <span className="opacity-0">0</span>}
      </div>

      {/* Result Display Line with Click-to-Copy */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleCopyResult}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCopyResult();
          }
        }}
        title="Click to copy result"
        className={`w-full overflow-x-auto text-right whitespace-nowrap scrollbar-none text-2xl sm:text-3xl md:text-4xl font-semibold mt-1 min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-end cursor-pointer group select-all ${
          isError ? 'text-red-500 font-medium text-lg sm:text-xl cursor-default' : 'text-[#131313] dark:text-white'
        }`}
      >
        {resultLatex ? (
          <MathDisplay math={resultLatex} block={false} />
        ) : result ? (
          <span className="font-mono">{result}</span>
        ) : (
          <span className="font-mono text-[#131313] dark:text-white">0</span>
        )}
      </div>
    </div>
  );
}
