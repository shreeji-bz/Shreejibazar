import { Menu } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export const TopBar = ({ title }: { title: string }) => {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);

  return (
    <header className="h-16 bg-background border-b border-border flex items-center px-6 sticky top-0 z-30">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-card-secondary text-text-secondary">
        <Menu size={20} />
      </button>
      <h2 className="ml-4 text-lg font-semibold text-text-primary">{title}</h2>
    </header>
  );
};
