'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, FunctionSquare, LineChart, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { ThemeToggle } from './ThemeToggle';
import { ShortcutsModal } from './ShortcutsModal';

/** Navigation items for the core modules. */
const NAV_ITEMS = [
  { href: '/calculator', label: 'Calculator', icon: Calculator, badge: 'fx' },
  { href: '/solver', label: 'Equation', icon: FunctionSquare, badge: 'ax' },
  { href: '/graph', label: 'Graph', icon: LineChart, badge: '2D' },
  { href: '/formulas', label: 'Formulas', icon: BookOpen, badge: 'Σ' },
] as const;

/**
 * Material 3 & Instrument-Grade Navigation Bar.
 * - Mobile: Fixed bottom bar in White (Light) / #131313 (Dark) with Material 3 pill indicator in Brown (#5D4037).
 * - Desktop/Tablet (lg+): Persistent left sidebar in White (Light) / #131313 (Dark) with active states in #5D4037.
 */
export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Material 3 Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E0E0E0] dark:border-[#2E2825] bg-white/95 dark:bg-[#131313]/95 backdrop-blur-lg lg:hidden shadow-xs">
        <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 py-1 px-3 group select-none relative"
                aria-label={label}
              >
                {/* Material 3 Pill Indicator */}
                <div
                  className={clsx(
                    'flex items-center justify-center px-4 py-1 rounded-full transition-all duration-200 ease-out',
                    isActive
                      ? 'bg-[#5D4037] text-white shadow-xs scale-100'
                      : 'bg-transparent text-[#616161] hover:text-[#131313] hover:bg-[#F5F5F5] dark:text-[#A19891] dark:hover:text-white dark:hover:bg-[#1B1B1B] scale-95'
                  )}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={clsx(
                    'text-[10px] tracking-tight transition-colors duration-150',
                    isActive
                      ? 'text-[#5D4037] dark:text-white font-bold'
                      : 'text-[#616161] group-hover:text-[#131313] dark:text-[#A19891] dark:group-hover:text-white font-medium'
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
          <div className="flex items-center gap-1 py-1">
            <ShortcutsModal />
            <ThemeToggle className="p-1.5" />
          </div>
        </div>
      </nav>

      {/* Desktop & Tablet Persistent Left Sidebar */}
      <nav className="fixed left-0 top-0 z-50 hidden h-full w-20 lg:w-56 flex-col justify-between border-r border-[#E0E0E0] dark:border-[#2E2825] bg-white dark:bg-[#131313] py-5 px-3 lg:flex select-none shadow-xs">
        {/* Top Section: Brand & Navigation */}
        <div className="flex flex-col gap-6">
          {/* Brand Identity */}
          <Link
            href="/calculator"
            className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#1B1B1B] transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5D4037] text-white font-bold text-lg shadow-sm border border-[#795548]/40 shrink-0">
              E
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="font-bold text-sm tracking-wide text-[#131313] dark:text-white font-sans">
                EasyEquate
              </span>
              <span className="text-[10px] font-mono text-[#5D4037] dark:text-[#A19891] uppercase tracking-wider font-semibold">
                Studio
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={clsx(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 relative group',
                    isActive
                      ? 'bg-[#5D4037] text-white font-semibold shadow-xs'
                      : 'text-[#616161] hover:bg-[#EFEBE9] hover:text-[#5D4037] dark:text-[#A19891] dark:hover:bg-[#1B1B1B] dark:hover:text-white font-medium'
                  )}
                >
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="shrink-0 transition-transform group-hover:scale-105"
                  />
                  <span className="hidden lg:inline text-xs font-sans tracking-tight">
                    {label}
                  </span>
                  <span
                    className={clsx(
                      'hidden lg:inline-block ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded',
                      isActive
                        ? 'bg-[#3E2723] text-[#D7CCC8]'
                        : 'bg-[#F5F5F5] text-[#757575] group-hover:bg-[#D7CCC8]/60 group-hover:text-[#3E2723] dark:bg-[#1B1B1B] dark:text-[#8D827A] dark:group-hover:text-[#D7CCC8]'
                    )}
                  >
                    {badge}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Instrument Status, Theme Toggle & Legal Links */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-[#E0E0E0] dark:border-[#2E2825]">
          <div className="flex items-center justify-between px-2 text-[10px] font-mono text-[#757575] dark:text-[#8D827A]">
            <span className="hidden lg:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#5D4037] animate-pulse" />
              <span>Studio</span>
            </span>
            <div className="flex items-center gap-1 ml-auto">
              <ShortcutsModal />
              <ThemeToggle />
            </div>
          </div>

          {/* Desktop Footer Legal Links for AdSense / Search Discovery */}
          <div className="hidden lg:flex flex-wrap items-center gap-x-2.5 gap-y-1 px-2 pt-1 border-t border-[#E0E0E0]/60 dark:border-[#2E2825]/60 text-[10px] text-[#757575] dark:text-[#8D827A]">
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
      </nav>
    </>
  );
}
