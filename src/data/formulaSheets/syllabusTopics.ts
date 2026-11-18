import { FormulaEntry } from '@/types/formula';
import { BoardId } from './boardData';

export interface SolverPracticeConfig {
  url: string;
  exampleText: string;
  badgeLabel?: string;
}

/**
 * High-value solver practice mappings for key exam-board formulas.
 * Clicking "Practice in Solver" directly opens the matching EasyEquate solver
 * pre-filled with an authentic exam-style problem.
 */
export const FORMULA_PRACTICE_MAP: Record<string, SolverPracticeConfig> = {
  // ─── Quadratics & Polynomials ──────────────────────────────────────────────
  'alg-1': {
    url: '/quadratic-equation-solver?eq=2x^2%20%2B%205x%20-%203%20%3D%200',
    exampleText: '2x² + 5x - 3 = 0',
    badgeLabel: 'Quadratic Formula',
  },
  'alg-11': {
    url: '/quadratic-equation-solver?eq=x^2%20-%207x%20%2B%2012%20%3D%200',
    exampleText: 'x² - 7x + 12 = 0',
    badgeLabel: "Vieta's Roots",
  },
  'alg-12': {
    url: '/quadratic-equation-solver?eq=x^2%20-%206x%20%2B%205%20%3D%200&method=completing_square',
    exampleText: 'x² - 6x + 5 = 0',
    badgeLabel: 'Completing the Square',
  },
  'geom-7': {
    url: '/quadratic-equation-solver?eq=x^2%20-%204x%20%2B%203%20%3D%200',
    exampleText: 'y = x² - 4x + 3',
    badgeLabel: 'Parabola Vertex & Roots',
  },

  // ─── Algebra & Factoring ───────────────────────────────────────────────────
  'alg-2': {
    url: '/equation-solver-with-steps?eq=4x^2%20-%209%20%3D%200',
    exampleText: '4x² - 9 = 0',
    badgeLabel: 'Difference of Squares',
  },
  'alg-3': {
    url: '/equation-solver-with-steps?eq=x^3%20%2B%208%20%3D%200',
    exampleText: 'x³ + 8 = 0',
    badgeLabel: 'Sum of Cubes',
  },
  'alg-4': {
    url: '/equation-solver-with-steps?eq=x^3%20-%2027%20%3D%200',
    exampleText: 'x³ - 27 = 0',
    badgeLabel: 'Difference of Cubes',
  },
  'alg-5': {
    url: '/equation-solver-with-steps?eq=(x%20%2B%202)^4',
    exampleText: '(x + 2)⁴',
    badgeLabel: 'Binomial Expansion',
  },
  'alg-6': {
    url: '/calculator?expr=5%20%2B%20(10-1)*3',
    exampleText: 'a₁₀ = 5 + (10 - 1)·3',
    badgeLabel: '10th Term of AP',
  },
  'alg-7': {
    url: '/calculator?expr=(15%2F2)*(2*4%20%2B%20(15-1)*3)',
    exampleText: 'S₁₅ of AP (a=4, d=3)',
    badgeLabel: 'Sum of AP',
  },
  'alg-8': {
    url: '/calculator?expr=3*(2^(7-1))',
    exampleText: 'a₇ = 3 · 2⁶',
    badgeLabel: '7th Term of GP',
  },
  'alg-9': {
    url: '/calculator?expr=2*(1-3^6)%2F(1-3)',
    exampleText: 'S₆ of GP (a=2, r=3)',
    badgeLabel: 'Sum of GP',
  },
  'alg-10': {
    url: '/calculator?expr=12%2F(1-0.5)',
    exampleText: 'S_∞ = 12 / (1 - 0.5)',
    badgeLabel: 'Infinite Series',
  },

  // ─── Calculus — Differentiation ───────────────────────────────────────────
  'calc-1': {
    url: '/derivative-calculator?eq=4x^3%20-%205x^2%20%2B%206x%20-%208',
    exampleText: 'd/dx [4x³ - 5x² + 6x - 8]',
    badgeLabel: 'Power Rule',
  },
  'calc-2': {
    url: '/derivative-calculator?eq=x^2*sin(x)',
    exampleText: 'd/dx [x² · sin(x)]',
    badgeLabel: 'Product Rule',
  },
  'calc-3': {
    url: '/derivative-calculator?eq=(2x%20%2B%201)%2F(x%20-%203)',
    exampleText: 'd/dx [(2x + 1)/(x - 3)]',
    badgeLabel: 'Quotient Rule',
  },
  'calc-4': {
    url: '/derivative-calculator?eq=(3x^2%20%2B%204)^5',
    exampleText: 'd/dx [(3x² + 4)⁵]',
    badgeLabel: 'Chain Rule',
  },
  'calc-5': {
    url: '/derivative-calculator?eq=e^(2x)%20%2B%203^x',
    exampleText: 'd/dx [e^(2x) + 3^x]',
    badgeLabel: 'Exponential Derivative',
  },
  'calc-6': {
    url: '/derivative-calculator?eq=ln(x^2%20%2B%201)',
    exampleText: 'd/dx [ln(x² + 1)]',
    badgeLabel: 'Logarithmic Derivative',
  },
  'calc-7': {
    url: '/derivative-calculator?eq=sin(2x)*cos(x)',
    exampleText: 'd/dx [sin(2x) · cos(x)]',
    badgeLabel: 'Trig Derivative',
  },
  'calc-12': {
    url: '/derivative-calculator?eq=(sin(x)%20-%20x)%2Fx^3',
    exampleText: 'lim (sin x - x)/x³',
    badgeLabel: "L'Hôpital Limit",
  },

  // ─── Calculus — Integration ───────────────────────────────────────────────
  'calc-8': {
    url: '/integral-calculator?eq=3x^3%20-%204x^2%20%2B%205x%20-%207',
    exampleText: '∫ (3x³ - 4x² + 5x - 7) dx',
    badgeLabel: 'Power Rule Integral',
  },
  'calc-9': {
    url: '/integral-calculator?eq=4%2Fx%20%2B%201%2F(2x%20%2B%203)',
    exampleText: '∫ [4/x + 1/(2x + 3)] dx',
    badgeLabel: 'Reciprocal Integral',
  },
  'calc-10': {
    url: '/integral-calculator?eq=x*cos(x)',
    exampleText: '∫ x · cos(x) dx',
    badgeLabel: 'Integration by Parts',
  },
  'calc-11': {
    url: '/integral-calculator?eq=3x^2%20%2B%202x',
    exampleText: '∫ (3x² + 2x) dx',
    badgeLabel: 'Definite Integral',
  },

  // ─── Trigonometry ─────────────────────────────────────────────────────────
  'trig-1': {
    url: '/equation-solver-with-steps?eq=sin(x)^2%20%2B%20cos(x)^2%20%3D%201',
    exampleText: 'sin²(x) + cos²(x) = 1',
    badgeLabel: 'Pythagorean Identity',
  },
  'trig-4': {
    url: '/calculator?expr=sin(pi%2F3)*cos(pi%2F6)%20%2B%20cos(pi%2F3)*sin(pi%2F6)',
    exampleText: 'sin(60°+30°) exact',
    badgeLabel: 'Compound Angle',
  },
  'trig-7': {
    url: '/equation-solver-with-steps?eq=sin(2x)%20-%20sin(x)%20%3D%200',
    exampleText: 'sin(2x) - sin(x) = 0',
    badgeLabel: 'Double Angle Eq',
  },
  'trig-8': {
    url: '/equation-solver-with-steps?eq=cos(2x)%20%2B%20cos(x)%20%3D%200',
    exampleText: 'cos(2x) + cos(x) = 0',
    badgeLabel: 'Double Angle Cosine',
  },
  'trig-10': {
    url: '/calculator?expr=(12*sin(pi%2F4))%2Fsin(pi%2F3)',
    exampleText: 'a = (12 · sin 45°)/sin 60°',
    badgeLabel: 'Sine Rule',
  },
  'trig-11': {
    url: '/calculator?expr=sqrt(7^2%20%2B%2010^2%20-%202*7*10*cos(pi%2F3))',
    exampleText: 'c = √(7² + 10² - 2·7·10·cos 60°)',
    badgeLabel: 'Cosine Rule',
  },

  // ─── Coordinate Geometry & Mensuration ────────────────────────────────────
  'geom-1': {
    url: '/calculator?expr=sqrt((7-1)^2%20%2B%20(10-2)^2)',
    exampleText: 'd = √((7-1)² + (10-2)²)',
    badgeLabel: 'Distance Formula',
  },
  'geom-2': {
    url: '/calculator?expr=(2%2B8)%2F2',
    exampleText: 'Midpoint x: (2 + 8)/2',
    badgeLabel: 'Midpoint Formula',
  },
  'geom-3': {
    url: '/calculator?expr=(9-3)%2F(5-2)',
    exampleText: 'm = (9 - 3)/(5 - 2)',
    badgeLabel: 'Line Slope',
  },
  'geom-4': {
    url: '/equation-solver-with-steps?tab=symbolic&eq=3x%20-%204y%20%3D%2012&var=y',
    exampleText: '3x - 4y = 12 → y = mx + c',
    badgeLabel: 'Rearrange Line',
  },
  'geom-5': {
    url: '/equation-solver-with-steps?tab=symbolic&eq=y%20-%203%20%3D%202*(x%20-%204)&var=y',
    exampleText: 'y - 3 = 2(x - 4)',
    badgeLabel: 'Point-Slope Form',
  },
  'geom-6': {
    url: '/graph?fn=(x-2)^2%2B(y%2B3)^2%3D25',
    exampleText: '(x - 2)² + (y + 3)² = 25',
    badgeLabel: 'Plot Circle',
  },
  'geom-10': {
    url: '/calculator?expr=(2*8%20%2B%203*2)%2F(2%2B3)',
    exampleText: 'P_x = (2·8 + 3·2)/(2+3)',
    badgeLabel: 'Section Formula',
  },
  'geom-11': {
    url: '/calculator?expr=abs(3*2%20%2B%204*5%20-%206)%2Fsqrt(3^2%20%2B%204^2)',
    exampleText: 'd = |3(2)+4(5)-6|/√(3²+4²)',
    badgeLabel: 'Perpendicular Distance',
  },
  'men-1': {
    url: '/calculator?expr=pi*7^2',
    exampleText: 'A = π · 7²',
    badgeLabel: 'Circle Area (r=7)',
  },
  'men-4': {
    url: '/calculator?expr=sqrt(12*(12-5)*(12-8)*(12-9))',
    exampleText: "Heron's Formula (5, 8, 9)",
    badgeLabel: 'Heron Triangle Area',
  },
  'men-7': {
    url: '/calculator?expr=(4%2F3)*pi*6^3',
    exampleText: 'V = (4/3)·π·6³',
    badgeLabel: 'Sphere Volume',
  },
  'men-9': {
    url: '/calculator?expr=pi*4^2*10',
    exampleText: 'V = π · 4² · 10',
    badgeLabel: 'Cylinder Volume',
  },

  // ─── Statistics & Probability ─────────────────────────────────────────────
  'prob-1': {
    url: '/calculator?expr=7!%2F(7-3)!',
    exampleText: 'P(7, 3) = 7! / (7 - 3)!',
    badgeLabel: 'Permutations P(7,3)',
  },
  'prob-2': {
    url: '/calculator?expr=10!%2F(4!*(10-4)!)',
    exampleText: 'C(10, 4) = 10! / (4!·6!)',
    badgeLabel: 'Combinations C(10,4)',
  },
  'prob-3': {
    url: '/calculator?expr=0.6%20%2B%200.5%20-%200.3',
    exampleText: 'P(A ∪ B) = 0.6 + 0.5 - 0.3',
    badgeLabel: 'Addition Rule',
  },
  'prob-7': {
    url: '/calculator?expr=(6!%2F(2!*4!))*(0.3)^2*(0.7)^4',
    exampleText: 'P(X=2) for n=6, p=0.3',
    badgeLabel: 'Binomial Probability',
  },
  'prob-10': {
    url: '/calculator?expr=sqrt(14.8%20-%203.2^2)',
    exampleText: 'σ = √(E[X²] - (E[X])²)',
    badgeLabel: 'Standard Deviation',
  },
  'prob-11': {
    url: '/calculator?expr=(85-70)%2F10',
    exampleText: 'z = (85 - 70) / 10',
    badgeLabel: 'z-Score',
  },

  // ─── Logarithms & Exponentials ────────────────────────────────────────────
  'log-1': {
    url: '/calculator?expr=log(100)%20%2B%20log(50)',
    exampleText: 'log(100) + log(50)',
    badgeLabel: 'Product Rule',
  },
  'log-3': {
    url: '/calculator?expr=5*log(2)',
    exampleText: 'log(2⁵) = 5·log(2)',
    badgeLabel: 'Power Rule',
  },
  'log-4': {
    url: '/calculator?expr=log(32)%2Flog(2)',
    exampleText: 'log₂(32) = log 32 / log 2',
    badgeLabel: 'Change of Base',
  },

  // ─── Vectors & Matrices ───────────────────────────────────────────────────
  'vec-1': {
    url: '/calculator?expr=3*(-2)%20%2B%204*5',
    exampleText: '[3, 4] · [-2, 5]',
    badgeLabel: 'Dot Product',
  },
  'vec-3': {
    url: '/calculator?expr=sqrt(3^2%20%2B%20(-4)^2%20%2B%2012^2)',
    exampleText: '|[3, -4, 12]|',
    badgeLabel: 'Vector Magnitude',
  },
  'vec-7': {
    url: '/matrix-solver',
    exampleText: 'det([[2, 3], [1, 4]])',
    badgeLabel: 'Matrix Determinant',
  },
  'vec-8': {
    url: '/matrix-solver',
    exampleText: 'inv([[2, 1], [5, 3]])',
    badgeLabel: 'Matrix Inverse',
  },

  // ─── Number Theory ────────────────────────────────────────────────────────
  'nt-1': {
    url: '/gcd-lcm-calculator',
    exampleText: 'gcd(48, 180) & lcm',
    badgeLabel: 'GCD & LCM',
  },
  'nt-5': {
    url: '/gcd-lcm-calculator',
    exampleText: 'Euclidean Algorithm (252, 105)',
    badgeLabel: 'Euclidean GCD',
  },

  // ─── Sets & Functions ─────────────────────────────────────────────────────
  'set-3': {
    url: '/calculator?expr=35%20%2B%2028%20-%2015',
    exampleText: '|A ∪ B| = 35 + 28 - 15',
    badgeLabel: 'Inclusion-Exclusion',
  },
  'set-5': {
    url: '/equation-solver-with-steps?eq=2*(3x%20%2B%201)%20-%205%20%3D%200',
    exampleText: 'f(g(x)) = 2(3x + 1) - 5 = 0',
    badgeLabel: 'Composite Function',
  },
};

export interface SyllabusSection {
  id: string;
  title: string;
  shortLabel: string;
  icon: string;
  description: string;
  formulas: FormulaEntry[];
}

/**
 * Cleanly organizes an array of formulas for an exam board into standardized
 * syllabus modules requested by students and teachers:
 * 1. Algebra & Sequences
 * 2. Quadratics & Polynomials
 * 3. Trigonometry & Identities
 * 4. Calculus (Differentiation & Integration)
 * 5. Geometry, Mensuration & Vectors
 * 6. Statistics & Probability
 */
export function groupFormulasBySyllabus(
  formulas: FormulaEntry[],
  boardId: BoardId
): SyllabusSection[] {
  const quadratics: FormulaEntry[] = [];
  const algebra: FormulaEntry[] = [];
  const trigonometry: FormulaEntry[] = [];
  const calculus: FormulaEntry[] = [];
  const geometry: FormulaEntry[] = [];
  const statistics: FormulaEntry[] = [];

  for (const f of formulas) {
    const isQuad =
      f.id === 'alg-1' ||
      f.id === 'alg-11' ||
      f.id === 'alg-12' ||
      f.id === 'geom-7' ||
      f.tags.includes('quadratic');

    if (isQuad) {
      quadratics.push(f);
    } else if (f.category === 'calculus') {
      calculus.push(f);
    } else if (f.category === 'trigonometry') {
      trigonometry.push(f);
    } else if (f.category === 'probability') {
      statistics.push(f);
    } else if (f.category === 'geometry' || f.category === 'mensuration' || f.category === 'vectors') {
      geometry.push(f);
    } else {
      // algebra, logarithms, numberTheory, complex, setsAndFunctions
      algebra.push(f);
    }
  }

  const sections: SyllabusSection[] = [
    {
      id: 'algebra',
      title: 'Algebra & Sequences',
      shortLabel: 'Algebra',
      icon: '📌',
      description:
        'Essential algebraic identities, binomial theorem expansions, arithmetic progression (AP), and geometric progression (GP) series formulas.',
      formulas: algebra,
    },
    {
      id: 'quadratics',
      title: 'Quadratics & Polynomials',
      shortLabel: 'Quadratics',
      icon: '⚡',
      description:
        'Quadratic formula, completing the square, factoring quadratic trinomials, discriminant nature of roots, and Vieta’s formulas.',
      formulas: quadratics,
    },
    {
      id: 'trigonometry',
      title: 'Trigonometry & Identities',
      shortLabel: 'Trigonometry',
      icon: '📐',
      description:
        'Fundamental Pythagorean identities, Sine and Cosine rules for triangles, compound angle, double angle, and half angle formulas.',
      formulas: trigonometry,
    },
    {
      id: 'calculus',
      title: 'Calculus (Differentiation & Integration)',
      shortLabel: 'Calculus',
      icon: '📈',
      description:
        'Derivative rules (Power, Product, Quotient, Chain), standard trigonometric and exponential derivatives, and integration by parts and substitution.',
      formulas: calculus,
    },
    {
      id: 'geometry',
      title: 'Geometry, Mensuration & Vectors',
      shortLabel: 'Geometry',
      icon: '📏',
      description:
        '2D coordinate geometry (distance, midpoint, slopes, circle equations), 3D surface area and volume, and vector dot products.',
      formulas: geometry,
    },
    {
      id: 'statistics',
      title: 'Statistics & Probability',
      shortLabel: 'Statistics',
      icon: '🎲',
      description:
        'Permutations and combinations, probability addition/multiplication laws, conditional probability, binomial distribution, and standard deviation.',
      formulas: statistics,
    },
  ];

  // Only return sections that contain formulas for this board
  return sections.filter((s) => s.formulas.length > 0);
}
