import { useSolverStore } from '../../src/stores/solverStore';

describe('solverStore resilience and state management', () => {
  beforeEach(() => {
    useSolverStore.setState({
      equation: '',
      solverType: 'polynomial',
      quadraticMethod: 'auto',
      systemEquations: ['', ''],
      systemVariables: ['x', 'y'],
      result: null,
      isLoading: false,
      error: null,
      solveForVariable: 'x',
    });
  });

  it('un-sticks isLoading and clears stale result when equation changes', () => {
    // Simulate stuck isLoading and stale result
    useSolverStore.setState({
      equation: 'x + 6 = 0',
      isLoading: true,
      result: {
        type: 'polynomial',
        equationType: 'linear',
        steps: [],
        finalAnswer: '-6',
      } as any,
    });

    expect(useSolverStore.getState().isLoading).toBe(true);
    expect(useSolverStore.getState().result).not.toBeNull();

    // User types new equation x^2 - 5x + 6 = 0
    useSolverStore.getState().setEquation('x^2 - 5x + 6 = 0');

    expect(useSolverStore.getState().isLoading).toBe(false);
    expect(useSolverStore.getState().result).toBeNull();
    expect(useSolverStore.getState().equation).toBe('x^2 - 5x + 6 = 0');
  });

  it('un-sticks isLoading when clearResult or clearError is called', () => {
    useSolverStore.setState({ isLoading: true, error: 'Some error' });
    useSolverStore.getState().clearError();
    expect(useSolverStore.getState().isLoading).toBe(false);

    useSolverStore.setState({ isLoading: true });
    useSolverStore.getState().clearResult();
    expect(useSolverStore.getState().isLoading).toBe(false);
  });

  it('un-sticks isLoading when setSolverType is called', () => {
    useSolverStore.setState({ isLoading: true, solverType: 'polynomial' });
    useSolverStore.getState().setSolverType('derivative');
    expect(useSolverStore.getState().isLoading).toBe(false);
    expect(useSolverStore.getState().solverType).toBe('derivative');
  });

  it('solves x^2 - 5x + 6 = 0 cleanly and sets isLoading to false with quadratic roots', async () => {
    useSolverStore.getState().setEquation('x^2 - 5x + 6 = 0');
    await useSolverStore.getState().solve();

    const state = useSolverStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.result).not.toBeNull();
    expect(state.result?.equationType).toBe('quadratic');
    expect(state.result?.finalAnswer).toContain('2');
    expect(state.result?.finalAnswer).toContain('3');
  });
});
