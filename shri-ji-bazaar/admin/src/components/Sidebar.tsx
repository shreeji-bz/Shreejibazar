import { NavLink } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { LayoutDashboard, Users, Gamepad2, Timer, Trophy, Wallet, Gift, Users2, Bell, Ticket, Image, FileText, Settings, LogOut, Receipt, CreditCard, Shield, Coins, Smartphone, QrCode, Landmark, BarChart3, SlidersHorizontal, ImagePlus, Package, Video, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const menuItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/games', icon: Gamepad2, label: 'Games' },
  { to: '/rounds', icon: Timer, label: 'Rounds' },
  { to: '/results', icon: Trophy, label: 'Results' },
  { to: '/activities', icon: Wallet, label: 'Activities' },
  { to: '/points', icon: Wallet, label: 'Points' },
  { to: '/wagers', icon: Receipt, label: 'Wagers' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/bonuses', icon: Gift, label: 'Bonuses' },
  { to: '/referrals', icon: Users2, label: 'Referrals' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/support', icon: Ticket, label: 'Support' },
  { to: '/banners', icon: Image, label: 'Banners' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/staff', icon: Shield, label: 'Staff' },
  { to: '/audit-logs', icon: FileText, label: 'Audit Logs' },
  { to: '/add-fund-report', icon: Coins, label: 'Add Fund Report' },
  { to: '/withdrawals/upi', icon: Smartphone, label: 'Withdrawal UPI' },
  { to: '/withdrawals/qr', icon: QrCode, label: 'Withdrawal QR' },
  { to: '/withdrawals/bank', icon: Landmark, label: 'Withdrawal Bank' },
  { to: '/jantri-report', icon: BarChart3, label: 'Jantri Report' },
  { to: '/games/rates', icon: SlidersHorizontal, label: 'Games Rate' },
  { to: '/app-images', icon: ImagePlus, label: 'App Image' },
  { to: '/apk-manager', icon: Package, label: 'Apk Manager' },
  { to: '/videos', icon: Video, label: 'Video' },
  { to: '/contact-settings', icon: MessageCircle, label: 'Contact Settings' },
];

export const Sidebar = () => {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const { logout } = useAuthStore();

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden">
          <img src="/assets/logo.webp" alt="Shri Ji Bazaar" className="w-full h-full object-cover" />
        </div>
        {sidebarOpen && (
          <div>
            <h1 className="text-gold-bright font-bold text-base leading-tight">Shri Ji Bazaar</h1>
            <p className="text-text-muted text-xs">Admin</p>
          </div>
        )}
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
