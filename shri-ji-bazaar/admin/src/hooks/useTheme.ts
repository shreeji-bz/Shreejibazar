import { useState, useCallback } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const toggle = useCallback(() => setIsDark(d => !d), []);
  return { isDark, toggle };
}
