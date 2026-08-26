import { useState, useCallback } from 'react';

export function useGames() {
  const [games, setGames] = useState<any[]>([]);
  const fetchGames = useCallback(async () => {}, []);
  return { games, fetchGames, setGames };
}
