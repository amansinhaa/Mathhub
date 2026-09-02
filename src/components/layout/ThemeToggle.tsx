'use client';

import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';

/**
 * Dark/Light mode toggle button styled with the Black, Brown, White theme.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`rounded-xl p-2 transition-all duration-150 flex items-center justify-center text-[#5D4037] hover:bg-[#EFEBE9] dark:text-[#D7CCC8] dark:hover:bg-[#22201F] ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
