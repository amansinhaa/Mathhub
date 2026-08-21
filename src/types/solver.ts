export type SolverType = 'polynomial' | 'system' | 'inequality' | 'symbolic';

export interface DivisionDetails {
  longDivisionMath: string;
  syntheticMath: string;
  quotientMath: string;
  divisorMath: string;
  dividendMath: string;
  remainderMath: string;
  explainer?: string;
}

export interface SolutionStep {
  stepNumber?: number;
  explanation: string;
  math: string; // LaTeX
  divisionDetails?: DivisionDetails;
}

export interface SolverResult {
  steps: SolutionStep[];
  finalAnswer: string; // LaTeX
  type: SolverType;
}
