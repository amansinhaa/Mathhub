/** Formula category in the reference library. */
export type FormulaCategory =
  | 'algebra'
  | 'trigonometry'
  | 'calculus'
  | 'logarithms'
  | 'probability'
  | 'geometry'
  | 'vectors'
  | 'complex'
  | 'mensuration'
  | 'numberTheory'
  | 'setsAndFunctions';

/** Human-readable labels for each category. */
export const CATEGORY_LABELS: Record<FormulaCategory, string> = {
  algebra: 'Algebra',
  trigonometry: 'Trigonometry',
  calculus: 'Calculus',
  logarithms: 'Logarithms & Exponentials',
  probability: 'Probability & Statistics',
  geometry: 'Coordinate Geometry',
  vectors: 'Vectors & Matrices',
  complex: 'Complex Numbers',
  mensuration: 'Mensuration',
  numberTheory: 'Number Theory',
  setsAndFunctions: 'Sets, Relations & Functions',
};

/** A single formula entry in the reference library. */
export interface FormulaEntry {
  /** Unique identifier */
  id: string;
  /** Display name of the formula */
  name: string;
  /** KaTeX-renderable LaTeX string */
  latex: string;
  /** One-line explanation of when/why it's used */
  description: string;
  /** Category for filtering */
  category: FormulaCategory;
  /** Searchable keywords/tags */
  tags: string[];
  /** Optional: expression that can be loaded into the calculator */
  calculatorExpression?: string;
  /** Optional: equation that can be loaded into the solver */
  solverExpression?: string;
}

/** Category with its formulas and count, used for filtering UI. */
export interface CategoryGroup {
  category: FormulaCategory;
  label: string;
  count: number;
  formulas?: FormulaEntry[];
}
