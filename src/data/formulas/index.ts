import { FormulaEntry, FormulaCategory, CategoryGroup, CATEGORY_LABELS, CurriculumLevel, formulaMatchesLevel } from '@/types/formula';
import { algebra } from './algebra';
import { trigonometry } from './trigonometry';
import { calculus } from './calculus';
import { logarithms } from './logarithms';
import { probability } from './probability';
import { geometry } from './geometry';
import { vectors } from './vectors';
import { complex, mensuration, numberTheory, setsAndFunctions } from './combined';

/** All formulas from every category, combined into a single searchable array. */
export const ALL_FORMULAS: FormulaEntry[] = [
  ...algebra,
  ...trigonometry,
  ...calculus,
  ...logarithms,
  ...probability,
  ...geometry,
  ...vectors,
  ...complex,
  ...mensuration,
  ...numberTheory,
  ...setsAndFunctions,
];

/** Get all formulas for a specific category. */
export function getFormulasByCategory(category: FormulaCategory): FormulaEntry[] {
  return ALL_FORMULAS.filter((f) => f.category === category);
}

/**
 * Search formulas by keyword across name, description, and tags.
 * Case-insensitive.
 */
export function searchFormulas(query: string): FormulaEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_FORMULAS;
  return ALL_FORMULAS.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q))
  );
}

/** Get all categories with their formulas and counts, ordered, optionally filtered by level & query. */
export function getCategoryGroups(level: CurriculumLevel = 'all', query: string = ''): CategoryGroup[] {
  const orderedCategories: FormulaCategory[] = [
    'algebra',
    'trigonometry',
    'calculus',
    'logarithms',
    'probability',
    'geometry',
    'vectors',
    'complex',
    'mensuration',
    'numberTheory',
    'setsAndFunctions',
  ];

  const q = query.toLowerCase().trim();

  return orderedCategories.map((category) => {
    let formulas = getFormulasByCategory(category);
    if (level !== 'all') {
      formulas = formulas.filter((f) => formulaMatchesLevel(f, level));
    }
    if (q) {
      formulas = formulas.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return {
      category,
      label: CATEGORY_LABELS[category],
      formulas,
      count: formulas.length,
    };
  });
}
