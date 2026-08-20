'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calculator, FunctionSquare, LineChart, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';

/** Navigation items for the four core modules. */
const NAV_ITEMS = [
  { href: '/calculator', label: 'Calculator', icon: Calculator },
  { href: '/solver', label: 'Solver', icon: FunctionSquare },
  { href: '/graph', label: 'Graph', icon: LineChart },
  { href: '/formulas', label: 'Formulas', icon: BookOpen },
] as const;

/**
 * Persistent navigation bar.
 * - Mobile: fixed bottom bar with icons + labels
 * - Desktop (lg+): fixed left sidebar with icons + labels
 */
export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-all duration-150',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-all duration-150"
                />
                <span className={clsx('font-medium', isActive && 'font-semibold')}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop side nav */}
      <nav className="fixed left-0 top-0 z-50 hidden h-full w-20 flex-col items-center border-r border-[var(--card-border)] bg-[var(--background)]/95 backdrop-blur-md py-6 lg:flex">
        {/* Logo */}
        <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white font-bold text-lg">
          M
        </div>

        {/* Nav items */}
        <div className="flex flex-1 flex-col items-center gap-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={clsx(
                  'flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-[10px] transition-all duration-150',
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={clsx('font-medium', isActive && 'font-semibold')}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
