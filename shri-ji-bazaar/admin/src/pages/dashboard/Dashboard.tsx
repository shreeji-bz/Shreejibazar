import { useEffect, useState } from 'react';
import { Users, Gamepad2, Wallet, Ticket, TrendingUp } from 'lucide-react';
import { getDashboard } from '../../services/authService';
import { AdminStatsCard } from '../../components/common/StatsCard';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  todayPlays: number;
  pointsDistributed: number;
  openTickets: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, activeUsers: 0, totalGames: 0, todayPlays: 0, pointsDistributed: 0, openTickets: 0 });

  useEffect(() => {
    getDashboard().then((data: any) => { if (data.success) setStats(data.data); });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminStatsCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} change="+12% this month" />
        <AdminStatsCard title="Active Users" value={stats.activeUsers.toLocaleString()} icon={TrendingUp} change="+5% this week" />
        <AdminStatsCard title="Total Games" value={stats.totalGames} icon={Gamepad2} />
        <AdminStatsCard title="Today's Plays" value={stats.todayPlays.toLocaleString()} icon={Wallet} change="+8% vs yesterday" />
        <AdminStatsCard title="Points Distributed" value={stats.pointsDistributed.toLocaleString()} icon={TrendingUp} />
        <AdminStatsCard title="Open Tickets" value={stats.openTickets} icon={Ticket} />
      </div>
    </div>
  );
};

export default Dashboard;
