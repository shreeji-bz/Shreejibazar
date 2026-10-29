import { useThemeStore } from '../store/themeStore';

export { useThemeStore };

export function useIsDark(): boolean {
  return useThemeStore((s) => s.isDark);
}
