import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SolverType, SolverResult } from '@/types/solver';
import { solvePolynomial, solveSystem, solveInequality, solveSymbolic } from '@/lib/math/solver';

interface SolverState {
  equation: string;
  solverType: SolverType;
  systemEquations: string[];
  systemVariables: string[];
  result: SolverResult | null;
  isLoading: boolean;
  error: string | null;
  solveForVariable: string;

  setEquation: (equation: string) => void;
  setSolverType: (type: SolverType) => void;
  addSystemEquation: () => void;
  removeSystemEquation: (index: number) => void;
  updateSystemEquation: (index: number, eq: string) => void;
  setSystemVariables: (vars: string[]) => void;
  clearResult: () => void;
  clearError: () => void;
  setSolveForVariable: (variable: string) => void;
  solve: () => void;
}

export const useSolverStore = create<SolverState>()(
  persist(
    (set, get) => ({
      equation: '',
      solverType: 'polynomial',
      systemEquations: ['', ''],
      systemVariables: ['x', 'y'],
      result: null,
      isLoading: false,
      error: null,
      solveForVariable: 'x',

      setEquation: (equation) => set({ equation, error: null }),
      setSolverType: (solverType) => set({ solverType, result: null, error: null }),
      addSystemEquation: () => set((state) => {
        if (state.systemEquations.length < 4) {
          return { systemEquations: [...state.systemEquations, ''], error: null };
        }
        return state;
      }),
      removeSystemEquation: (index) => set((state) => {
        if (state.systemEquations.length > 2) {
          const newEqs = [...state.systemEquations];
          newEqs.splice(index, 1);
          return { systemEquations: newEqs, error: null };
        }
        return state;
      }),
      updateSystemEquation: (index, eq) => set((state) => {
        const newEqs = [...state.systemEquations];
        newEqs[index] = eq;
        return { systemEquations: newEqs, error: null };
      }),
      setSystemVariables: (vars) => set({ systemVariables: vars }),
      clearResult: () => set({ result: null, error: null }),
      clearError: () => set({ error: null }),
      setSolveForVariable: (variable) => set({ solveForVariable: variable }),
      solve: () => {
        set({ isLoading: true, error: null });
        const { solverType, equation, systemEquations, systemVariables, solveForVariable } = get();
        
        try {
          let result: SolverResult | null = null;
          switch (solverType) {
            case 'polynomial':
              if (!equation.trim()) throw new Error('Please enter a polynomial equation.');
              result = solvePolynomial(equation);
              break;
            case 'system':
              if (systemEquations.some((eq) => !eq.trim())) throw new Error('Please fill in all equations in the system.');
              result = solveSystem(systemEquations, systemVariables);
              break;
            case 'inequality':
              if (!equation.trim()) throw new Error('Please enter an inequality.');
              result = solveInequality(equation);
              break;
            case 'symbolic':
              if (!equation.trim()) throw new Error('Please enter a symbolic equation.');
              result = solveSymbolic(equation, solveForVariable);
              break;
          }
          set({ result, isLoading: false, error: null });
        } catch (err: any) {
          const message = err?.message || 'Could not solve the equation. Please check equation syntax (e.g. x^2 - 5x + 6 = 0).';
          set({ result: null, isLoading: false, error: message });
        }
      }
    }),
    {
      name: 'mathhub-solver',
    }
  )
);
