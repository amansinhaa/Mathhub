import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
  Calculator,
  LineChart,
  FunctionSquare,
  Superscript,
  Grid3X3,
  Split,
  Binary,
  ArrowRightLeft,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'EasyEquate: Free Online Math Solvers, Calculators & Grapher',
  description:
    'Free online mathematics calculators featuring a scientific calculator, 2D graph plotter, and step-by-step polynomial, quadratic, matrix, and calculus solvers. 100% free.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EasyEquate: Free Online Math Solvers, Calculators & Grapher',
    description:
      'Solve math problems step-by-step with free calculators for algebra, calculus, matrices, and 2D function graphing.',
    url: 'https://www.easyequate.com',
  },
};

interface Workstation {
  title: string;
  href: string;
  badge: string;
  badgeColor: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
}

const WORKSTATIONS: Workstation[] = [
  {
    title: 'Scientific Calculator',
    href: '/calculator',
    badge: 'Arithmetic',
    badgeColor: 'bg-[#EFEBE9] text-[#5D4037] dark:bg-[#3E2723] dark:text-[#D7CCC8]',
    description: 'Calculate fractions, powers, square roots, trigonometry (sin, cos, tan), and percentages with full step history.',
    icon: Calculator,
    tags: ['Fractions', 'Square Roots', 'Sin & Cos', 'Percentages'],
  },
  {
    title: '2D Graph Plotter',
    href: '/graph',
    badge: 'Graphing',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    description: 'Plot curves and functions. Inspect x and y intercepts, turning points, maximums, minimums, and asymptotes.',
    icon: LineChart,
    tags: ['X & Y Intercepts', 'Turning Points', 'Asymptotes', 'Parabolas'],
  },
  {
    title: 'Quadratic Solver',
    href: '/quadratic-equation-solver',
    badge: 'ax² + bx + c',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    description: 'Find roots of ax² + bx + c = 0 with full working using factoring, completing the square, or the quadratic formula.',
    icon: FunctionSquare,
    tags: ['Factoring', 'Quadratic Formula', 'Find Roots', 'Completing Square'],
  },
  {
    title: 'Polynomial & Algebra',
    href: '/equation-solver-with-steps',
    badge: 'Algebra',
    badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
    description: 'Solve linear, cubic, and higher-order equations using synthetic division, factor theorem, and grouping.',
    icon: Superscript,
    tags: ['Synthetic Division', 'Factor Theorem', 'Cubic Roots', 'Linear Equations'],
  },
  {
    title: 'Matrix Calculator',
    href: '/matrix-solver',
    badge: 'Matrices',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
    description: 'Calculate determinants, matrix inverses, matrix multiplication, transposes, and row reduction (RREF).',
    icon: Grid3X3,
    tags: ['Determinants', 'Matrix Inverse', 'Multiply Matrices', 'Row Reduction'],
  },
  {
    title: 'Derivative Calculator',
    href: '/derivative-calculator',
    badge: 'd/dx',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    description: 'Find the rate of change and slope of curves using the power rule, product rule, quotient rule, and chain rule.',
    icon: Split,
    tags: ['Power Rule', 'Chain Rule', 'Product Rule', 'Slope of Tangent'],
  },
  {
    title: 'Integral Calculator',
    href: '/integral-calculator',
    badge: '∫ f(x)dx',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
    description: 'Find the area under curves and antiderivatives using substitution, integration by parts, and definite limits.',
    icon: Binary,
    tags: ['Area Under Curve', 'Antiderivatives', 'U-Substitution', 'Integration by Parts'],
  },
  {
    title: 'Unit Converter',
    href: '/unit-converter',
    badge: 'Units',
    badgeColor: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300',
    description: 'Convert units of length (km to miles), mass (kg to lbs), temperature (°C to °F), speed, and currency exchange.',
    icon: ArrowRightLeft,
    tags: ['Length & Distance', 'Kg to Pounds', 'Celsius to Fahrenheit', 'Speed & Volume'],
  },
  {
    title: 'Formula Reference Hub',
    href: '/formulas',
    badge: 'Formulas',
    badgeColor: 'bg-[#EFEBE9] text-[#5D4037] dark:bg-[#3E2723] dark:text-[#D7CCC8]',
    description: 'Revision sheets for algebra identities, trigonometry formulas, geometry theorems, and board exam revision.',
    icon: BookOpen,
    tags: ['Algebra Identities', 'Trig Formulas', 'Geometry Rules', 'Exam Revision'],
  },
];

const POPULAR_PROBLEMS = [
  { label: 'Quadratic: x² - 5x + 6 = 0', href: '/quadratic-equation-solver' },
  { label: 'Derivative: d/dx [ 3x² + 5x ]', href: '/derivative-calculator' },
  { label: 'Integral: ∫ (2x + 1) dx', href: '/integral-calculator' },
  { label: 'Inequality: x² - 5x + 6 > 0', href: '/inequality-solver' },
  { label: 'System: 2x + y = 7, x - y = 2', href: '/system-of-equations' },
  { label: 'Matrix: 2×2 Inverses', href: '/matrix-solver' },
  { label: 'Plot: y = sin(x) · cos(x)', href: '/graph' },
  { label: 'Unit Converter', href: '/unit-converter' },
  { label: 'GCSE Revision Sheet', href: '/formula-sheet/gcse' },
];

export default function Home() {
  return (
    <div className="flex flex-col space-y-3 sm:space-y-6 pb-12 animate-fade-in text-[#131313] dark:text-[#F5F5F5]">
      {/* Top Brand Bar on Home */}
      <header className="flex items-center justify-between py-0.5 px-0.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="EasyEquate Logo"
            width={32}
            height={32}
            priority
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl shadow-xs border border-[#5D4037]/30 object-contain group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-lg text-[#131313] dark:text-white font-sans tracking-tight">
              EasyEquate
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono text-[#5D4037] dark:text-[#A19891] uppercase tracking-wider font-semibold">
              Studio
            </span>
          </div>
        </Link>
      </header>

      {/* Hero Welcome Header — Ultra-Compact on Mobile */}
      <section className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] p-3 sm:p-5 shadow-xs">
        {/* Subtle decorative dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#5D4037 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 max-w-3xl space-y-1.5 sm:space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EFEBE9] dark:bg-[#3E2723] border border-[#D7CCC8] dark:border-[#5D4037]/50 text-[#5D4037] dark:text-[#D7CCC8] text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Step-by-Step Math</span>
            </div>
            <span className="text-[10px] font-mono text-[#5D4037] dark:text-[#D7CCC8] font-semibold sm:hidden">
              9 Solvers
            </span>
          </div>

          <h1 className="text-base sm:text-2xl md:text-3xl font-bold tracking-tight text-[#131313] dark:text-white leading-tight">
            Solve Math Problems Step-by-Step
          </h1>

          <p className="text-xs sm:text-sm text-[#616161] dark:text-[#A19891] leading-relaxed hidden sm:block">
            Free step-by-step calculators for algebra, calculus, matrices, and graphing. See every line of working and formulas used.
          </p>

          {/* Quick Problem Pills - Scrollable single row on mobile to prevent tall wrapping */}
          <div className="pt-0.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 sm:flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase text-[#757575] dark:text-[#8D827A] shrink-0 mr-0.5">
              Try Example:
            </span>
            {POPULAR_PROBLEMS.map((prob) => (
              <Link
                key={prob.label}
                href={prob.href}
                className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#F5F5F5] hover:bg-[#EFEBE9] text-[#131313] hover:text-[#5D4037] dark:bg-[#22201F] dark:hover:bg-[#2E2825] dark:text-[#D7CCC8] border border-[#E0E0E0] dark:border-[#2E2825] transition-colors whitespace-nowrap shrink-0"
              >
                {prob.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Workstations Grid - 2x2 Layout on Android / Mobile */}
      <section className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between gap-1 pb-1 border-b border-[#E0E0E0] dark:border-[#2E2825]">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-[#131313] dark:text-white">
              Math Solvers & Calculators
            </h2>
            <p className="text-xs text-[#616161] dark:text-[#A19891] hidden sm:block">
              Choose a calculator to solve equations, plot graphs, or see step-by-step working.
            </p>
          </div>
          <span className="text-xs font-mono text-[#5D4037] dark:text-[#D7CCC8] font-semibold hidden sm:inline">
            {WORKSTATIONS.length} Math Solvers
          </span>
        </div>

        {/* 2 columns on mobile, 2 columns on tablet, 3 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3.5 md:gap-4">
          {WORKSTATIONS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group relative flex flex-col justify-between bg-white dark:bg-[#1B1B1B] hover:bg-[#FAFAFA] dark:hover:bg-[#201E1D] border border-[#E0E0E0] dark:border-[#2E2825] hover:border-[#5D4037]/50 dark:hover:border-[#5D4037]/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-1.5 sm:space-y-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#F5F5F5] dark:bg-[#24201E] flex items-center justify-center text-[#5D4037] dark:text-[#D7CCC8] group-hover:bg-[#5D4037] group-hover:text-white transition-colors shrink-0">
                      <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" strokeWidth={2} />
                    </div>
                    <span className={`text-[9px] sm:text-[11px] font-mono font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full truncate max-w-[80px] sm:max-w-none ${tool.badgeColor}`}>
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-base md:text-lg font-bold text-[#131313] dark:text-white group-hover:text-[#5D4037] dark:group-hover:text-[#D7CCC8] transition-colors flex items-center gap-1 leading-snug">
                      <span className="truncate">{tool.title}</span>
                      <ArrowRight
                        size={14}
                        className="hidden sm:inline opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#5D4037] dark:text-[#D7CCC8] shrink-0"
                      />
                    </h3>
                    <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm text-[#616161] dark:text-[#A19891] leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Highlighted Keyword Tags */}
                <div className="mt-2 sm:mt-3.5 pt-1.5 sm:pt-2.5 border-t border-[#E0E0E0]/80 dark:border-[#2E2825] flex flex-wrap items-center gap-1 sm:gap-1.5">
                  {tool.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] sm:text-[11px] font-mono font-medium px-1.5 sm:px-2 py-0.5 rounded-md bg-[#F4EFEA] text-[#4E342E] dark:bg-[#2A2320] dark:text-[#EFEBE9] border border-[#D7CCC8]/90 dark:border-[#5D4037]/70 shadow-2xs group-hover:border-[#5D4037]/50 transition-colors truncate max-w-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {tool.tags.length > 2 && (
                    <span className="hidden sm:inline-flex text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#F4EFEA] text-[#4E342E] dark:bg-[#2A2320] dark:text-[#EFEBE9] border border-[#D7CCC8]/90 dark:border-[#5D4037]/70 shadow-2xs group-hover:border-[#5D4037]/50 transition-colors">
                      {tool.tags[2]}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust & Educational Principles Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] p-4 sm:p-5 rounded-xl sm:rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] flex items-center justify-center">
            <Zap size={18} />
          </div>
          <h4 className="font-bold text-sm text-[#131313] dark:text-white">Instant Calculations</h4>
          <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
            Get instant solutions, curve plots, and step-by-step mathematical working in real-time as you enter problems.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] p-4 sm:p-5 rounded-xl sm:rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] flex items-center justify-center">
            <GraduationCap size={18} />
          </div>
          <h4 className="font-bold text-sm text-[#131313] dark:text-white">Full Step-by-Step Working</h4>
          <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
            See each step of the calculation, including formulas used, synthetic division, substitution, and final simplified roots.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1B1B1B] border border-[#E0E0E0] dark:border-[#2E2825] p-4 sm:p-5 rounded-xl sm:rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-[#EFEBE9] dark:bg-[#3E2723] text-[#5D4037] dark:text-[#D7CCC8] flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
          <h4 className="font-bold text-sm text-[#131313] dark:text-white">Free for Students & Teachers</h4>
          <p className="text-xs text-[#616161] dark:text-[#A19891] leading-relaxed">
            100% free with no sign-up or paywall. Easy access to all math solvers, graphing tools, and formula sheets anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
