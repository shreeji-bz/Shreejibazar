import { Link } from 'react-router-dom';
import { LayoutDashboard, Smartphone, Ticket, Settings, Users, Gamepad2, QrCode } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const QUICK_LINKS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/withdrawals/upi', icon: Smartphone, label: 'Withdrawal UPI' },
  { to: '/withdrawals/qr', icon: QrCode, label: 'Withdrawal QR' },
  { to: '/games', icon: Gamepad2, label: 'Games' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/support', icon: Ticket, label: 'Support' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

/**
 * Post-login landing screen (client spec: NOT the dashboard). First view is
 * the Shri Ji Bazaar brand; the full menu opens from the hamburger (top-left).
 * Quick links cover the day-to-day actions.
 */
export const LandingPage = () => {
  const admin = useAuthStore((s) => s.user);

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="text-center mb-10">
        <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-xl shadow-gold/20 mb-5">
          <img src="/assets/logo.webp" alt="Shri Ji Bazaar" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl font-extrabold text-gold-bright tracking-wide">SHRI JI BAZAR</h1>
        <p className="text-text-muted mt-2">
          Welcome back{admin?.name ? `, ${admin.name}` : ''} — open the menu (≡ top-left) or start with a quick action:
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-gold transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-card-secondary flex items-center justify-center">
              <q.icon className="text-gold-bright" size={22} />
            </div>
            <span className="text-sm font-semibold text-text-primary">{q.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
