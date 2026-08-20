export type SolverType = 'polynomial' | 'system' | 'inequality' | 'symbolic';

export interface SolutionStep {
  stepNumber?: number;
  explanation: string;
  math: string; // LaTeX
}

export interface SolverResult {
  steps: SolutionStep[];
  finalAnswer: string; // LaTeX
  type: SolverType;
}
