import { create } from 'zustand';

interface AppStore {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Collapsed by default: the client wants the brand view first; the full
  // menu opens from the hamburger (≡) in the TopBar.
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
