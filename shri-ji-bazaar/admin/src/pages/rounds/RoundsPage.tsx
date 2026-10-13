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
      pending: 'bg-yellow-100 text-yellow-700',
      open: 'bg-green-100 text-green-700',
      closed: 'bg-gray-200 text-gray-600',
      result_declared: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${map[s] ?? 'bg-gray-100 text-gray-600'}`}>
        {s.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Rounds Management</h1>
          <Link
            to="/rounds/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Create Round
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-sm text-gray-500">Loading rounds...</span>
            </div>
          ) : rounds.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">No rounds found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 font-semibold text-gray-700">Round Number</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Game</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Start Time</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {r.roundNumber != null ? `#${String(r.roundNumber).padStart(3, '0')}` : r.id}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{getGameName(r.game)}</td>
                      <td className="py-3 px-4">{statusBadge(r.status)}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {r.startTime
                          ? new Date(r.startTime).toLocaleString('en-IN')
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/rounds/${r.id}`}
                          className="inline-block px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
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
