import { create } from 'zustand';

interface AppStore {
  sidebarOpen: boolean;
  theme: 'dark';
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
