'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Calculator,
  LineChart,
  FunctionSquare,
  Superscript,
  Grid3X3,
  Split,
  Binary,
  BookOpen,
  ArrowRightLeft,
  Percent,
  Divide,
  GraduationCap,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

export interface SearchItem {
  id: string;
  title: string;
  href: string;
  category: 'Tools & Solvers' | 'Study Guides' | 'Formula Sheets';
  description: string;
  badge?: string;
  icon: LucideIcon;
  tags: string[];
}

export const SEARCH_ITEMS: SearchItem[] = [
  // 1. Tools & Solvers
  {
    id: 'calculator',
    title: 'Scientific Calculator',
    href: '/calculator',
    category: 'Tools & Solvers',
    description: 'Calculate arithmetic, fractions, powers, trigonometry (sin, cos, tan), square roots, and percentages.',
    badge: 'fx',
    icon: Calculator,
    tags: ['calculator', 'scientific', 'arithmetic', 'fractions', 'trig', 'sin', 'cos', 'tan', 'sqrt', 'power'],
  },
  {
    id: 'graph',
    title: '2D Graph Plotter',
    href: '/graph',
    category: 'Tools & Solvers',
    description: 'Plot functions and curves with turning points, roots, intercepts, and asymptotes.',
    badge: '2D',
    icon: LineChart,
    tags: ['graph', 'plotter', 'curve', 'parabola', 'intercepts', 'asymptote', 'turning points', 'plot'],
  },
  {
    id: 'quadratic',
    title: 'Quadratic Equation Solver',
    href: '/quadratic-equation-solver',
    category: 'Tools & Solvers',
    description: 'Solve ax² + bx + c = 0 with factoring, completing the square, and the quadratic formula.',
    badge: 'ax²',
    icon: FunctionSquare,
    tags: ['quadratic', 'roots', 'factoring', 'completing the square', 'quadratic formula', 'parabola', 'discriminant'],
  },
  {
    id: 'domain_range',
    title: 'Domain and Range Calculator',
    href: '/domain-and-range-calculator',
    category: 'Tools & Solvers',
    description: 'Find the domain and range of any function step-by-step in exact interval notation.',
    badge: '[a,b]',
    icon: FunctionSquare,
    tags: ['domain', 'range', 'interval notation', 'functions', 'restrictions', 'asymptotes', 'calculus'],
  },
  {
    id: 'polynomial',
    title: 'Polynomial & Algebra Solver',
    href: '/equation-solver-with-steps',
    category: 'Tools & Solvers',
    description: 'Step-by-step linear, quadratic, cubic, and higher-order polynomial equation solver with synthetic division.',
    badge: 'Steps',
    icon: Superscript,
    tags: ['polynomial', 'algebra', 'cubic', 'synthetic division', 'roots', 'factor theorem', 'solve equation'],
  },
  {
    id: 'derivative',
    title: 'Derivative Calculator',
    href: '/derivative-calculator',
    category: 'Tools & Solvers',
    description: 'Differentiate functions step-by-step with power, product, quotient, and chain rules.',
    badge: 'd/dx',
    icon: Split,
    tags: ['derivative', 'differentiation', 'd/dx', 'power rule', 'chain rule', 'product rule', 'calculus', 'slope'],
  },
  {
    id: 'integral',
    title: 'Integral Calculator',
    href: '/integral-calculator',
    category: 'Tools & Solvers',
    description: 'Calculate definite and indefinite integrals with substitution, parts, and area under curve.',
    badge: '∫',
    icon: Binary,
    tags: ['integral', 'integration', 'antiderivative', 'area under curve', 'u-substitution', 'parts', 'calculus'],
  },
  {
    id: 'percentage',
    title: 'Percentage Calculator',
    href: '/percentage-calculator',
    category: 'Tools & Solvers',
    description: 'Calculate percentage of numbers, percentage change, increase, decrease, discounts, and markups.',
    badge: '%',
    icon: Percent,
    tags: ['percentage', 'percent', 'percent change', 'increase', 'decrease', 'discount', 'tax', 'markup', 'ratio'],
  },
  {
    id: 'fraction',
    title: 'Fraction Calculator',
    href: '/fraction-calculator',
    category: 'Tools & Solvers',
    description: 'Add, subtract, multiply, and divide fractions with LCD, lowest terms reduction, and mixed numbers.',
    badge: '½',
    icon: Divide,
    tags: ['fraction', 'fractions', 'mixed numbers', 'improper fractions', 'lcd', 'simplify', 'numerator', 'denominator'],
  },
  {
    id: 'gcd-lcm',
    title: 'GCD & LCM Calculator',
    href: '/gcd-lcm-calculator',
    category: 'Tools & Solvers',
    description: 'Find the Greatest Common Divisor (HCF) and Least Common Multiple using Euclidean steps and prime factors.',
    badge: 'GCD',
    icon: Binary,
    tags: ['gcd', 'lcm', 'hcf', 'greatest common divisor', 'least common multiple', 'euclidean algorithm', 'prime factors'],
  },
  {
    id: 'system',
    title: 'System of Equations Solver',
    href: '/system-of-equations',
    category: 'Tools & Solvers',
    description: 'Solve simultaneous linear equations in 2 or 3 variables using elimination and substitution.',
    badge: 'Sys',
    icon: FunctionSquare,
    tags: ['system of equations', 'simultaneous', 'elimination', 'substitution', 'linear system', '2x2', '3x3'],
  },
  {
    id: 'matrix',
    title: 'Matrix Calculator',
    href: '/matrix-solver',
    category: 'Tools & Solvers',
    description: 'Calculate determinants, inverse matrices, matrix multiplication, transposes, and RREF.',
    badge: 'Mat',
    icon: Grid3X3,
    tags: ['matrix', 'matrices', 'determinant', 'inverse', 'rref', 'multiplication', 'eigenvalues', 'linear algebra'],
  },
  {
    id: 'inequality',
    title: 'Inequality Solver',
    href: '/inequality-solver',
    category: 'Tools & Solvers',
    description: 'Solve linear and quadratic inequalities with interval notation and step-by-step sign analysis.',
    badge: '≤ ≥',
    icon: FunctionSquare,
    tags: ['inequality', 'inequalities', 'greater than', 'less than', 'intervals', 'sign analysis'],
  },
  {
    id: 'units',
    title: 'Unit & Currency Converter',
    href: '/unit-converter',
    category: 'Tools & Solvers',
    description: 'Convert lengths (km to miles), weights (kg to lbs), temperatures (°C to °F), speed, and currencies.',
    badge: 'Units',
    icon: ArrowRightLeft,
    tags: ['unit converter', 'currency', 'convert', 'km to miles', 'celsius to fahrenheit', 'kg to lbs', 'exchange rate'],
  },

  // 2. Study Guides
  {
    id: 'guide-derivative',
    title: 'What is a Derivative?',
    href: '/learn/what-is-a-derivative',
    category: 'Study Guides',
    description: 'Intuitive guide explaining rates of change, speedometer examples, tangent lines, and power rule.',
    badge: 'Guide',
    icon: GraduationCap,
    tags: ['derivative', 'what is a derivative', 'rate of change', 'tangent slope', 'calculus guide'],
  },
  {
    id: 'guide-simultaneous',
    title: 'How to Solve Simultaneous Equations',
    href: '/learn/how-to-solve-simultaneous-equations',
    category: 'Study Guides',
    description: 'Master the 3 methods: elimination, substitution, and graphical intersection point.',
    badge: 'Guide',
    icon: GraduationCap,
    tags: ['simultaneous equations', 'how to solve', 'elimination', 'substitution', 'graphical method'],
  },
  {
    id: 'guide-limits',
    title: 'How to Find Limits in Calculus',
    href: '/learn/how-to-find-limits',
    category: 'Study Guides',
    description: 'Complete techniques for direct substitution, 0/0 indeterminate factoring, conjugates, and L’Hôpital’s Rule.',
    badge: 'Guide',
    icon: GraduationCap,
    tags: ['limits', 'calculus limits', 'how to find limits', 'l hopital', 'indeterminate form', '0/0'],
  },
  {
    id: 'guide-function',
    title: 'What is a Function?',
    href: '/learn/what-is-a-function',
    category: 'Study Guides',
    description: 'Understand functions, input/output machines, f(x) notation, and the vertical line test.',
    badge: 'Guide',
    icon: GraduationCap,
    tags: ['function', 'what is a function', 'f(x)', 'vertical line test', 'domain', 'range'],
  },
  {
    id: 'guide-domain-range',
    title: 'How to Find Domain and Range',
    href: '/learn/how-to-find-domain-and-range',
    category: 'Study Guides',
    description: 'Step-by-step method to identify domain restrictions, denominators, square roots, and range intervals.',
    badge: 'Guide',
    icon: GraduationCap,
    tags: ['domain and range', 'how to find domain', 'interval notation', 'restrictions', 'functions'],
  },
  {
    id: 'guide-graph-quadratic',
    title: 'How to Graph a Quadratic Function',
    href: '/learn/how-to-graph-a-quadratic-function',
    category: 'Study Guides',
    description: 'Find vertex x = -b/2a, axis of symmetry, x and y intercepts, and sketch parabolas easily.',
    badge: 'Guide',
    icon: GraduationCap,
    tags: ['graph quadratic', 'how to graph parabola', 'vertex', 'axis of symmetry', 'intercepts'],
  },

  // 3. Formula Sheets
  {
    id: 'formulas-hub',
    title: 'Formula Library (150+)',
    href: '/formulas',
    category: 'Formula Sheets',
    description: 'Comprehensive formula catalog covering algebra, trigonometry, calculus, geometry, and probability.',
    badge: 'Σ',
    icon: BookOpen,
    tags: ['formulas', 'formula sheet', 'math formulas', 'identities', 'algebra formulas', 'trig formulas'],
  },
  {
    id: 'sheet-gcse',
    title: 'GCSE Maths Formula Sheet',
    href: '/formula-sheet/gcse',
    category: 'Formula Sheets',
    description: 'All essential GCSE mathematics formulas for algebra, geometry, mensuration, and probability.',
    badge: 'GCSE',
    icon: BookOpen,
    tags: ['gcse', 'gcse maths', 'formula sheet', 'uk exam', 'revision'],
  },
  {
    id: 'sheet-a-level',
    title: 'A-Level Maths Formula Sheet',
    href: '/formula-sheet/a-level',
    category: 'Formula Sheets',
    description: 'A-Level mathematics formula reference covering calculus, vectors, trigonometry, and logarithms.',
    badge: 'A-Level',
    icon: BookOpen,
    tags: ['a level', 'a-level maths', 'calculus sheet', 'vectors', 'pure maths'],
  },
  {
    id: 'sheet-edexcel',
    title: 'Edexcel Maths Formula Sheet',
    href: '/formula-sheet/edexcel',
    category: 'Formula Sheets',
    description: 'Edexcel exam board mathematics formula breakdown for secondary and sixth-form students.',
    badge: 'Edexcel',
    icon: BookOpen,
    tags: ['edexcel', 'pearson', 'formula sheet', 'exam revision'],
  },
];

interface InteractiveSearchBarProps {
  mode?: 'hero' | 'drawer';
  placeholder?: string;
  onSelect?: () => void;
}

export default function InteractiveSearchBar({
  mode = 'hero',
  placeholder = 'Search calculators, solvers, formulas, guides...',
  onSelect,
}: InteractiveSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global hotkey: press '/' or 'Ctrl+K' / 'Cmd+K' to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered results
  const filteredResults = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean) {
      // In drawer mode or when empty, show top 5 popular tools as suggestions
      return mode === 'drawer' ? [] : SEARCH_ITEMS.slice(0, 4);
    }

    return SEARCH_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(clean);
      const matchDesc = item.description.toLowerCase().includes(clean);
      const matchCat = item.category.toLowerCase().includes(clean);
      const matchTags = item.tags.some((t) => t.toLowerCase().includes(clean));
      return matchTitle || matchDesc || matchCat || matchTags;
    });
  }, [query, mode]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation in list
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredResults[selectedIndex];
      if (target) {
        window.location.href = target.href;
        if (onSelect) onSelect();
      }
    }
  };

  const isHero = mode === 'hero';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <div
        className={`relative flex items-center transition-all duration-200 ${
          isHero
            ? 'rounded-2xl border border-[#D7CCC8] dark:border-[#3E2723] bg-white dark:bg-[#25201E] shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-[#5D4037] focus-within:border-transparent'
            : 'rounded-xl border border-[#E0E0E0] dark:border-[#2E2825] bg-white dark:bg-[#201D1B] focus-within:ring-2 focus-within:ring-[#5D4037]'
        }`}
      >
        <div className="pl-3.5 sm:pl-4 text-[#8D6E63] dark:text-[#A19891] pointer-events-none">
          <Search size={isHero ? 20 : 16} strokeWidth={2.2} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className={`w-full bg-transparent px-3 text-[#131313] dark:text-white placeholder-[#8D827A] focus:outline-none ${
            isHero ? 'py-3 sm:py-3.5 text-sm sm:text-base' : 'py-2 text-xs sm:text-sm'
          }`}
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1.5 mr-2 rounded-lg text-[#8D6E63] hover:text-[#131313] dark:text-[#A19891] dark:hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        ) : (
          isHero && (
            <div className="hidden sm:flex items-center gap-1 mr-3 pointer-events-none">
              <kbd className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] rounded-md border border-[#D7CCC8] dark:border-[#5D4037]">
                /
              </kbd>
            </div>
          )
        )}
      </div>

      {/* Live Dropdown Overlay */}
      {isOpen && (filteredResults.length > 0 || query.trim() !== '') && (
        <div
          className={`absolute left-0 right-0 z-50 mt-1.5 bg-white dark:bg-[#1C1A19] border border-[#D7CCC8] dark:border-[#3E2723] rounded-xl shadow-2xl overflow-hidden animate-in fade-in-50 duration-100 ${
            isHero ? 'max-h-[260px]' : 'max-h-[220px]'
          } overflow-y-auto`}
        >
          {filteredResults.length > 0 ? (
            <div className="p-1 sm:p-1.5 divide-y divide-[#F0EDE8] dark:divide-[#2A2624]">
              {!query.trim() && isHero && (
                <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8D6E63] dark:text-[#A19891] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-500" />
                    Popular Tools
                  </span>
                  <span className="text-[9px] font-normal lowercase text-[#A19891]">press &uarr;&darr; to navigate</span>
                </div>
              )}

              {filteredResults.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => {
                      setIsOpen(false);
                      if (onSelect) onSelect();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-2.5 py-1.5 sm:py-2 rounded-lg transition-colors text-left ${
                      isSelected
                        ? 'bg-[#EFEBE9] dark:bg-[#2D2622] text-[#5D4037] dark:text-white'
                        : 'text-[#131313] dark:text-[#E0E0E0] hover:bg-[#FDFBF7] dark:hover:bg-[#25201E]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-6 h-6 rounded-md bg-[#F5F2ED] dark:bg-[#25201E] text-[#5D4037] dark:text-[#D7CCC8] flex items-center justify-center shrink-0 border border-[#E0DCD6] dark:border-[#3E2723]">
                        <Icon size={13} />
                      </div>
                      <div className="min-w-0 flex items-baseline gap-2">
                        <span className="font-semibold text-xs sm:text-sm truncate text-[#131313] dark:text-white">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] shrink-0">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[11px] text-[#757575] dark:text-[#A19891] truncate hidden md:inline">
                          — {item.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-1">
                      <span className="text-[9px] uppercase font-mono tracking-wider text-[#8D6E63] dark:text-[#A19891] hidden sm:inline">
                        {item.category}
                      </span>
                      <ArrowRight size={12} className="text-[#8D6E63] dark:text-[#A19891]" />
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#757575] dark:text-[#A19891]">
              No results for &ldquo;<span className="font-semibold text-[#131313] dark:text-white">{query}</span>&rdquo;. Try searching &ldquo;derivative&rdquo; or &ldquo;fraction&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
