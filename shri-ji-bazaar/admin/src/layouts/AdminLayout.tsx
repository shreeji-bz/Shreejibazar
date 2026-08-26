import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopBar title="Shri Ji Bazaar" />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
