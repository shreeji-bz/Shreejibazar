import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const readStoredAuth = (): { token: string | null; user: User | null; isAuthenticated: boolean } => {
  try {
    const stored = localStorage.getItem('admin-auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.token) return { token: parsed.token, user: parsed.user || null, isAuthenticated: true };
    }
  } catch { /* ignore */ }
  return { token: null, user: null, isAuthenticated: false };
};

const initial = readStoredAuth();

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: initial.user,
      token: initial.token,
      isAuthenticated: initial.isAuthenticated,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
