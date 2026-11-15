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
        return 'bg-success/15 text-success';
      case 'lost':
        return 'bg-error/15 text-error';
      case 'void':
        return 'bg-card-tertiary text-text-muted';
      case 'active':
        return 'bg-gold/15 text-gold';
      default:
        return 'bg-gold/15 text-gold';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Wagers Management</h1>

        <div className="bg-card border border-border rounded-xl p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-error mb-4">{error}</p>
              <button onClick={fetchWagers} className="px-4 py-2 bg-gold text-text-primary rounded-lg hover:bg-gold-bright">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && wagers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-muted">No wagers found</p>
            </div>
          )}

          {!loading && !error && wagers.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Game</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Round</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Selection</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Potential Win</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {wagers.map((wager: any) => (
                      <tr key={wager.id} className="hover:bg-card-secondary">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-text-primary">{wager.userName}</div>
                          <div className="text-sm text-text-muted">{wager.userMobile}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-primary">{wager.gameName}</div>
                          <div className="text-sm text-text-muted">{wager.gameType}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary">
                          #{wager.roundNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-text-primary capitalize">{wager.selection}</div>
                          {wager.number && <div className="text-sm text-text-muted">{wager.number}</div>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-text-primary">
                          {wager.stake.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-text-primary">
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
                              className="text-gold hover:text-gold-bright p-1 rounded hover:bg-gold/15"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </a>
                            {(wager.status === 'pending' || wager.status === 'active') && (
                              <button
                                onClick={() => handleVoid(wager.id)}
                                disabled={voidingId === wager.id}
                                className="text-error hover:text-error/80 p-1 rounded hover:bg-error/10 disabled:opacity-50"
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
                  <p className="text-sm text-text-muted">
                    Showing {wagers.length} of {total} wagers
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPage((p) => Math.max(1, p - 1)); fetchWagers(); }}
                      disabled={page <= 1}
                      className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-card-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-text-secondary">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); fetchWagers(); }}
                      disabled={page >= totalPages}
                      className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-card-secondary disabled:opacity-50 disabled:cursor-not-allowed"
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
