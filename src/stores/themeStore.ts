import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Theme store — persisted to localStorage.
 * Initial theme is null until initialized from system preference (or restored from storage).
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: null,
      setTheme: (theme: Theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme;
        // If current is null, check system preference to determine current active state
        const isCurrentDark =
          current === 'dark' ||
          (current === null &&
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);

        set({ theme: isCurrentDark ? 'light' : 'dark' });
      },
    }),
    {
      name: 'mathhub-theme-mode',
    }
  )
);


