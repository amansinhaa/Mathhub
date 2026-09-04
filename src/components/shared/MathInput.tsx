'use client';

import React, { useState } from 'react';
import { MathDisplay } from './MathDisplay';
import { VirtualMathKeyboard } from './VirtualMathKeyboard';
import { Keyboard as KeyboardIcon, Sparkles } from 'lucide-react';

interface MathInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  showLivePreview?: boolean;
  quickChips?: string[];
  onChipSelect?: (val: string) => void;
}

export function MathInput({
  value,
  onChange,
  placeholder = 'Type an equation or expression...',
  className = '',
  showLivePreview = true,
  quickChips = [],
  onChipSelect,
}: MathInputProps) {
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleInsert = (text: string) => {
    onChange(value + text);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Quick Quick-Action Chips */}
      {quickChips.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[10px] font-mono text-[#757575] dark:text-[#8D827A] flex items-center gap-1 shrink-0">
            <Sparkles size={11} className="text-[#5D4037] dark:text-[#D7CCC8]" />
            Examples:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChipSelect ? onChipSelect(chip) : onChange(chip)}
              className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#F5F5F5] dark:bg-[#181818] text-[#5D4037] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#22201F] transition-all whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Box with Integrated Keyboard Toggle */}
      <div className="relative flex items-center bg-white dark:bg-[#131313] rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] focus-within:ring-2 focus-within:ring-[#5D4037]/30 focus-within:border-[#5D4037] transition-all shadow-xs">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 bg-transparent border-none outline-none font-mono text-sm text-[#131313] dark:text-white placeholder-[#9E9E9E] dark:placeholder-[#8D827A]"
        />

        <button
          type="button"
          onClick={() => setShowKeyboard(!showKeyboard)}
          className={`mr-2 p-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 border ${
            showKeyboard
              ? 'bg-[#5D4037] text-white border-[#795548]'
              : 'bg-[#F5F5F5] text-[#616161] hover:text-[#131313] border-[#E0E0E0] dark:bg-[#1B1B1B] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white'
          }`}
          title="Toggle Math Keyboard"
          aria-label="Toggle Math Keyboard"
        >
          <KeyboardIcon size={14} />
          <span className="hidden sm:inline text-[11px]">Math Keys</span>
        </button>
      </div>

      {/* Live Formatted KaTeX Preview */}
      {showLivePreview && value.trim() && (
        <div className="p-2.5 rounded-xl bg-[#F5F5F5] dark:bg-[#181818] border border-[#E0E0E0] dark:border-[#282422] text-center max-w-full overflow-x-auto shadow-2xs">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#757575] dark:text-[#8D827A] block mb-0.5">
            Live Math Preview
          </span>
          <div className="text-sm py-0.5 text-[#131313] dark:text-white">
            <MathDisplay math={value} />
          </div>
        </div>
      )}

      {/* Virtual On-Screen Math Keyboard */}
      {showKeyboard && (
        <div className="animate-fade-in pt-1">
          <VirtualMathKeyboard
            onInsert={handleInsert}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onClose={() => setShowKeyboard(false)}
          />
        </div>
      )}
    </div>
  );
}
