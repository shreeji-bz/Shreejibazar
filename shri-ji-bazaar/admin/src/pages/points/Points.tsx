import { useEffect, useState } from 'react';
import { getUsers } from '../../services/authService';
import { TableRow, TableCell } from '../../components/common/Table';
import { AdminStatsCard } from '../../components/common/StatsCard';
import { Wallet } from 'lucide-react';

interface User { id: string; name: string; mobile: string; balance: number; }

export const Points = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => { getUsers({ page: 1, limit: 50 }).then((data: any) => { if (data.success) setUsers(data.data); }); }, []);

  const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Points</h1>
      <div className="mb-6"><AdminStatsCard title="Total Points in Circulation" value={totalBalance.toLocaleString()} icon={Wallet} /></div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary"><tr><th className="px-4 py-3 text-left text-text-muted">User</th><th className="px-4 py-3 text-left text-text-muted">Mobile</th><th className="px-4 py-3 text-left text-text-muted">Balance</th></tr></thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.mobile}</TableCell>
                <TableCell className="text-gold-bright font-semibold">{u.balance?.toLocaleString() || 0}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Points;
