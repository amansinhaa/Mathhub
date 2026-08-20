export interface DataPoint {
  x: number;
  y: number;
}

export interface GraphEquation {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

export interface RegressionResult {
  type?: 'linear' | 'polynomial' | 'exponential' | 'none';
  equation: string;
  latex: string;
  r2: number;
  rSquared?: number;
  coefficients: number[];
  predict: (x: number) => number;
}

export type YScaleType = 'linear' | 'log';

export const GRAPH_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];
