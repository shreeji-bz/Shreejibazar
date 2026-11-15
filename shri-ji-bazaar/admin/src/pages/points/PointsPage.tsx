import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { get } from '../../services/api';
import { AdjustPointsPage } from './AdjustPointsPage';

interface PointEntry {
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
}

interface PointsResponse {
  success: boolean;
  data: PointEntry[];
}

export const PointsPage = () => {
  const [data, setData] = useState<PointEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const loadPoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await get<PointsResponse>('/v1/admin/points');
      if (result.success) {
        setData(result.data);
      } else {
        setError('Failed to load points data');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoints();
  }, []);

  const handleAdjust = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleCloseAdjust = () => {
    setSelectedUserId(null);
    loadPoints();
  };

  const filteredPoints = data.filter((entry) =>
    entry.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Points Management</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-error/30 bg-error/10 text-error rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user ID..."
                className="w-full pl-9 pr-4 py-2 border border-border bg-card-secondary rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-border border-t-gold rounded-full animate-spin" />
              <span className="ml-3 text-text-muted">Loading points...</span>
            </div>
          ) : filteredPoints.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              {search ? 'No users match your search' : 'No points data found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-text-muted font-medium">User ID</th>
                    <th className="px-4 py-3 text-left text-text-muted font-medium">Balance</th>
                    <th className="px-4 py-3 text-left text-text-muted font-medium">Total Earned</th>
                    <th className="px-4 py-3 text-left text-text-muted font-medium">Total Spent</th>
                    <th className="px-4 py-3 text-left text-text-muted font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPoints.map((entry) => (
                    <tr key={entry.user_id} className="hover:bg-card-secondary">
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {entry.user_id}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {entry.balance.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {entry.total_earned.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {entry.total_spent.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleAdjust(entry.user_id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold text-text-primary text-xs font-medium rounded-lg hover:bg-gold-bright transition-colors"
                        >
                          Adjust Points
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm text-text-muted">
              <span>
                Showing {filteredPoints.length} of {data.length} users
              </span>
            </div>
          )}
        </div>

        {selectedUserId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-text-primary">Adjust Points</h2>
                  <button
                    onClick={handleCloseAdjust}
                    className="text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <AdjustPointsPage userId={selectedUserId} onClose={handleCloseAdjust} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsPage;
