'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Menu,
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
  Home as HomeIcon,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ThemeToggle } from './ThemeToggle';
import { ShortcutsModal } from './ShortcutsModal';

interface NavCategory {
  category: string;
  items: {
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
  }[];
}

const TOOL_GROUPS: NavCategory[] = [
  {
    category: 'Core Workstations',
    items: [
      { href: '/', label: 'Home Studio', icon: HomeIcon, badge: 'Hub' },
      { href: '/calculator', label: 'Scientific Calculator', icon: Calculator, badge: 'fx' },
      { href: '/graph', label: '2D Graph Plotter', icon: LineChart, badge: '2D' },
      { href: '/unit-converter', label: 'Unit Converter', icon: ArrowRightLeft, badge: 'Units' },
      { href: '/formulas', label: 'Formula Library', icon: BookOpen, badge: 'Σ' },
    ],
  },
  {
    category: 'Dedicated Solvers',
    items: [
      { href: '/quadratic-equation-solver', label: 'Quadratic Solver', icon: FunctionSquare, badge: 'ax²' },
      { href: '/equation-solver-with-steps', label: 'Polynomial & Algebra', icon: Superscript, badge: 'Steps' },
      { href: '/system-of-equations', label: 'System of Equations', icon: FunctionSquare, badge: 'Sys' },
      { href: '/inequality-solver', label: 'Inequality Solver', icon: FunctionSquare, badge: '≤ ≥' },
      { href: '/derivative-calculator', label: 'Derivative Calculator', icon: Split, badge: 'd/dx' },
      { href: '/integral-calculator', label: 'Integral Calculator', icon: Binary, badge: '∫' },
      { href: '/matrix-solver', label: 'Matrix Calculator', icon: Grid3X3, badge: 'Mat' },
    ],
  },
  {
    category: 'Guides & Exam Sheets',
    items: [
      { href: '/formula-sheet/gcse', label: 'GCSE Formula Sheet', icon: BookOpen },
      { href: '/formula-sheet/a-level', label: 'A-Level Formula Sheet', icon: BookOpen },
      { href: '/learn', label: 'Learning Guides & Tutorials', icon: HelpCircle },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close the drawer when navigating to a new route
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // On the Home page (/), do not show the hamburger button or persistent sidebar
  const isHomePage = pathname === '/';

  if (isHomePage) {
    return null;
  }

  return (
    <>
      {/* Floating Top Floating Hamburger Bar (Visible on all tool pages) */}
      <div className="fixed top-3 left-3 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 dark:bg-[#1B1B1B]/95 backdrop-blur-md border border-[#E0E0E0] dark:border-[#2E2825] text-[#131313] dark:text-white shadow-md hover:bg-[#F5F5F5] dark:hover:bg-[#252322] hover:border-[#5D4037]/50 transition-all select-none group cursor-pointer"
          aria-label="Open Workstations Menu"
          title="All Tools & Solvers"
        >
          <Menu size={18} className="text-[#5D4037] dark:text-[#D7CCC8] group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold tracking-tight hidden sm:inline">Tools</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/95 dark:bg-[#1B1B1B]/95 backdrop-blur-md border border-[#E0E0E0] dark:border-[#2E2825] text-[#616161] hover:text-[#5D4037] dark:text-[#A19891] dark:hover:text-white shadow-md hover:bg-[#F5F5F5] dark:hover:bg-[#252322] transition-colors text-xs font-medium"
          title="Back to Home"
        >
          <HomeIcon size={16} />
          <span className="hidden md:inline">Home</span>
        </Link>

        <ThemeToggle className="p-2 rounded-xl bg-white/95 dark:bg-[#1B1B1B]/95 backdrop-blur-md border border-[#E0E0E0] dark:border-[#2E2825] shadow-md hover:bg-[#F5F5F5] dark:hover:bg-[#252322]" />
      </div>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-fade-in transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer Panel */}
      <aside
        className={clsx(
          'fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-white dark:bg-[#1B1B1B] border-r border-[#E0E0E0] dark:border-[#2E2825] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out select-none',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#E0E0E0] dark:border-[#2E2825] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
            <Image
              src="/logo.png"
              alt="EasyEquate"
              width={32}
              height={32}
              className="rounded-lg shadow-xs object-contain border border-[#5D4037]/30"
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[#131313] dark:text-white font-sans">EasyEquate</span>
              <span className="text-[10px] font-mono text-[#5D4037] dark:text-[#A19891] uppercase tracking-wider font-semibold">
                Studio Workstations
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-[#616161] hover:text-[#131313] hover:bg-[#F5F5F5] dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#2A2827] transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {TOOL_GROUPS.map((group) => (
            <div key={group.category} className="space-y-1.5">
              <div className="px-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#757575] dark:text-[#8D827A]">
                {group.category}
              </div>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon: Icon, badge }) => {
                  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={clsx(
                        'flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 group',
                        isActive
                          ? 'bg-[#5D4037] text-white font-semibold shadow-xs'
                          : 'text-[#616161] hover:bg-[#EFEBE9] hover:text-[#5D4037] dark:text-[#A19891] dark:hover:bg-[#252322] dark:hover:text-white font-medium'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={18}
                          strokeWidth={isActive ? 2.5 : 2}
                          className="shrink-0 transition-transform group-hover:scale-105"
                        />
                        <span>{label}</span>
                      </div>
                      {badge && (
                        <span
                          className={clsx(
                            'text-[10px] font-mono px-1.5 py-0.5 rounded',
                            isActive
                              ? 'bg-[#3E2723] text-[#D7CCC8]'
                              : 'bg-[#F5F5F5] text-[#757575] dark:bg-[#22201F] dark:text-[#8D827A]'
                          )}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer Controls & Legal */}
        <div className="p-3 border-t border-[#E0E0E0] dark:border-[#2E2825] bg-[#FAFAFA] dark:bg-[#171717] space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-mono text-[#757575] dark:text-[#8D827A] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Solvers Ready</span>
            </span>
            <div className="flex items-center gap-1">
              <ShortcutsModal />
              <ThemeToggle className="p-1.5" />
            </div>
          </div>

          <div className="flex items-center justify-around pt-2 border-t border-[#E0E0E0]/60 dark:border-[#2E2825]/60 text-[11px] text-[#757575] dark:text-[#8D827A]">
            <Link href="/about" className="hover:text-[#5D4037] dark:hover:text-white transition-colors">
              About
            </Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-[#5D4037] dark:hover:text-white transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#5D4037] dark:hover:text-white transition-colors">
              Terms
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#5D4037] dark:hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

