import { useState, useEffect } from 'react';
import { get } from '../../services/api';

type ResultRow = {
  id: string;
  round_id: string;
  game_name?: string;
  winning_number?: number;
  status: string;
  declared_at?: string;
};

export const ResultsPage = () => {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await get<{ success: boolean; data: ResultRow[] }>('/v1/admin/results');
        if (res?.success) setRows(res.data);
      } catch (e: any) {
        setError(e.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold" /></div>;
  if (error) return <div className="p-6 text-error">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Results Management</h1>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {rows.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No results declared yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-card-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Round</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Game</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Winning Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Declared At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-card-secondary">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">#{r.round_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">{r.game_name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary">{r.winning_number ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === 'declared' ? 'bg-success/15 text-success' : 'bg-gold/15 text-gold'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{r.declared_at ? new Date(r.declared_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
