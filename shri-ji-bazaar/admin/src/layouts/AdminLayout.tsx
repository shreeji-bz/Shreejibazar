import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { useAppStore } from '../store/appStore';

export const AdminLayout = () => {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      {/* Track the fixed sidebar width so content clears it in both states. */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <TopBar title="Shri Ji Bazaar" />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
