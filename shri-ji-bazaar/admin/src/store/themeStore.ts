import { create } from 'zustand';

const THEME_KEY = 'sjb-admin-theme';

const readStoredTheme = (): boolean => {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark';
  } catch {
    return false;
  }
};

const applyThemeClass = (dark: boolean) => {
  document.documentElement.classList.toggle('dark', dark);
};

interface ThemeStore {
  isDark: boolean;
  setTheme: (dark: boolean) => void;
  toggle: () => void;
}

const initialDark = readStoredTheme();
applyThemeClass(initialDark);

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: initialDark,
  setTheme: (dark) => {
    applyThemeClass(dark);
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
    set({ isDark: dark });
  },
  toggle: () => {
    const dark = !useThemeStore.getState().isDark;
    applyThemeClass(dark);
    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
    set({ isDark: dark });
  },
}));
