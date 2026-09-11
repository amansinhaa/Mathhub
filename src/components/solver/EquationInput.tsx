'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from '@/components/shared/RouterShim';
import { useSolverStore } from '@/stores/solverStore';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { HelpCircle, X, AlertCircle, Keyboard as KeyboardIcon, Plus, Trash2 } from 'lucide-react';
import { SYNTAX_HELP, quickDegreeDetect, expressionToLatex, cleanPastedMath } from '@/lib/math/normalizer';
import { VirtualMathKeyboard } from '@/components/shared/VirtualMathKeyboard';
import { SolverType } from '@/types/solver';

// ─── Action mode pill config ──────────────────────────────────────────────────
const ACTIONS: { value: SolverType; emoji: string; label: string; hint: string }[] = [
  { value: 'polynomial', emoji: '=',  label: 'Solve',      hint: 'Find x, roots & answers' },
  { value: 'derivative', emoji: 'd⁄dx', label: 'Differentiate', hint: 'Step-by-step derivative' },
  { value: 'integral',   emoji: '∫',  label: 'Integrate',  hint: 'Indefinite integral + C' },
  { value: 'system',     emoji: '{ }', label: 'System',     hint: '2+ equations together' },
  { value: 'inequality', emoji: '>',  label: 'Inequality', hint: 'Range on number line' },
  { value: 'symbolic',   emoji: 'a=', label: 'Rearrange',  hint: 'Solve for any variable' },
];

export default function EquationInput() {
  const {
    equation,
    setEquation,
    solverType,
    setSolverType,
    quadraticMethod,
    setQuadraticMethod,
    solveForVariable,
    setSolveForVariable,
    solve,
    isLoading,
    error,
    // system equations
    systemEquations,
    updateSystemEquation,
    addSystemEquation,
    removeSystemEquation,
    systemVariables,
    setSystemVariables,
  } = useSolverStore();

  const searchParams = useSearchParams();
  const searchStr = searchParams.toString();
  const prevSearchRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (prevSearchRef.current === searchStr) return;
    prevSearchRef.current = searchStr;

    const store = useSolverStore.getState();
    const tab = searchParams.get('tab');
    if (tab && ['polynomial', 'derivative', 'integral', 'system', 'inequality', 'symbolic'].includes(tab)) {
      if (store.solverType !== tab) {
        store.setSolverType(tab as SolverType);
      }
    }
    const formula = searchParams.get('formula') || searchParams.get('eq');
    const method = searchParams.get('method');
    if (method && ['auto', 'factoring', 'completing_square', 'formula'].includes(method)) {
      if (store.quadraticMethod !== method) {
        store.setQuadraticMethod(method as any);
      }
    }
    if (formula && store.equation !== formula) {
      store.setEquation(formula);
      setTimeout(() => {
        useSolverStore.getState().solve();
      }, 50);
    }
  }, [searchStr]);

  const [showHelp, setShowHelp] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const degreeInfo = quickDegreeDetect(equation);
  const isDegreeTwo = degreeInfo?.degree === 2;
  const isSystem = solverType === 'system';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSystem ? systemEquations.every(eq => eq.trim()) : equation.trim()) {
      solve();
    }
  };

  const handleKeyboardInsert = (text: string) => setEquation(equation + text);
  const handleKeyboardBackspace = () => setEquation(equation.slice(0, -1));
  const handleKeyboardClear = () => setEquation('');

  const handleVarsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSystemVariables(e.target.value.split(',').map(v => v.trim()).filter(Boolean));
  };

  const placeholders: Record<SolverType, string> = {
    polynomial: 'e.g. 2x + 8 = 20  or  x² - 5x + 6 = 0',
    derivative:  'e.g. 3x² + 5x - 4  or  sin(x)',
    integral:    'e.g. 2x + 3  or  x² - 4',
    inequality:  'e.g. 2x - 3 > 0  or  x² ≤ 9',
    symbolic:    'e.g. v = u + a*t',
    system:      '',
    ode:         'e.g. y\'\' + 4y = 0',
  };

  const exampleChips: Partial<Record<SolverType, string[]>> = {
    polynomial: ['2x + 8 = 20', 'x² - 5x + 6 = 0', '72t³ + 4t - 76 = 0'],
    derivative:  ['3x² + 5x - 4', 'sin(x)', 'x³ - 7x'],
    integral:    ['2x + 3', 'x² - 4x + 5', 'cos(x)'],
    inequality:  ['2x - 3 > 5', 'x² - 4 <= 0'],
    symbolic:    ['v = u + a*t', 'E = m*c^2'],
  };

  const currentAction = ACTIONS.find(a => a.value === solverType);

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3.5">

      {/* ── Single equation input (hidden for System) ───────────────────── */}
      {!isSystem && (
        <div className="space-y-2">
          {/* Label row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="equation" className="text-xs font-mono font-bold uppercase tracking-wider text-[#131313] dark:text-white">
                Enter Equation / Expression
              </label>
              {degreeInfo && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EFEBE9] text-[#5D4037] border border-[#D7CCC8] dark:bg-[#3E2723] dark:text-[#D7CCC8] animate-fade-in">
                  {degreeInfo.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowKeyboard(!showKeyboard)}
                title="Math Keyboard"
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-colors ${
                  showKeyboard
                    ? 'bg-[#5D4037] text-white border-[#795548]'
                    : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white'
                }`}
              >
                <KeyboardIcon size={13} />
                <span className="hidden sm:inline">Keyboard</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                title="Syntax Guide"
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border transition-colors ${
                  showHelp
                    ? 'bg-[#5D4037] text-white border-[#795548]'
                    : 'bg-[#F5F5F5] text-[#616161] border-[#E0E0E0] hover:text-[#131313] dark:bg-[#131313] dark:text-[#A19891] dark:border-[#2E2825] dark:hover:text-white'
                }`}
              >
                <HelpCircle size={13} />
                <span>Syntax</span>
              </button>
            </div>
          </div>

          {/* Example chips */}
          {(exampleChips[solverType]?.length ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[10px] font-mono text-[#757575] dark:text-[#8D827A] shrink-0">Try:</span>
              {exampleChips[solverType]!.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setEquation(chip); setTimeout(() => useSolverStore.getState().solve(), 50); }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-[#F5F5F5] dark:bg-[#181818] text-[#5D4037] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#2E2825] hover:bg-[#EFEBE9] dark:hover:bg-[#22201F] transition-all whitespace-nowrap"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Syntax help panel */}
          {showHelp && (
            <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#3E2723] rounded-xl p-3 text-xs space-y-1.5 animate-fade-in shadow-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#5D4037] dark:text-[#D7CCC8]">Input Syntax Guide</span>
                <button type="button" onClick={() => setShowHelp(false)} className="p-1 text-[#616161] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white rounded">
                  <X size={14} />
                </button>
              </div>
              <p className="text-[#616161] dark:text-[#A19891] mb-2 leading-relaxed text-[11px]">
                Use <strong>Unicode superscripts</strong> (x², x³) or <strong>caret notation</strong> (x^2, x^3). Both work!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                {SYNTAX_HELP.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-white/70 dark:bg-[#181818] border border-[#E0E0E0]/60 dark:border-[#282422]">
                    <code className="bg-white dark:bg-[#1B1B1B] px-1.5 py-0.5 rounded text-[#5D4037] dark:text-[#D7CCC8] font-mono text-[11px] border border-[#E0E0E0] dark:border-[#2E2825]">{item.input}</code>
                    <span className="text-[#757575] dark:text-[#8D827A] text-[11px]">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main input */}
          <input
            id="equation"
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text/plain') || e.clipboardData.getData('text/html');
              if (pasted) {
                e.preventDefault();
                const cleaned = cleanPastedMath(pasted);
                const inputEl = e.currentTarget;
                const start = inputEl.selectionStart ?? equation.length;
                const end = inputEl.selectionEnd ?? equation.length;
                const nextVal = equation.slice(0, start) + cleaned + equation.slice(end);
                setEquation(nextVal);
                setTimeout(() => {
                  const newPos = start + cleaned.length;
                  inputEl.setSelectionRange(newPos, newPos);
                }, 0);
              }
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] outline-none transition-all font-mono text-sm shadow-xs"
            placeholder={placeholders[solverType]}
          />

          {/* Virtual keyboard (displays after the entry field) */}
          {showKeyboard && (
            <div className="animate-fade-in pt-1">
              <VirtualMathKeyboard
                onInsert={handleKeyboardInsert}
                onBackspace={handleKeyboardBackspace}
                onClear={handleKeyboardClear}
                onClose={() => setShowKeyboard(false)}
              />
            </div>
          )}

          {/* Quadratic method selector */}
          {solverType === 'polynomial' && isDegreeTwo && (
            <div className="pt-2 border-t border-[#E0E0E0] dark:border-[#282422] animate-fade-in">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#757575] dark:text-[#8D827A]">Quadratic Method:</span>
                <span className="text-[10px] font-mono text-[#5D4037] dark:text-[#D7CCC8]">
                  {quadraticMethod === 'auto' ? 'Auto' : quadraticMethod === 'factoring' ? 'Factoring' : quadraticMethod === 'completing_square' ? 'Completing the Square' : 'Quadratic Formula'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {([
                  { id: 'auto', label: 'Auto' },
                  { id: 'factoring', label: 'Factor' },
                  { id: 'completing_square', label: 'Square' },
                  { id: 'formula', label: 'Formula' },
                ] as const).map((m) => (
                  <button
                    key={m.id} type="button" onClick={() => setQuadraticMethod(m.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                      quadraticMethod === m.id
                        ? 'bg-[#5D4037] text-white border-[#795548]'
                        : 'bg-[#F5F5F5] dark:bg-[#181818] text-[#616161] dark:text-[#A19891] border-[#E0E0E0] dark:border-[#282422] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E]'
                    }`}
                  >{m.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* Rearrange: solve-for variable input */}
          {solverType === 'symbolic' && (
            <div>
              <label htmlFor="solveFor" className="block text-xs font-mono font-medium text-[#5D4037] dark:text-[#D7CCC8] mb-1">
                Solve for Variable
              </label>
              <input
                id="solveFor" type="text" value={solveForVariable}
                onChange={(e) => setSolveForVariable(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-1.5 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] outline-none transition-all font-mono text-xs"
                placeholder="e.g. a"
              />
            </div>
          )}

          {/* Question preview */}
          {equation && (
            <div className="p-3 rounded-xl bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#2E2825] text-center">
              <span className="text-[10px] font-mono font-semibold text-[#757575] dark:text-[#8D827A] block mb-1">Question Preview</span>
              <div className="text-sm sm:text-base overflow-x-auto py-1 text-[#131313] dark:text-white">
                <MathDisplay math={expressionToLatex(equation)} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── System of Equations (multi-input) ───────────────────────────── */}
      {isSystem && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#131313] dark:text-white">
              System of Equations
            </label>
            <span className="text-[10px] font-mono text-[#757575] dark:text-[#8D827A]">
              {systemEquations.length} of 4 equations
            </span>
          </div>
          {systemEquations.map((eq, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <span className="text-[11px] font-mono text-[#5D4037] dark:text-[#A1887F] w-4 shrink-0 text-right">{idx + 1}.</span>
              <input
                type="text"
                value={eq}
                onChange={(e) => updateSystemEquation(idx, e.target.value)}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text/plain') || e.clipboardData.getData('text/html');
                  if (pasted) {
                    e.preventDefault();
                    const cleaned = cleanPastedMath(pasted);
                    const inputEl = e.currentTarget;
                    const start = inputEl.selectionStart ?? eq.length;
                    const end = inputEl.selectionEnd ?? eq.length;
                    const nextVal = eq.slice(0, start) + cleaned + eq.slice(end);
                    updateSystemEquation(idx, nextVal);
                    setTimeout(() => {
                      const newPos = start + cleaned.length;
                      inputEl.setSelectionRange(newPos, newPos);
                    }, 0);
                  }
                }}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] outline-none transition-all font-mono text-sm shadow-xs"
                placeholder={`Equation ${idx + 1}  e.g. 2x + y = 5`}
                required
              />
              {systemEquations.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeSystemEquation(idx)}
                  className="p-2 rounded-xl border border-red-200 dark:border-[#5D4037]/50 text-red-500 dark:text-[#FFAB91] bg-red-50 dark:bg-[#3E2723]/40 hover:bg-red-100 dark:hover:bg-[#3E2723]/80 transition-colors shrink-0"
                  aria-label="Remove equation"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}

          {/* Add Equation button */}
          {systemEquations.length < 4 && (
            <button
              type="button"
              onClick={addSystemEquation}
              className="w-full py-2.5 border-2 border-dashed border-[#BCAAA4] dark:border-[#3E2723] rounded-xl text-[#5D4037] dark:text-[#A1887F] hover:border-[#5D4037] hover:bg-[#EFEBE9] dark:hover:bg-[#22201F] dark:hover:text-white transition-colors flex items-center justify-center gap-2 text-xs font-mono font-semibold"
            >
              <Plus size={15} />
              Add Equation
            </button>
          )}

          {/* Variables */}
          <div>
            <label htmlFor="variables" className="block text-[11px] font-mono font-medium text-[#5D4037] dark:text-[#D7CCC8] mb-1">
              Variables (comma separated, e.g. x, y)
            </label>
            <input
              id="variables"
              type="text"
              value={systemVariables.join(', ')}
              onChange={handleVarsChange}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] outline-none transition-all font-mono text-xs"
              placeholder="x, y, z"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-[#3E2723]/60 border border-red-200 dark:border-[#5D4037]/60 flex items-start gap-2.5 text-xs text-red-600 dark:text-[#FFAB91] font-mono">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p className="leading-snug">{error}</p>
        </div>
      )}

      {/* ── Mode Action Pills ─────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#757575] dark:text-[#8D827A]">
          What do you want to do?
        </span>
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
          {ACTIONS.map(({ value, emoji, label, hint }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSolverType(value)}
              title={hint}
              className={`flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 sm:py-2 rounded-xl border text-xs font-semibold transition-all ${
                solverType === value
                  ? 'bg-[#5D4037] text-white border-[#795548] shadow-sm scale-[1.02]'
                  : 'bg-[#F5F5F5] dark:bg-[#181818] text-[#616161] dark:text-[#A19891] border-[#E0E0E0] dark:border-[#282422] hover:bg-[#EFEBE9] dark:hover:bg-[#22201F] hover:text-[#5D4037] dark:hover:text-white'
              }`}
            >
              <span className="text-sm sm:text-base leading-none font-mono">{emoji}</span>
              <span className="text-[10px] leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Primary CTA ───────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isLoading || (isSystem ? systemEquations.some(eq => !eq.trim()) : !equation.trim())}
        className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-[#5D4037] hover:bg-[#6D4C41] active:bg-[#4E342E] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] sm:min-h-[44px] flex items-center justify-center gap-2 border border-[#795548]/50"
      >
        {isLoading ? (
          'Calculating Solution…'
        ) : (
          <>
            <span>{currentAction ? `${currentAction.emoji} ${currentAction.label}` : 'Solve Equation'}</span>
            <span className="text-xs font-normal opacity-85 hidden sm:inline">— See Answer & Steps ↓</span>
          </>
        )}
      </button>
    </form>
  );
}
