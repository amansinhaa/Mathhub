'use client';

import React, { useState } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import { Eye, EyeOff, Trash2, Plus, HelpCircle, X, Info, Keyboard as KeyboardIcon } from 'lucide-react';
import { isImplicitEquation } from '@/lib/math/implicitPlot';
import { VirtualMathKeyboard } from '@/components/shared/VirtualMathKeyboard';

export default function EquationInput() {
  const { equations, addEquation, updateEquation, removeEquation } = useGraphStore();
  const [showHelp, setShowHelp] = useState(false);
  // Default virtual keyboard to open on mobile screens (< 768px)
  const [showKeyboard, setShowKeyboard] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [activeEqId, setActiveEqId] = useState<string | null>(null);

  const handleKeyboardInsert = (text: string) => {
    const targetId = activeEqId || equations[0]?.id;
    if (!targetId) return;
    const eq = equations.find((e) => e.id === targetId);
    if (eq) {
      updateEquation(targetId, eq.expression + text);
    }
  };

  const handleKeyboardBackspace = () => {
    const targetId = activeEqId || equations[0]?.id;
    if (!targetId) return;
    const eq = equations.find((e) => e.id === targetId);
    if (eq) {
      updateEquation(targetId, eq.expression.slice(0, -1));
    }
  };

  const handleKeyboardClear = () => {
    const targetId = activeEqId || equations[0]?.id;
    if (!targetId) return;
    updateEquation(targetId, '');
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#131313] dark:text-white text-xs sm:text-sm font-mono uppercase tracking-wider">
          Equations & Relations ({equations.length})
        </h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowKeyboard(!showKeyboard)}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg transition-colors border ${
              showKeyboard
                ? 'bg-[#5D4037] text-white border-[#795548]'
                : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white'
            }`}
            title="Toggle Math Keyboard"
          >
            <KeyboardIcon size={13} />
            <span className="hidden sm:inline">Keyboard</span>
          </button>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg transition-colors border ${
              showHelp
                ? 'bg-[#5D4037] text-white border-[#795548]'
                : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white'
            }`}
            title="Syntax Guide"
          >
            <HelpCircle size={13} />
            <span>Guide</span>
          </button>
        </div>
      </div>

      {/* Syntax Guide Panel */}
      {showHelp && (
        <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#3E2723] rounded-xl p-3 text-xs space-y-2 animate-fade-in shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-[#5D4037] dark:text-[#D7CCC8]">
              Plot Functions & 2D Implicit Curves
            </span>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="text-[#757575] hover:text-[#131313] dark:text-[#8D827A] dark:hover:text-white"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1 text-[#616161] dark:text-[#A19891]">
            <p className="font-semibold text-[11px] text-[#5D4037] dark:text-[#D7CCC8]">1. Explicit Functions y = f(x):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
              <div>• <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825]">x³ + 3x + 5</code></div>
              <div>• <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825]">sin(x)</code> or <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825]">cos(2x)</code></div>
              <div>• <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825]">sqrt(x)</code> or <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825]">x^(1/3)</code></div>
              <div>• <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825]">x² - 4</code></div>
            </div>
          </div>

          <div className="space-y-1 text-[#616161] dark:text-[#A19891] pt-1 border-t border-[#E0E0E0] dark:border-[#2E2825]">
            <p className="font-semibold text-[11px] text-[#5D4037] dark:text-[#D7CCC8]">2. Implicit 2D Curves F(x, y) = 0:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
              <div>• Circle: <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825]">x² + y² = 25</code></div>
              <div>• Ellipse: <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825]">x²/16 + y²/9 = 1</code></div>
              <div>• Hyperbola: <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825]">x² - y² = 4</code></div>
              <div>• Parabola: <code className="bg-white dark:bg-[#1B1B1B] px-1 rounded text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825]">y² = 4x</code></div>
            </div>
          </div>
        </div>
      )}

      {equations.map((eq, idx) => {
        const isImplicit = isImplicitEquation(eq.expression);
        const needsConstant =
          isImplicit &&
          !eq.expression.includes('=') &&
          /x\s*\^?\s*2?\s*\+\s*y\s*\^?\s*2?/i.test(eq.expression);

        return (
          <div key={eq.id} className="space-y-1">
            <div className={`flex items-center space-x-2 p-1.5 sm:p-2 rounded-xl border transition-all ${
              activeEqId === eq.id
                ? 'bg-white dark:bg-[#1B1B1B] border-[#5D4037] dark:border-[#8D6E63] shadow-xs'
                : 'bg-[#F5F5F5] dark:bg-[#131313] border-[#E0E0E0] dark:border-[#2E2825]'
            }`}>
              {/* Desmos-style row number & color pill */}
              <div className="flex items-center gap-1.5 pl-1 shrink-0">
                <span className="text-[11px] font-mono font-bold text-[#757575] dark:text-[#8D827A] w-3.5 text-center">
                  {idx + 1}
                </span>
                <div
                  className="w-4 h-4 rounded-full shrink-0 cursor-pointer shadow-xs transition-transform active:scale-90"
                  style={{
                    backgroundColor: eq.visible ? eq.color : 'transparent',
                    border: `2px solid ${eq.color}`,
                  }}
                  onClick={() => updateEquation(eq.id, undefined, !eq.visible)}
                  role="button"
                  title="Toggle visibility"
                />
              </div>

              {/* Dynamic Relation / Graph Type Badge */}
              <div className="flex-1 flex items-center bg-white dark:bg-[#1B1B1B] px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-[#332D2A] focus-within:ring-2 focus-within:ring-[#5D4037]/30 focus-within:border-[#5D4037]">
                <input
                  type="text"
                  value={eq.expression}
                  onFocus={() => setActiveEqId(eq.id)}
                  onChange={(e) => updateEquation(eq.id, e.target.value)}
                  className="bg-transparent border-none outline-none w-full font-mono text-xs sm:text-sm text-[#131313] dark:text-white placeholder-[#9E9E9E] dark:placeholder-[#8D827A]"
                  placeholder="e.g. y = 2x + 1,  x² + y² = 25,  or  x³ - 3x"
                />
              </div>

              {/* Dynamic Type Badge */}
              {eq.expression.trim() && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${
                    isImplicit
                      ? 'bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] dark:border-[#5D4037]/50'
                      : 'bg-white text-[#757575] border border-[#E0E0E0] dark:bg-[#24201E] dark:text-[#BCAAA4] dark:border-[#3E2723]'
                  }`}
                  title={isImplicit ? 'Implicit 2D curve or relation F(x, y) = 0' : 'Explicit function y = f(x)'}
                >
                  {isImplicit ? 'Curve 2D' : 'Function y'}
                </span>
              )}

              {/* Visibility toggle button */}
              <button
                type="button"
                onClick={() => updateEquation(eq.id, undefined, !eq.visible)}
                className="text-[#757575] hover:text-[#131313] dark:text-[#8D827A] dark:hover:text-white p-1 transition-colors"
                title={eq.visible ? 'Hide' : 'Show'}
              >
                {eq.visible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => removeEquation(eq.id)}
                className="text-[#757575] hover:text-red-500 dark:text-[#8D827A] dark:hover:text-[#FFAB91] p-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={equations.length === 1}
                title="Remove"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Smart tip if user typed x^2 + y^2 without an = value */}
            {needsConstant && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#EFEBE9] dark:bg-[#1B1B1B] border border-[#D7CCC8] dark:border-[#5D4037]/50 rounded-lg text-[11px] text-[#5D4037] dark:text-[#D7CCC8]">
                <div className="flex items-center gap-1.5">
                  <Info size={12} className="shrink-0" />
                  <span>Tip: Set circle radius (e.g. <code className="font-bold">x² + y² = 25</code>)</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateEquation(eq.id, `${eq.expression.trim()} = 25`)}
                  className="px-2 py-0.5 bg-[#5D4037] hover:bg-[#6D4C41] text-white rounded text-[10px] font-bold"
                >
                  Set = 25
                </button>
              </div>
            )}
          </div>
        );
      })}

      {equations.length < 8 && (
        <button
          type="button"
          onClick={addEquation}
          className="mt-1 text-xs font-mono font-semibold text-[#5D4037] hover:text-white bg-[#F5F5F5] hover:bg-[#5D4037] dark:bg-[#131313] dark:hover:bg-[#262220] dark:text-[#D7CCC8] dark:hover:text-white border border-[#E0E0E0] dark:border-[#2E2825] flex items-center gap-1 py-1.5 px-3 rounded-xl w-fit transition-all active:scale-95 shadow-2xs"
        >
          <Plus size={13} />
          <span>Add Function</span>
        </button>
      )}

      {/* Built-in Virtual Math Keyboard Dock (Desmos style beneath equation rows) */}
      {showKeyboard && (
        <div className="animate-fade-in pt-2">
          <VirtualMathKeyboard
            onInsert={handleKeyboardInsert}
            onBackspace={handleKeyboardBackspace}
            onClear={handleKeyboardClear}
            onClose={() => setShowKeyboard(false)}
          />
        </div>
      )}
    </div>
  );
}
