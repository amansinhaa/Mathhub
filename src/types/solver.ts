export type SolverType =
  | 'polynomial'
  | 'linear'
  | 'linear_2var'
  | 'quadratic'
  | 'rational'
  | 'radical'
  | 'trigonometric'
  | 'exponential'
  | 'logarithmic'
  | 'absolute_value'
  | 'derivative'
  | 'integral'
  | 'system'
  | 'inequality'
  | 'symbolic'
  | 'ode'
  | 'domain_range'
  | 'arithmetic_check';

export type EquationType =
  | 'linear'
  | 'linear_2var'
  | 'quadratic'
  | 'polynomial'
  | 'rational'
  | 'radical'
  | 'trigonometric'
  | 'exponential'
  | 'logarithmic'
  | 'absolute_value'
  | 'system'
  | 'inequality'
  | 'ode'
  | 'domain_range'
  | 'arithmetic_check';

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

export interface SubStep {
  title: string;
  math: string;
}

export interface SolutionStep {
  stepNumber?: number;
  explanation: string;
  math: string; // LaTeX
  divisionDetails?: DivisionDetails;
  formulaUsed?: FormulaUsed;
  subSteps?: SubStep[];
}

export interface SolverResult {
  steps: SolutionStep[];
  finalAnswer: string; // LaTeX
  decimalAnswer?: string; // Decimal representation for roots
  numericRoots?: number[]; // Extracted numerical real roots for visualizer & graph
  type: SolverType;
  equationType?: EquationType;
  inputInterpretation?: string; // LaTeX description of what the engine parsed
  quadraticMethod?: QuadraticMethod;
  natureOfRoots?: string[]; // Parametric/discriminant nature of roots cases
  rawEquation?: string; // Stored input equation to verify result freshness and prevent stale output
}

