import { Menu, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useThemeStore } from '../store/themeStore';

export const TopBar = ({ title }: { title: string }) => {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggle);

  return (
    <header className="h-16 bg-background-secondary border-b border-border flex items-center px-6 sticky top-0 z-30">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-card-secondary text-text-secondary">
        <Menu size={20} />
      </button>
      <h2 className="ml-4 text-lg font-semibold text-text-primary">{title}</h2>
      <div className="ml-auto">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2 rounded-lg hover:bg-card-secondary text-text-secondary hover:text-text-primary transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
