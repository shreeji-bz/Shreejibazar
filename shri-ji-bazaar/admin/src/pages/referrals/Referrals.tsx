import { useEffect, useState } from 'react';
import { getReferrals } from '../../services/authService';
import { TableRow, TableCell } from '../../components/common/Table';

interface Referral { id: string; referrerName: string; referredUserName: string; points: number; status: string; createdAt: string; }

export const Referrals = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  useEffect(() => { getReferrals({ page: 1, limit: 50 }).then((data: any) => { if (data.success) setReferrals(data.data); }); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Referrals</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary"><tr><th className="px-4 py-3 text-left text-text-muted">Referrer</th><th className="px-4 py-3 text-left text-text-muted">Referred User</th><th className="px-4 py-3 text-left text-text-muted">Points</th><th className="px-4 py-3 text-left text-text-muted">Status</th></tr></thead>
          <tbody className="divide-y divide-border">
            {referrals.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.referrerName}</TableCell>
                <TableCell>{r.referredUserName}</TableCell>
                <TableCell className="text-gold-bright">{r.points}</TableCell>
                <TableCell>{r.status}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Referrals;
