import { useEffect, useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { wagerService } from '../../services/wager.service';

const WagersPage = () => {
  const [wagers, setWagers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voidingId, setVoidingId] = useState<string | null>(null);

  const fetchWagers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await wagerService.getWagers({ page });
      setWagers(response.data);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch wagers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWagers();
  }, []);

  const handleVoid = async (id: string) => {
    const reason = prompt('Enter reason for voiding this wager:');
    if (!reason) return;
    setVoidingId(id);
    try {
      await wagerService.voidWager(id, reason);
      await fetchWagers();
    } catch (err: any) {
      alert(err?.message || 'Failed to void wager');
    } finally {
      setVoidingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'bg-green-100 text-green-700';
      case 'lost':
        return 'bg-red-100 text-red-700';
      case 'void':
        return 'bg-gray-100 text-gray-700';
      case 'active':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Wagers Management</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchWagers} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && wagers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No wagers found</p>
            </div>
          )}

          {!loading && !error && wagers.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Round</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selection</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Win</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {wagers.map((wager: any) => (
                      <tr key={wager.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{wager.userName}</div>
                          <div className="text-sm text-gray-500">{wager.userMobile}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{wager.gameName}</div>
                          <div className="text-sm text-gray-500">{wager.gameType}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{wager.roundNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{wager.selection}</div>
                          {wager.number && <div className="text-sm text-gray-500">{wager.number}</div>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {wager.stake.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {wager.potentialPayout.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(wager.status)}`}>
                            {wager.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`/wagers/${wager.id}`}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </a>
                            {(wager.status === 'pending' || wager.status === 'active') && (
                              <button
                                onClick={() => handleVoid(wager.id)}
                                disabled={voidingId === wager.id}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                                title="Void Wager"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-500">
                    Showing {wagers.length} of {total} wagers
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPage((p) => Math.max(1, p - 1)); fetchWagers(); }}
                      disabled={page <= 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); fetchWagers(); }}
                      disabled={page >= totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WagersPage;
