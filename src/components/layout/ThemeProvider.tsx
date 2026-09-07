'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

/**
 * ThemeProvider applies the dark/light class to <html> based on Zustand store.
 * If user hasn't explicitly picked light or dark (theme === null), it defaults to system OS preference.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference by default
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();

    // If user has not explicitly chosen, adapt automatically when system switches
    const handleChange = () => {
      if (theme === null) {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return <>{children}</>;
}


