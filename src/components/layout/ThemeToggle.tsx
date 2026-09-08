'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

/**
 * Dedicated top-right theme toggle (Light / Dark mode).
 * Picks system preference by default if no user choice is stored.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [isSystemDark, setIsSystemDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setIsSystemDark(mq.matches);
      const handler = (e: MediaQueryListEvent) => setIsSystemDark(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Active dark state is either explicit 'dark' or (when theme is null) system dark
  const isDarkActive = theme === 'dark' || (theme === null && isSystemDark);

  if (!mounted) {
    return (
      <div
        className={`w-9 h-9 rounded-xl p-2 flex items-center justify-center opacity-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative group rounded-xl p-2 transition-all duration-150 flex items-center justify-center text-[#5D4037] hover:bg-[#EFEBE9] dark:text-[#D7CCC8] dark:hover:bg-[#22201F] cursor-pointer select-none ${className}`}
      aria-label={`Switch to ${isDarkActive ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkActive ? 'light' : 'dark'} mode`}
    >
      {isDarkActive ? (
        <Sun size={18} className="transition-transform group-hover:rotate-45" />
      ) : (
        <Moon size={18} className="transition-transform group-hover:-rotate-12" />
      )}
      <span className="sr-only">Switch to {isDarkActive ? 'light' : 'dark'} mode</span>
    </button>
  );
}


