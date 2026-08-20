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

export interface SavedGraphSnapshot {
  id: string;
  title: string;
  type: 'equation' | 'table' | 'file';
  expressions?: string[];
  equations?: GraphEquation[];
  dataPoints?: DataPoint[];
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number };
  yScale?: YScaleType;
  chartType?: 'line' | 'scatter' | 'bar' | 'area';
  createdAt: number;
}

export type CollageLayout = '1x2' | '2x1' | '2x2' | '2x3' | '3x2' | '3x3';

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

