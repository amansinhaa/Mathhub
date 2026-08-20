import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AngleMode, HistoryEntry, MemoryState } from '@/types/calculator';
import { evaluateExpression } from '@/lib/math/evaluator';

export interface CalculatorState {
  expression: string;
  result: string;
  resultLatex: string;
  history: HistoryEntry[];
  memory: MemoryState;
  angleMode: AngleMode;
  isScientificMode: boolean;
  isError: boolean;

  setExpression: (expr: string) => void;
  appendToExpression: (str: string) => void;
  evaluate: () => void;
  clear: () => void;
  clearEntry: () => void;
  memoryAdd: () => void;
  memorySub: () => void;
  memoryRecall: () => void;
  memoryClear: () => void;
  setAngleMode: (mode: AngleMode) => void;
  toggleScientificMode: () => void;
  loadFromHistory: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      expression: '',
      result: '',
      resultLatex: '',
      history: [],
      memory: { value: 0, hasValue: false },
      angleMode: 'DEG',
      isScientificMode: false,
      isError: false,

      setExpression: (expr) => set({ expression: expr }),
      appendToExpression: (str) =>
        set((state) => ({
          expression: state.expression + str,
          isError: false,
        })),
      evaluate: () => {
        const { expression, angleMode } = get();
        if (!expression) return;
        const evalResult = evaluateExpression(expression, angleMode);
        if (evalResult.error) {
          set({
            isError: true,
            result: evalResult.error,
            resultLatex: '\\text{Error}',
          });
          return;
        }
        const newEntry: HistoryEntry = {
          id: crypto.randomUUID(),
          expression,
          result: evalResult.result,
          latex: evalResult.latex,
          resultLatex: evalResult.latex,
          timestamp: Date.now(),
        };
        set((state) => ({
          result: evalResult.result,
          resultLatex: evalResult.latex,
          history: [newEntry, ...state.history].slice(0, 50),
          expression: evalResult.result,
          isError: false,
        }));
      },
      clear: () => set({ expression: '', result: '', resultLatex: '', isError: false }),
      clearEntry: () =>
        set((state) => ({
          expression: state.expression.slice(0, -1),
          isError: false,
        })),
      memoryAdd: () => {
        const { result, expression, memory } = get();
        const val = parseFloat(result || expression);
        if (!isNaN(val)) {
          set({ memory: { value: memory.value + val, hasValue: true } });
        }
      },
      memorySub: () => {
        const { result, expression, memory } = get();
        const val = parseFloat(result || expression);
        if (!isNaN(val)) {
          set({ memory: { value: memory.value - val, hasValue: true } });
        }
      },
      memoryRecall: () => {
        const { memory } = get();
        if (memory.hasValue) {
          set((state) => ({ expression: state.expression + memory.value.toString() }));
        }
      },
      memoryClear: () => set({ memory: { value: 0, hasValue: false } }),
      setAngleMode: (mode) => set({ angleMode: mode }),
      toggleScientificMode: () =>
        set((state) => ({ isScientificMode: !state.isScientificMode })),
      loadFromHistory: (entry) =>
        set({
          expression: entry.expression,
          result: entry.result,
          resultLatex: entry.resultLatex || entry.latex || '',
          isError: false,
        }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'mathhub-calculator',
    }
  )
);
