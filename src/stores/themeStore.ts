import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'system' | 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

/**
 * Theme store — persisted to localStorage.
 * Default is 'system' which automatically respects the user's OS preference.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme: Theme) => set({ theme }),
      cycleTheme: () => {
        const current = get().theme;
        if (current === 'system') {
          // If in system mode, check current system dark state
          const isSystemDark =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches;
          // Switch to opposite of system
          set({ theme: isSystemDark ? 'light' : 'dark' });
        } else if (current === 'light') {
          set({ theme: 'dark' });
        } else {
          set({ theme: 'system' });
        }
      },
    }),
    {
      name: 'mathhub-theme-mode',
    }
  )
);

