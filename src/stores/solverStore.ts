import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SolverType, SolverResult, QuadraticMethod } from '@/types/solver';

interface SolverState {
  equation: string;
  solverType: SolverType;
  quadraticMethod: QuadraticMethod;
  systemEquations: string[];
  systemVariables: string[];
  result: SolverResult | null;
  isLoading: boolean;
  error: string | null;
  solveForVariable: string;

  setEquation: (equation: string) => void;
  setSolverType: (type: SolverType) => void;
  setQuadraticMethod: (method: QuadraticMethod) => void;
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
      quadraticMethod: 'auto',
      systemEquations: ['', ''],
      systemVariables: ['x', 'y'],
      result: null,
      isLoading: false,
      error: null,
      solveForVariable: 'x',

      setEquation: (equation) => set({ equation, error: null }),
      setSolverType: (solverType) => set({ solverType, result: null, error: null }),
      setQuadraticMethod: (quadraticMethod) => {
        set({ quadraticMethod });
        const { equation, solverType } = get();
        if (solverType === 'polynomial' && equation.trim()) {
          get().solve();
        }
      },
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
      solve: async () => {
        set({ isLoading: true, error: null });
        const { solverType, equation, quadraticMethod, systemEquations, systemVariables, solveForVariable } = get();
        
        try {
          let result: SolverResult | null = null;
          switch (solverType) {
            case 'polynomial': {
              if (!equation.trim()) throw new Error('Please enter an equation.');
              const { solvePolynomial } = await import('@/lib/math/solver');
              result = solvePolynomial(equation, quadraticMethod);
              break;
            }
            case 'derivative': {
              if (!equation.trim()) throw new Error('Please enter a function or expression to differentiate.');
              const { solveDerivative } = await import('@/lib/math/calculusSolver');
              result = solveDerivative(equation);
              break;
            }
            case 'integral': {
              if (!equation.trim()) throw new Error('Please enter a function or expression to integrate.');
              const { solveIntegral } = await import('@/lib/math/calculusSolver');
              result = solveIntegral(equation);
              break;
            }
            case 'system': {
              if (systemEquations.some((eq) => !eq.trim())) throw new Error('Please fill in all equations in the system.');
              const { solveSystem } = await import('@/lib/math/solver');
              result = solveSystem(systemEquations, systemVariables);
              break;
            }
            case 'inequality': {
              if (!equation.trim()) throw new Error('Please enter an inequality.');
              const { solveInequality } = await import('@/lib/math/solver');
              result = solveInequality(equation);
              break;
            }
            case 'symbolic': {
              if (!equation.trim()) throw new Error('Please enter a symbolic equation.');
              const { solveSymbolic } = await import('@/lib/math/solver');
              result = solveSymbolic(equation, solveForVariable);
              break;
            }
            case 'domain_range': {
              if (!equation.trim()) throw new Error('Please enter a function to find domain and range.');
              const { solveDomainAndRange } = await import('@/lib/math/domainRangeSolver');
              result = solveDomainAndRange(equation);
              break;
            }
          }
          set({ result, isLoading: false, error: null });

          // Sync URL search params for shareability
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', solverType);
            if (solverType === 'system') {
              url.searchParams.delete('eq');
              url.searchParams.delete('method');
            } else if (equation) {
              url.searchParams.set('eq', equation);
              if (solverType === 'polynomial' && quadraticMethod !== 'auto') {
                url.searchParams.set('method', quadraticMethod);
              } else {
                url.searchParams.delete('method');
              }
            }
            if (solverType === 'symbolic' && solveForVariable) {
              url.searchParams.set('var', solveForVariable);
            }
            window.history.replaceState({}, '', url.toString());
          }
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
