/** Angle measurement mode for trigonometric functions. */
export type AngleMode = 'DEG' | 'RAD' | 'GRAD';

/** A single calculation history entry. */
export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  latex?: string;
  resultLatex?: string;
  timestamp: number;
}

/** Memory state for M+/M-/MR/MC operations. */
export interface MemoryState {
  value: number;
  hasValue: boolean;
}

/** Supported unit conversion categories. */
export type UnitCategory =
  | 'length'
  | 'mass'
  | 'temperature'
  | 'time'
  | 'data'
  | 'speed'
  | 'area'
  | 'volume'
  | 'pressure'
  | 'energy'
  | 'currency';

/** A unit definition within a category. */
export interface UnitDefinition {
  name: string;
  symbol: string;
  category: string;
}

/** Matrix size (rows × cols). */
export interface MatrixSize {
  rows: number;
  cols: number;
}

/** The operation to perform on matrices. */
export type MatrixOperation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'determinant'
  | 'inverse'
  | 'transpose'
  | 'rref';

/** Calculator button definition. */
export interface CalcButton {
  label: string;
  value: string;
  type: 'number' | 'operator' | 'function' | 'action' | 'equals' | 'memory';
  /** Optional display label (e.g., "×" for "*") */
  display?: string;
  /** Optional LaTeX representation */
  latex?: string;
  /** Width span (default 1) */
  span?: number;
}
