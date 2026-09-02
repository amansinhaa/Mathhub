import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme | null;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Theme store — persisted to localStorage.
 * `null` theme means "not yet initialized" → will read system preference.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme: Theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme;
        set({ theme: current === 'dark' ? 'light' : 'dark' });
      },
    }),
    {
      name: 'mathhub-theme',
    }
  )
);
