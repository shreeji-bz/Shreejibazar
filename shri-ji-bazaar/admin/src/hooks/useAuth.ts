import { useState, useCallback } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const login = useCallback(async (_email: string, _password: string) => {}, []);
  const logout = useCallback(() => setUser(null), []);
  return { user, login, logout, isAuthenticated: !!user };
}

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const fetchUsers = useCallback(async () => {}, []);
  return { users, fetchUsers, setUsers };
}

export function useGames() {
  const [games, setGames] = useState<any[]>([]);
  const fetchGames = useCallback(async () => {}, []);
  return { games, fetchGames, setGames };
}

export function useRounds() {
  const [rounds, setRounds] = useState<any[]>([]);
  return { rounds, setRounds };
}

export function useResults() {
  const [results, setResults] = useState<any[]>([]);
  return { results, setResults };
}

export function useDashboard() {
  const [stats, setStats] = useState<any>(null);
  return { stats, setStats };
}

export function useTable<T>(initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  return { data, setData, page, setPage };
}

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const toggle = useCallback(() => setIsDark(d => !d), []);
  return { isDark, toggle };
}
