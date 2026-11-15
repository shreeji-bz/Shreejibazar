import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { get } from '../../services/api';

interface RoundRow {
  id: string;
  roundNumber?: number;
  game?: { name?: string } | string;
  status?: string;
  startTime?: string;
  [key: string]: any;
}

export const RoundsPage = () => {
  const [rounds, setRounds] = useState<RoundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await get<{ success: boolean; data: RoundRow[] }>('/v1/rounds');
        if (!res?.success) throw new Error('Failed to load rounds');
        if (!cancelled) setRounds(res.data ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to load rounds');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const getGameName = (game: RoundRow['game']) => {
    if (!game) return '-';
    if (typeof game === 'string') return game;
    return game.name ?? '-';
  };

  const statusBadge = (status?: string) => {
    const s = (status ?? 'unknown').toLowerCase();
    const map: Record<string, string> = {
      pending: 'bg-gold/15 text-gold',
      open: 'bg-success/15 text-success',
      closed: 'bg-card-tertiary text-text-muted',
      result_declared: 'bg-gold/15 text-gold',
    };
    return (
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${map[s] ?? 'bg-card-tertiary text-text-muted'}`}>
        {s.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Rounds Management</h1>
          <Link
            to="/rounds/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-text-primary rounded-lg hover:bg-gold-bright transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Create Round
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          {error && (
            <div className="mb-4 px-4 py-3 border border-error/30 bg-error/10 text-error rounded-lg text-sm">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-sm text-text-muted">Loading rounds...</span>
            </div>
          ) : rounds.length === 0 ? (
            <div className="text-center py-16 text-text-muted text-sm">No rounds found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 font-semibold text-text-primary">Round Number</th>
                    <th className="py-3 px-4 font-semibold text-text-primary">Game</th>
                    <th className="py-3 px-4 font-semibold text-text-primary">Status</th>
                    <th className="py-3 px-4 font-semibold text-text-primary">Start Time</th>
                    <th className="py-3 px-4 font-semibold text-text-primary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr key={r.id} className="border-b border-border hover:bg-card-secondary transition-colors">
                      <td className="py-3 px-4 text-text-primary font-medium">
                        {r.roundNumber != null ? `#${String(r.roundNumber).padStart(3, '0')}` : r.id}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{getGameName(r.game)}</td>
                      <td className="py-3 px-4">{statusBadge(r.status)}</td>
                      <td className="py-3 px-4 text-text-secondary">
                        {r.startTime
                          ? new Date(r.startTime).toLocaleString('en-IN')
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/rounds/${r.id}`}
                          className="inline-block px-3 py-1.5 text-xs font-medium text-gold bg-gold/15 rounded-lg hover:bg-gold/25 transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundsPage;
