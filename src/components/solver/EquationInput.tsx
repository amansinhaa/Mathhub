'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from '@/components/shared/RouterShim';
import { useSolverStore } from '@/stores/solverStore';
import { MathDisplay } from '@/components/shared/MathDisplay';
import { HelpCircle, X, AlertCircle, Keyboard as KeyboardIcon, Plus, Trash2, Info, Sparkles, CheckCircle2, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import { SYNTAX_HELP, quickDegreeDetect, expressionToLatex, cleanPastedMath } from '@/lib/math/normalizer';
import { VirtualMathKeyboard } from '@/components/shared/VirtualMathKeyboard';
import { SolverType } from '@/types/solver';
import { analyzeInput, type AutoFix, type SuggestedAction } from '@/lib/math/inputAssistant';

// ─── Operation Configuration & Educational Guidance ─────────────────────────

interface OperationExample {
  text: string;
  tag: string;
  variable?: string;
  systemEqs?: string[];
}

interface OperationGuide {
  title: string;
  badge: string;
  hint: string;
  whatItDoes: string;
  formatShape: string;
  formatRule: string;
  examples: OperationExample[];
}

const ACTIONS: { value: SolverType; emoji: string; label: string; hint: string }[] = [
  { value: 'polynomial',   emoji: '=',    label: 'Solve',        hint: 'Roots' },
  { value: 'domain_range', emoji: '[a,b]', label: 'Domain',       hint: 'Bounds' },
  { value: 'derivative',   emoji: 'd⁄dx', label: 'Derivative',   hint: 'Slope' },
  { value: 'integral',     emoji: '∫',    label: 'Integral',     hint: 'Area' },
  { value: 'system',       emoji: '{ }',  label: 'Systems',      hint: 'Intersect' },
  { value: 'inequality',   emoji: '>',    label: 'Inequalities', hint: 'Ranges' },
  { value: 'symbolic',     emoji: 'a=',   label: 'Rearrange',    hint: 'Isolate' },
];

const OPERATION_GUIDES: Record<SolverType, OperationGuide> = {
  polynomial: {
    title: 'Solve Equation',
    badge: 'Equations',
    hint: 'Find x (= ?)',
    whatItDoes: 'Finds the exact values of the variable (x) that make both sides of the equation equal.',
    formatShape: 'ax + b = c   or   ax² + bx + c = 0',
    formatRule: 'Requires an equals sign (=)',
    examples: [
      { text: '2x + 8 = 20', tag: 'Linear' },
      { text: 'x² - 5x + 6 = 0', tag: 'Quadratic' },
      { text: '72t³ + 4t - 76 = 0', tag: 'Cubic' },
      { text: '2/(x - 1) = 4', tag: 'Fraction' },
    ],
  },
  domain_range: {
    title: 'Domain & Range Finder',
    badge: 'Functions',
    hint: 'Inputs & Outputs',
    whatItDoes: 'Finds all allowed x-inputs (Domain) and resulting y-outputs (Range) in standard interval notation [a, b].',
    formatShape: 'f(x) = expression   or   just the formula',
    formatRule: 'No equals sign needed — enter formula',
    examples: [
      { text: 'sqrt(4 - x^2)', tag: 'Semi-Circle' },
      { text: '1/(x - 3)', tag: 'Rational' },
      { text: 'x^2 - 4x + 3', tag: 'Parabola' },
      { text: 'ln(x - 2)', tag: 'Logarithm' },
      { text: 'sin(x)', tag: 'Trigonometric' },
    ],
  },
  derivative: {
    title: 'Derivative Calculator',
    badge: 'Calculus d/dx',
    hint: 'Rate of Change',
    whatItDoes: 'Calculates the instantaneous rate of change and slope of the curve using differentiation rules.',
    formatShape: 'f(x)   or   formula',
    formatRule: 'Do not type d/dx — just enter the formula',
    examples: [
      { text: '3x^2 + 5x - 4', tag: 'Polynomial' },
      { text: 'sin(x) * cos(x)', tag: 'Product Rule' },
      { text: 'e^(2x)', tag: 'Chain Rule' },
      { text: 'ln(x) / x', tag: 'Quotient Rule' },
    ],
  },
  integral: {
    title: 'Integral Calculator',
    badge: 'Calculus ∫',
    hint: 'Area under Curve',
    whatItDoes: 'Finds the antiderivative formula with constant (+ C) and calculates the area under the curve.',
    formatShape: 'f(x)   or   formula',
    formatRule: 'Do not type ∫ or dx — just enter the formula',
    examples: [
      { text: '2x + 3', tag: 'Linear' },
      { text: 'x^2 - 4x + 5', tag: 'Polynomial' },
      { text: 'cos(x)', tag: 'Trig' },
      { text: '1/x', tag: 'Natural Log' },
    ],
  },
  system: {
    title: 'System of Equations',
    badge: 'Simultaneous Equations',
    hint: '2+ Equations',
    whatItDoes: 'Solves two or more equations simultaneously to find the exact point (x, y) where lines or curves cross.',
    formatShape: 'Equation 1: ax + by = c,   Equation 2: dx + ey = f',
    formatRule: 'Enter each equation in its own box',
    examples: [
      { text: '2x + y = 7, x - y = 2', tag: '2x2 Linear', systemEqs: ['2x + y = 7', 'x - y = 2'] },
      { text: '3x + 2y = 12, x - y = 1', tag: 'Standard', systemEqs: ['3x + 2y = 12', 'x - y = 1'] },
      { text: 'x + y = 10, 2x - y = 5', tag: 'Simple', systemEqs: ['x + y = 10', '2x - y = 5'] },
    ],
  },
  inequality: {
    title: 'Inequality Range Solver',
    badge: 'Intervals & Number Line',
    hint: 'Range (> < ≤ ≥)',
    whatItDoes: 'Solves inequalities for a continuous range of numbers and displays the shaded interval on a number line.',
    formatShape: 'expression  >  c   or   expression  ≤  0',
    formatRule: 'Must include an inequality symbol: >, <, >=, or <=',
    examples: [
      { text: '2x - 3 > 5', tag: 'Linear' },
      { text: 'x^2 - 4 <= 0', tag: 'Quadratic Interval' },
      { text: '-x^2 + 9 > 0', tag: 'Bounded' },
      { text: '3x + 4 >= 10', tag: 'Step Proof' },
    ],
  },
  symbolic: {
    title: 'Rearrange Formula',
    badge: 'Formula Subject Isolator',
    hint: 'Solve for Variable',
    whatItDoes: 'Rearranges any scientific or mathematical formula to make a specific variable the subject (e.g. solve for t).',
    formatShape: 'Formula with multiple letters (e.g. v = u + at)',
    formatRule: 'Type full formula, then choose target letter',
    examples: [
      { text: 'v = u + a*t', tag: 'Velocity (t)', variable: 't' },
      { text: 'E = m * c^2', tag: 'Energy (m)', variable: 'm' },
      { text: 'A = p * (1 + r * t)', tag: 'Interest (r)', variable: 'r' },
      { text: 'F = m * a', tag: 'Force (a)', variable: 'a' },
    ],
  },
  linear: {
    title: 'Linear Equation',
    badge: 'Degree 1',
    hint: 'ax + b = c',
    whatItDoes: 'Finds the single root of a linear equation.',
    formatShape: 'ax + b = c',
    formatRule: 'Must include an equals sign (=)',
    examples: [{ text: '3x + 5 = 11', tag: 'Linear' }],
  },
  quadratic: {
    title: 'Quadratic Equation',
    badge: 'Degree 2',
    hint: 'ax² + bx + c = 0',
    whatItDoes: 'Finds roots using factoring, completing square, or quadratic formula.',
    formatShape: 'ax² + bx + c = 0',
    formatRule: 'Must include an equals sign (=)',
    examples: [{ text: 'x² - 5x + 6 = 0', tag: 'Quadratic' }],
  },
  rational: {
    title: 'Rational Equation',
    badge: 'Fractions',
    hint: 'Fractions with x',
    whatItDoes: 'Clears fractions by LCD and solves for roots.',
    formatShape: 'P(x)/Q(x) = c',
    formatRule: 'Must include an equals sign (=)',
    examples: [{ text: '1/(x-1) + 1/(x+1) = 1', tag: 'Rational' }],
  },
  radical: {
    title: 'Radical Equation',
    badge: 'Square Roots',
    hint: 'sqrt(x) = c',
    whatItDoes: 'Isolates the root and checks for extraneous solutions.',
    formatShape: 'sqrt(expression) = c',
    formatRule: 'Must include an equals sign (=)',
    examples: [{ text: 'sqrt(x + 2) = 4', tag: 'Radical' }],
  },
  trigonometric: {
    title: 'Trig Equation',
    badge: 'Sin, Cos, Tan',
    hint: 'sin(x) = c',
    whatItDoes: 'Finds exact and principal radian/degree solutions.',
    formatShape: 'sin(x) = c',
    formatRule: 'Must include an equals sign (=)',
    examples: [{ text: 'sin(x) = 1/2', tag: 'Trigonometric' }],
  },
  exponential: {
    title: 'Exponential Equation',
    badge: 'Powers of x',
    hint: 'a^x = c',
    whatItDoes: 'Solves by equating bases or taking logarithms.',
    formatShape: 'a^x = c',
    formatRule: 'Must include an equals sign (=)',
    examples: [{ text: '2^(x+1) = 16', tag: 'Exponential' }],
  },
  logarithmic: {
    title: 'Logarithmic Equation',
    badge: 'Log / Ln',
    hint: 'ln(x) = c',
    whatItDoes: 'Applies logarithm properties and converts to exponential form.',
    formatShape: 'ln(expression) = c',
    formatRule: 'Must include an equals sign (=)',
    examples: [{ text: 'ln(x+2) = 3', tag: 'Logarithmic' }],
  },
  absolute_value: {
    title: 'Absolute Value',
    badge: '|x| Equations',
    hint: '|ax + b| = c',
    whatItDoes: 'Splits into positive and negative cases to find all solutions.',
    formatShape: '|ax + b| = c',
    formatRule: 'Must include an equals sign (=)',
    examples: [{ text: '|2x - 3| = 5', tag: 'Absolute Value' }],
  },
  ode: {
    title: 'Differential Equation',
    badge: 'ODE',
    hint: "y' + P(x)y = Q(x)",
    whatItDoes: 'Solves ordinary differential equations step-by-step.',
    formatShape: "y'' + 4y = 0",
    formatRule: "Use prime notation y' or dy/dx",
    examples: [{ text: "y'' + 4y = 0", tag: 'ODE' }],
  },
};

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
    if (tab && ['polynomial', 'domain_range', 'derivative', 'integral', 'system', 'inequality', 'symbolic'].includes(tab)) {
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
  const [showGuide, setShowGuide] = useState(false);
  const [dismissedFixId, setDismissedFixId] = useState<string | null>(null);

  // Reset dismissed fix when equation changes significantly
  useEffect(() => {
    setDismissedFixId(null);
  }, [equation]);

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
    domain_range: 'e.g. sqrt(4 - x^2)  or  1/(x-3)  or  x^2 - 4',
    linear: 'e.g. 3x + 5 = 11',
    quadratic: 'e.g. x² - 5x + 6 = 0',
    rational: 'e.g. 1/(x-1) + 1/(x+1) = 1',
    radical: 'e.g. sqrt(x + 2) = 4',
    trigonometric: 'e.g. sin(x) = 1/2',
    exponential: 'e.g. 2^(x+1) = 16',
    logarithmic: 'e.g. ln(x+2) = 3',
    absolute_value: 'e.g. |2x - 3| = 5',
    derivative:  'e.g. 3x² + 5x - 4  or  sin(x)  (no d/dx needed)',
    integral:    'e.g. 2x + 3  or  x² - 4  (no ∫ or dx needed)',
    inequality:  'e.g. 2x - 3 > 5  or  x² - 4 <= 0',
    symbolic:    'e.g. v = u + a*t  (solve for variable below)',
    system:      'e.g. 2x + y = 7',
    ode:         "e.g. y'' + 4y = 0",
  };

  const currentAction = ACTIONS.find(a => a.value === solverType);
  const currentGuide = OPERATION_GUIDES[solverType] || OPERATION_GUIDES.polynomial;

  const handleSelectExample = (ex: OperationExample) => {
    if (solverType === 'system' && ex.systemEqs) {
      ex.systemEqs.forEach((eq, idx) => {
        updateSystemEquation(idx, eq);
      });
      setTimeout(() => useSolverStore.getState().solve(), 80);
      return;
    }

    if (solverType === 'symbolic' && ex.variable) {
      setSolveForVariable(ex.variable);
    }

    setEquation(ex.text);
  };

  const assistant = React.useMemo(() => {
    return analyzeInput(equation, solverType);
  }, [equation, solverType]);

  const handleApplyFix = (fix: AutoFix) => {
    if (fix.targetMode && fix.targetMode !== solverType) {
      setSolverType(fix.targetMode);
    }
    if (fix.systemEqs && fix.targetMode === 'system') {
      fix.systemEqs.forEach((eq, idx) => updateSystemEquation(idx, eq));
      setTimeout(() => useSolverStore.getState().solve(), 80);
      return;
    }
    setEquation(fix.fixedEquation);
    setTimeout(() => useSolverStore.getState().solve(), 60);
  };

  const handleApplySuggestion = (s: SuggestedAction) => {
    if (s.targetMode !== solverType) {
      setSolverType(s.targetMode);
    }
    if (s.targetEquation) {
      setEquation(s.targetEquation);
    }
    if (s.variable) {
      setSolveForVariable(s.variable);
    }
    setTimeout(() => useSolverStore.getState().solve(), 60);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

      {/* ── 1. Operation Selection Bar (Top Position for Intuitive Flow) ────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#757575] dark:text-[#8D827A] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5D4037] dark:bg-[#D7CCC8]" />
            1. Operation
          </span>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-[10px] sm:text-[11px] font-mono font-semibold text-[#5D4037] dark:text-[#D7CCC8] hover:underline flex items-center gap-1 cursor-pointer py-1 px-1.5 rounded-md hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] transition-colors"
          >
            <Info size={12} />
            <span>{showGuide ? 'Hide' : 'Guide'}</span>
            {showGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* Action Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
          {ACTIONS.map(({ value, emoji, label, hint }) => {
            const isSelected = solverType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSolverType(value)}
                title={`${label}: ${hint}`}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all min-h-[50px] sm:min-h-[52px] select-none cursor-pointer ${
                  isSelected
                    ? 'bg-[#5D4037] text-white border-[#795548] shadow-sm scale-[1.02] ring-2 ring-[#5D4037]/20'
                    : 'bg-[#F5F5F5] dark:bg-[#181818] text-[#555] dark:text-[#A19891] border-[#E0E0E0] dark:border-[#282422] hover:bg-[#EFEBE9] dark:hover:bg-[#22201F] hover:text-[#5D4037] dark:hover:text-white'
                }`}
              >
                <span className="text-base sm:text-lg leading-none font-mono mb-0.5">{emoji}</span>
                <span className="text-[11px] font-bold leading-tight text-center">{label}</span>
                <span className={`text-[9px] font-normal leading-none mt-0.5 ${isSelected ? 'text-[#D7CCC8]' : 'text-[#8D827A] dark:text-[#757575]'}`}>
                  {hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contextual Operation Format & Quick-Start Guide (Hidden by default) ─── */}
      {showGuide && (
        <div className="rounded-2xl border border-[#E0E0E0] dark:border-[#2E2825] bg-[#FBF9F8] dark:bg-[#161616] p-3 sm:p-4 space-y-2.5 shadow-2xs transition-all animate-fade-in">
          {/* Header row with Mode, Rule, Tag and direct Collapse button */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE5E2] dark:border-[#282321] pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#5D4037] dark:text-[#D7CCC8]" />
                {currentGuide.title}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EFEBE9] dark:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] font-semibold border border-[#D7CCC8] dark:border-[#3E2723]">
                {currentGuide.badge}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#795548] dark:text-[#BCAAA4] font-medium bg-white dark:bg-[#1E1E1E] px-2 py-0.5 rounded-md border border-[#E0E0E0] dark:border-[#332D2A]">
                ✓ {currentGuide.formatRule}
              </span>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-md text-[#8D827A] hover:text-[#5D4037] dark:hover:text-[#D7CCC8] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] transition-colors cursor-pointer"
                title="Hide Guide"
                aria-label="Hide Guide"
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </div>

          {/* Plain English explanation: what it does */}
          <p className="text-xs sm:text-[13px] text-[#424242] dark:text-[#CCCCCC] leading-relaxed">
            {currentGuide.whatItDoes}
          </p>

          {/* Expected Format & Examples */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-[10px] font-bold uppercase text-[#8D827A] dark:text-[#A19891] shrink-0">
                Format:
              </span>
              <code className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1E1E1E] border border-[#E0E0E0] dark:border-[#332D2A] text-[#5D4037] dark:text-[#D7CCC8] font-bold text-[11px] sm:text-xs">
                {currentGuide.formatShape}
              </code>
            </div>

            {/* Clickable Example Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[10px] font-mono font-bold uppercase text-[#8D827A] dark:text-[#A19891] shrink-0">
                Try:
              </span>
              {currentGuide.examples.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectExample(ex)}
                  className="group/pill inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-white dark:bg-[#1E1E1E] text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] dark:hover:border-[#795548] transition-all whitespace-nowrap shadow-2xs cursor-pointer active:scale-95 shrink-0"
                  title={`Click to try ${ex.tag}: ${ex.text}`}
                >
                  <span className="font-semibold text-[#5D4037] dark:text-[#D7CCC8]">{ex.text}</span>
                  <span className="text-[9px] text-[#8D827A] dark:text-[#7A706A] group-hover/pill:text-[#5D4037] dark:group-hover/pill:text-[#D7CCC8]">
                    ({ex.tag})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Enter Equation / Expression Area ─────────────────────────────── */}
      {!isSystem && (
        <div className="space-y-2">
          {/* Label row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="equation" className="text-xs font-mono font-bold uppercase tracking-wider text-[#131313] dark:text-white">
                2. Input
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
                className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
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
                className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
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

          {/* Syntax help panel */}
          {showHelp && (
            <div className="bg-[#F5F5F5] dark:bg-[#131313] border border-[#E0E0E0] dark:border-[#3E2723] rounded-xl p-3 text-xs space-y-1.5 animate-fade-in shadow-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[#5D4037] dark:text-[#D7CCC8]">Input Syntax Guide</span>
                <button type="button" onClick={() => setShowHelp(false)} className="p-1 text-[#616161] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white rounded cursor-pointer">
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

          {/* Large wide touch-optimized input field */}
          <div className="relative w-full">
            <input
              id="equation"
              type="text"
              enterKeyHint="go"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
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
              className="w-full pl-4 pr-11 py-3.5 sm:py-4 rounded-2xl border-2 border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] outline-none transition-all font-mono text-base sm:text-lg shadow-sm min-h-[52px]"
              placeholder={placeholders[solverType]}
            />
            {equation && (
              <button
                type="button"
                onClick={() => setEquation('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#9E9E9E] hover:text-[#5D4037] dark:hover:text-white hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] transition-colors cursor-pointer"
                title="Clear input"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* ── Auto-Fix "Did You Mean?" Banner ─────────────────────────────── */}
          {assistant.hasFix && assistant.fix && !dismissedFixId && (
            <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-50/95 dark:bg-[#261E17] border border-amber-200/90 dark:border-amber-800/60 shadow-2xs animate-fade-in text-xs">
              <div className="flex items-center gap-2 pr-2 overflow-hidden">
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-amber-950 dark:text-amber-100 font-mono text-xs sm:text-sm">
                    {assistant.fix.label}
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 ml-1.5 hidden sm:inline">
                    ({assistant.fix.explanation})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleApplyFix(assistant.fix!)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-mono text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Fix ✨
                </button>
                <button
                  type="button"
                  onClick={() => setDismissedFixId(assistant.fix!.id)}
                  className="p-1 rounded-lg text-amber-600/70 hover:text-amber-900 dark:text-amber-400/70 dark:hover:text-amber-100 hover:bg-amber-100/60 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── Smart Action Suggestions ("Actions:") ─────────────────────────── */}
          {assistant.suggestions.length > 0 && equation.trim().length >= 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 animate-fade-in">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8D827A] dark:text-[#A19891] shrink-0 flex items-center gap-1">
                <Sparkles size={12} className="text-[#5D4037] dark:text-[#D7CCC8]" />
                Actions:
              </span>
              {assistant.suggestions.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleApplySuggestion(s)}
                  className="group/sug inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-white dark:bg-[#1E1E1E] text-[#131313] dark:text-white border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037] hover:bg-[#EFEBE9] dark:hover:bg-[#25201E] dark:hover:border-[#795548] transition-all whitespace-nowrap shadow-2xs cursor-pointer active:scale-95 shrink-0"
                  title={s.description}
                >
                  <span className="font-bold text-[#5D4037] dark:text-[#D7CCC8]">{s.icon}</span>
                  <span className="font-semibold">{s.label}</span>
                </button>
              ))}
            </div>
          )}

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
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#757575] dark:text-[#8D827A]">Method:</span>
                <span className="text-[10px] font-mono text-[#5D4037] dark:text-[#D7CCC8]">
                  {quadraticMethod === 'auto' ? 'Auto' : quadraticMethod === 'factoring' ? 'Factoring' : quadraticMethod === 'completing_square' ? 'Completing Square' : 'Formula'}
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
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all border cursor-pointer ${
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
            <div className="p-3 rounded-2xl bg-[#FBF9F8] dark:bg-[#181818] border border-[#E0E0E0] dark:border-[#2E2825] space-y-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <label htmlFor="solveFor" className="text-xs font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8]">
                  Variable:
                </label>
                <span className="text-[10px] font-mono text-[#8D827A]">e.g. t, r, m, a</span>
              </div>
              <input
                id="solveFor" type="text" value={solveForVariable}
                onChange={(e) => setSolveForVariable(e.target.value)}
                className="w-full sm:w-1/2 px-3.5 py-2 rounded-xl border border-[#E0E0E0] dark:border-[#332D2A] bg-white dark:bg-[#131313] text-[#131313] dark:text-white focus:ring-2 focus:ring-[#5D4037]/30 focus:border-[#5D4037] outline-none transition-all font-mono text-sm shadow-2xs"
                placeholder="e.g. t"
              />
            </div>
          )}

          {/* Real-time Math Preview Card */}
          {equation.trim() && (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FBF9F8] dark:bg-[#161616] border border-[#E0E0E0] dark:border-[#2E2825] shadow-2xs transition-all animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#EAE5E2] dark:border-[#282321] pb-1.5 mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5D4037] dark:text-[#D7CCC8] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Interpreted:
                </span>
                <span className="text-[10px] font-mono text-[#8D827A] dark:text-[#A19891] flex items-center gap-1">
                  <Eye size={11} />
                  Preview
                </span>
              </div>
              <div className="w-full overflow-x-auto scrollbar-thin py-1 text-[#131313] dark:text-white flex justify-center items-center">
                <div className="text-sm sm:text-base md:text-lg font-medium tracking-wide max-w-full px-1">
                  <MathDisplay math={expressionToLatex(equation)} />
                </div>
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
              2. Systems
            </label>
            <span className="text-[10px] font-mono text-[#757575] dark:text-[#8D827A]">
              {systemEquations.length} / 4
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
                placeholder={`Equation ${idx + 1}  e.g. 2x + y = 7`}
                required
              />
              {systemEquations.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeSystemEquation(idx)}
                  className="p-2 rounded-xl border border-red-200 dark:border-[#5D4037]/50 text-red-500 dark:text-[#FFAB91] bg-red-50 dark:bg-[#3E2723]/40 hover:bg-red-100 dark:hover:bg-[#3E2723]/80 transition-colors shrink-0 cursor-pointer"
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
              className="w-full py-2.5 border-2 border-dashed border-[#BCAAA4] dark:border-[#3E2723] rounded-xl text-[#5D4037] dark:text-[#A1887F] hover:border-[#5D4037] hover:bg-[#EFEBE9] dark:hover:bg-[#22201F] dark:hover:text-white transition-colors flex items-center justify-center gap-2 text-xs font-mono font-semibold cursor-pointer"
            >
              <Plus size={15} />
              Add
            </button>
          )}

          {/* Variables */}
          <div>
            <label htmlFor="variables" className="block text-[11px] font-mono font-medium text-[#5D4037] dark:text-[#D7CCC8] mb-1">
              Variables:
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

      {/* ── 3. Primary CTA Button ──────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isLoading || (isSystem ? systemEquations.some(eq => !eq.trim()) : !equation.trim())}
        className="w-full py-3 sm:py-3.5 px-5 rounded-2xl bg-[#5D4037] hover:bg-[#4E342E] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[46px] sm:min-h-[50px] flex items-center justify-center gap-2 border border-[#795548]/50 cursor-pointer"
      >
        {isLoading ? (
          'Solving…'
        ) : (
          <>
            <span className="text-base leading-none">{currentAction?.emoji}</span>
            <span>
              {solverType === 'domain_range'
                ? 'Domain'
                : solverType === 'derivative'
                ? 'Derivative'
                : solverType === 'integral'
                ? 'Integral'
                : solverType === 'system'
                ? 'Systems'
                : solverType === 'inequality'
                ? 'Solve'
                : solverType === 'symbolic'
                ? 'Rearrange'
                : 'Solve'}
            </span>
            <span className="text-xs font-normal opacity-85 hidden sm:inline">— Steps ↓</span>
          </>
        )}
      </button>
    </form>
  );
}
