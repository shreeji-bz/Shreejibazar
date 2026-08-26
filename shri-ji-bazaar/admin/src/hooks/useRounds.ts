import { useState } from 'react';

export function useRounds() {
  const [rounds, setRounds] = useState<any[]>([]);
  return { rounds, setRounds };
}
