import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { LayoutDashboard, Users, Gamepad2, Timer, Trophy, Wallet, Gift, Users2, Bell, Ticket, Image, FileText, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const menuItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/games', icon: Gamepad2, label: 'Games' },
  { to: '/rounds', icon: Timer, label: 'Rounds' },
  { to: '/results', icon: Trophy, label: 'Results' },
  { to: '/activities', icon: Wallet, label: 'Activities' },
  { to: '/points', icon: Wallet, label: 'Points' },
  { to: '/bonuses', icon: Gift, label: 'Bonuses' },
  { to: '/referrals', icon: Users2, label: 'Referrals' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/support', icon: Ticket, label: 'Support' },
  { to: '/banners', icon: Image, label: 'Banners' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/audit-logs', icon: FileText, label: 'Audit Logs' },
];

export const Sidebar = () => {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const { logout, user } = useAuthStore();

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4 border-b border-border">
        <h1 className={`text-gold-bright font-bold text-lg ${sidebarOpen ? '' : 'hidden'}`}>Shri Ji Bazaar</h1>
        {!sidebarOpen && <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-white text-xs font-bold">SJ</div>}
      </div>
      <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-60px)]">
        {menuItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-card-tertiary text-gold-bright' : 'text-text-secondary hover:bg-card-secondary hover:text-text-primary'}`}>
            <item.icon size={18} />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-error hover:bg-card-secondary w-full">
          <LogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </nav>
    </aside>
  );
};
