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
  forceUnstick: () => void;
  setSolveForVariable: (variable: string) => void;
  solve: () => Promise<void>;
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
          // When equation text changes, always clear stale result to avoid showing wrong answers
          ...(state.result && state.equation !== equation ? { result: null } : {}),
        })),
      setSolverType: (solverType) =>
        set({
          solverType,
          result: null,
          error: null,
          isLoading: false,
          ...(solverType === 'system' ? { equation: '' } : {}),
        }),
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
      forceUnstick: () => set({ isLoading: false, error: null, result: null }),
      setSolveForVariable: (variable) => set({ solveForVariable: variable, isLoading: false }),
      solve: async () => {
        const stateBefore = get();
        // Clear any old stale result immediately so wrong/old answer is never displayed during solving
        set({ isLoading: true, error: null, result: null });
        const { solverType, equation, quadraticMethod, systemEquations, systemVariables, solveForVariable } = get();

        // Safety watchdog: guarantees button is NEVER stuck longer than 3.5 seconds
        let timeoutFired = false;
        const watchdog = setTimeout(() => {
          timeoutFired = true;
          if (get().isLoading) {
            set({
              isLoading: false,
              result: null,
              error: 'Calculation took too long or syntax was unrecognized. Please verify your equation format.',
            });
          }
        }, 3500);

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
            if (result) {
              result.rawEquation = equation;
            }
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
          const rawMsg = err?.message || '';
          let friendlyMessage = 'Could not solve the equation. Please check equation syntax.';
          if (/division by zero/i.test(rawMsg) || /divide by zero/i.test(rawMsg)) {
            friendlyMessage = 'Cannot divide by zero. Please check your denominators.';
          } else if (/negative square root/i.test(rawMsg)) {
            friendlyMessage = 'Square root of a negative value has no real solution.';
          } else if (rawMsg) {
            friendlyMessage = rawMsg;
          }
          set({ result: null, isLoading: false, error: friendlyMessage });
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
      version: 2,
      partialize: (state) => ({
        equation: state.equation,
        quadraticMethod: state.quadraticMethod,
        systemEquations: state.systemEquations,
        systemVariables: state.systemVariables,
        solveForVariable: state.solveForVariable,
        // Do NOT persist solverType so dedicated pages always default to their own initialMode!
        // NEVER persist transient state: isLoading, error, result
      }),
      // Custom merge guarantees that rehydrated state is NEVER in loading mode or has stale result
      merge: (persistedState: any, currentState: SolverState) => ({
        ...currentState,
        ...(persistedState || {}),
        isLoading: false,
        error: null,
        result: null,
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
