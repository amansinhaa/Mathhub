export type SolverType = 'polynomial' | 'derivative' | 'integral' | 'system' | 'inequality' | 'symbolic';

export type QuadraticMethod = 'auto' | 'factoring' | 'completing_square' | 'formula';

export interface DivisionDetails {
  longDivisionMath: string;
  syntheticMath: string;
  quotientMath: string;
  divisorMath: string;
  dividendMath: string;
  remainderMath: string;
  explainer?: string;
}

export interface FormulaUsed {
  name: string;
  latex: string;
  description?: string;
}

export interface SolutionStep {
  stepNumber?: number;
  explanation: string;
  math: string; // LaTeX
  divisionDetails?: DivisionDetails;
  formulaUsed?: FormulaUsed;
}

export interface SolverResult {
  steps: SolutionStep[];
  finalAnswer: string; // LaTeX
  type: SolverType;
  inputInterpretation?: string; // LaTeX description of what the engine parsed
  quadraticMethod?: QuadraticMethod;
}

