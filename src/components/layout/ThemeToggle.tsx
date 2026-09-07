'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

/**
 * Three-state theme toggle (System Auto -> Light -> Dark).
 * Shows current mode icon and switches on click.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, cycleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Avoid SSR hydration mismatch
    return (
      <div
        className={`w-8 h-8 rounded-xl p-1.5 flex items-center justify-center opacity-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const getLabel = () => {
    if (theme === 'system') return 'Theme: System (Auto)';
    if (theme === 'dark') return 'Theme: Dark';
    return 'Theme: Light';
  };

  const getNextAction = () => {
    if (theme === 'system') return 'Switch theme (Light / Dark / Auto)';
    if (theme === 'light') return 'Switch to Dark mode';
    return 'Switch to System mode';
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={`relative group rounded-xl p-1.5 sm:p-2 transition-all duration-150 flex items-center justify-center text-[#5D4037] hover:bg-[#EFEBE9] dark:text-[#D7CCC8] dark:hover:bg-[#22201F] cursor-pointer select-none ${className}`}
      aria-label={`${getLabel()} - ${getNextAction()}`}
      title={`${getLabel()} (Click to cycle)`}
    >
      {theme === 'system' ? (
        <Laptop size={17} className="transition-transform group-hover:scale-110" />
      ) : theme === 'dark' ? (
        <Moon size={17} className="transition-transform group-hover:scale-110" />
      ) : (
        <Sun size={17} className="transition-transform group-hover:scale-110" />
      )}
      <span className="sr-only">{getLabel()}</span>
    </button>
  );
}

