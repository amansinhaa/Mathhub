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

      setEquation: (equation) =>
        set((state) => ({
          equation,
          error: null,
          isLoading: false,
          // When equation text changes, clear stale result if it was from a different equation
          ...(state.result && state.equation !== equation ? { result: null } : {}),
        })),
      setSolverType: (solverType) =>
        set({ solverType, result: null, error: null, isLoading: false }),
      setQuadraticMethod: (quadraticMethod) => {
        set({ quadraticMethod, isLoading: false });
        const { equation, solverType } = get();
        if (solverType === 'polynomial' && equation.trim()) {
          get().solve();
        }
      },
      addSystemEquation: () => set((state) => {
        if (state.systemEquations.length < 4) {
          return { systemEquations: [...state.systemEquations, ''], error: null, isLoading: false };
        }
        return state;
      }),
      removeSystemEquation: (index) => set((state) => {
        if (state.systemEquations.length > 2) {
          const newEqs = [...state.systemEquations];
          newEqs.splice(index, 1);
          return { systemEquations: newEqs, error: null, isLoading: false };
        }
        return state;
      }),
      updateSystemEquation: (index, eq) => set((state) => {
        const newEqs = [...state.systemEquations];
        newEqs[index] = eq;
        return { systemEquations: newEqs, error: null, isLoading: false, ...(state.result ? { result: null } : {}) };
      }),
      setSystemVariables: (vars) => set({ systemVariables: vars }),
      clearResult: () => set({ result: null, error: null, isLoading: false }),
      clearError: () => set({ error: null, isLoading: false }),
      setSolveForVariable: (variable) => set({ solveForVariable: variable, isLoading: false }),
      solve: async () => {
        set({ isLoading: true, error: null });
        const { solverType, equation, quadraticMethod, systemEquations, systemVariables, solveForVariable } = get();

        // 5-second safety watchdog so button is never permanently stuck even under unexpected error
        let timeoutFired = false;
        const watchdog = setTimeout(() => {
          timeoutFired = true;
          if (get().isLoading) {
            set({
              isLoading: false,
              error: 'Calculation timed out. Please check your equation syntax.',
            });
          }
        }, 5000);

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

          if (!timeoutFired) {
            clearTimeout(watchdog);
            set({ result, isLoading: false, error: null });

            // Sync URL search params for shareability
            if (typeof window !== 'undefined') {
              try {
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
              } catch (_) {
                // Ignore URL sync errors in restricted environments
              }
            }
          }
        } catch (err: any) {
          clearTimeout(watchdog);
          const message = err?.message || 'Could not solve the equation. Please check equation syntax (e.g. x^2 - 5x + 6 = 0).';
          set({ result: null, isLoading: false, error: message });
        } finally {
          clearTimeout(watchdog);
          if (get().isLoading) {
            set({ isLoading: false });
          }
        }
      }
    }),
    {
      name: 'mathhub-solver',
      partialize: (state) => ({
        equation: state.equation,
        solverType: state.solverType,
        quadraticMethod: state.quadraticMethod,
        systemEquations: state.systemEquations,
        systemVariables: state.systemVariables,
        solveForVariable: state.solveForVariable,
        // NEVER persist transient execution state:
        // isLoading (MUST always be false on load)
        // error (transient)
        // result (transient output; never restore stale result from a previous equation!)
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          state.error = null;
          state.result = null;
        }
      },
    }
  )
);
