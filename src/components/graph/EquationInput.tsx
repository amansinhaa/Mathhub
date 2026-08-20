'use client';

import React, { useState } from 'react';
import { useGraphStore } from '@/stores/graphStore';
import { Eye, EyeOff, Trash2, Plus, HelpCircle, X, Info } from 'lucide-react';
import { SYNTAX_HELP } from '@/lib/math/normalizer';
import { isImplicitEquation } from '@/lib/math/implicitPlot';

export default function EquationInput() {
  const { equations, addEquation, updateEquation, removeEquation } = useGraphStore();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Equations to Plot</h3>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
            showHelp
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
              : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
          title="Syntax Guide"
        >
          <HelpCircle size={14} />
          <span>Guide</span>
        </button>
      </div>

      {/* Syntax Guide Panel */}
      {showHelp && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3 text-xs space-y-2 animate-fade-in">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-blue-800 dark:text-blue-200">
              📐 Plot Functions & 2D Implicit Curves
            </span>
            <button onClick={() => setShowHelp(false)} className="text-blue-400 hover:text-blue-600">
              <X size={14} />
            </button>
          </div>

          <div className="space-y-1 text-blue-800 dark:text-blue-200">
            <p className="font-semibold text-[11px]">🔵 1. Explicit Functions $y = f(x)$:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
              <div>• <code className="bg-white dark:bg-gray-800 px-1 rounded">x³ + 3x + 5</code></div>
              <div>• <code className="bg-white dark:bg-gray-800 px-1 rounded">sin(x)</code> or <code className="bg-white dark:bg-gray-800 px-1 rounded">cos(2x)</code></div>
              <div>• <code className="bg-white dark:bg-gray-800 px-1 rounded">sqrt(x)</code> or <code className="bg-white dark:bg-gray-800 px-1 rounded">x^(1/3)</code></div>
              <div>• <code className="bg-white dark:bg-gray-800 px-1 rounded">x² - 4</code></div>
            </div>
          </div>

          <div className="space-y-1 text-blue-800 dark:text-blue-200 pt-1 border-t border-blue-200 dark:border-blue-800/50">
            <p className="font-semibold text-[11px]">🟢 2. Implicit 2D Curves $F(x, y) = 0$:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
              <div>• <strong>Circle:</strong> <code className="bg-white dark:bg-gray-800 px-1 rounded">x² + y² = 25</code></div>
              <div>• <strong>Ellipse:</strong> <code className="bg-white dark:bg-gray-800 px-1 rounded">x²/16 + y²/9 = 1</code></div>
              <div>• <strong>Hyperbola:</strong> <code className="bg-white dark:bg-gray-800 px-1 rounded">x² - y² = 4</code></div>
              <div>• <strong>Parabola:</strong> <code className="bg-white dark:bg-gray-800 px-1 rounded">y² = 4x</code></div>
            </div>
          </div>
        </div>
      )}

      {equations.map((eq) => {
        const isImplicit = isImplicitEquation(eq.expression);
        const needsConstant =
          isImplicit &&
          !eq.expression.includes('=') &&
          /x\s*\^?\s*2?\s*\+\s*y\s*\^?\s*2?/i.test(eq.expression);

        return (
          <div key={eq.id} className="space-y-1">
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-xl border border-[var(--card-border)]">
              {/* Color pill */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 cursor-pointer shadow-sm"
                style={{
                  backgroundColor: eq.visible ? eq.color : 'transparent',
                  border: `2px solid ${eq.color}`,
                }}
                onClick={() => updateEquation(eq.id, undefined, !eq.visible)}
                role="button"
                title="Toggle visibility"
              />

              {/* Equation Input */}
              <div className="flex-grow flex items-center bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-[var(--card-border)]">
                <span className="text-gray-400 dark:text-gray-500 font-mono text-xs mr-1.5 select-none font-semibold">
                  {isImplicit ? '2D:' : 'f(x)='}
                </span>
                <input
                  type="text"
                  value={eq.expression}
                  onChange={(e) => updateEquation(eq.id, e.target.value)}
                  className="bg-transparent border-none outline-none w-full font-mono text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  placeholder="e.g. x² + y² = 25, sin(x), x³ + 3x + 5"
                />
              </div>

              {/* Type Badge */}
              {eq.expression.trim() && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isImplicit
                      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  }`}
                  title={isImplicit ? 'Implicit 2D curve F(x, y) = 0' : 'Explicit function y = f(x)'}
                >
                  {isImplicit ? 'Implicit' : 'f(x)'}
                </span>
              )}

              {/* Visibility toggle button */}
              <button
                onClick={() => updateEquation(eq.id, undefined, !eq.visible)}
                className="text-gray-400 hover:text-blue-500 p-1 transition-colors"
                title={eq.visible ? 'Hide' : 'Show'}
              >
                {eq.visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>

              {/* Delete button */}
              <button
                onClick={() => removeEquation(eq.id)}
                className="text-gray-400 hover:text-red-500 p-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={equations.length === 1}
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Smart tip if user typed x^2 + y^2 without an = value */}
            {needsConstant && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-lg text-[11px] text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-1.5">
                  <Info size={12} className="shrink-0" />
                  <span>Tip: Set circle radius (e.g. <code className="font-bold">x² + y² = 25</code>)</span>
                </div>
                <button
                  onClick={() => updateEquation(eq.id, `${eq.expression.trim()} = 25`)}
                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold"
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
          onClick={addEquation}
          className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 w-fit transition-colors"
        >
          <Plus size={14} />
          <span>Add Equation</span>
        </button>
      )}
    </div>
  );
}
