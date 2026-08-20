'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

/**
 * ThemeProvider applies the dark/light class to <html> based on Zustand store.
 * On first load, reads system preference if no stored preference exists.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // If no stored theme, detect system preference
    if (!theme) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [theme, setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}
