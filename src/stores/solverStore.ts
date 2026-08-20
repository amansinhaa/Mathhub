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
  solveForVariable: string;

  setEquation: (equation: string) => void;
  setSolverType: (type: SolverType) => void;
  addSystemEquation: () => void;
  removeSystemEquation: (index: number) => void;
  updateSystemEquation: (index: number, eq: string) => void;
  setSystemVariables: (vars: string[]) => void;
  clearResult: () => void;
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
      solveForVariable: 'x',

      setEquation: (equation) => set({ equation }),
      setSolverType: (solverType) => set({ solverType, result: null }),
      addSystemEquation: () => set((state) => {
        if (state.systemEquations.length < 4) {
          return { systemEquations: [...state.systemEquations, ''] };
        }
        return state;
      }),
      removeSystemEquation: (index) => set((state) => {
        if (state.systemEquations.length > 2) {
          const newEqs = [...state.systemEquations];
          newEqs.splice(index, 1);
          return { systemEquations: newEqs };
        }
        return state;
      }),
      updateSystemEquation: (index, eq) => set((state) => {
        const newEqs = [...state.systemEquations];
        newEqs[index] = eq;
        return { systemEquations: newEqs };
      }),
      setSystemVariables: (vars) => set({ systemVariables: vars }),
      clearResult: () => set({ result: null }),
      setSolveForVariable: (variable) => set({ solveForVariable: variable }),
      solve: () => {
        set({ isLoading: true });
        const { solverType, equation, systemEquations, systemVariables, solveForVariable } = get();
        
        try {
          let result: SolverResult | null = null;
          switch (solverType) {
            case 'polynomial':
              result = solvePolynomial(equation);
              break;
            case 'system':
              result = solveSystem(systemEquations, systemVariables);
              break;
            case 'inequality':
              result = solveInequality(equation);
              break;
            case 'symbolic':
              result = solveSymbolic(equation, solveForVariable);
              break;
          }
          set({ result, isLoading: false });
        } catch (error) {
          set({ result: null, isLoading: false });
        }
      }
    }),
    {
      name: 'mathhub-solver',
    }
  )
);
