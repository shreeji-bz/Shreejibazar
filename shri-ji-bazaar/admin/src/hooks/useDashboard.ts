import { useState } from 'react';

export function useDashboard() {
  const [stats, setStats] = useState<any>(null);
  return { stats, setStats };
}
