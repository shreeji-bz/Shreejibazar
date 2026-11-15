import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGames, toggleGameStatus } from '../../services/game.service';

interface Game {
  id: string;
  name: string;
  status: string;
  [key: string]: any;
}

const GamesPage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchGames();
        const rows = Array.isArray(response) ? response : Array.isArray((response as any).data) ? (response as any).data : [];
        setGames(rows);
      } catch (err) {
        setError('Failed to load games. Please try again later.');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      setTogglingId(id);
      await toggleGameStatus(id, newStatus);
      setGames((prev) =>
        prev.map((game) =>
          game.id === id ? { ...game, status: newStatus } : game
        )
      );
    } catch (err) {
      setError('Failed to update game status. Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Games Management</h1>
          <button
            onClick={() => navigate('/games/create')}
            className="px-4 py-2 bg-gold text-text-primary rounded-lg hover:bg-gold-bright transition-colors font-medium text-sm"
          >
            Create Game
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error/10 p-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-10 w-10 text-gold"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm text-text-muted">Loading games...</p>
            </div>
          </div>
        ) : (
          /* Games Table */
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-card-secondary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {games.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-12 text-center text-sm text-text-muted"
                      >
                        No games found. Click "Create Game" to add your first game.
                      </td>
                    </tr>
                  ) : (
                    games.map((game) => (
                      <tr key={game.id} className="hover:bg-card-secondary transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-text-primary">
                            {game.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              game.status === 'active'
                                ? 'bg-success/15 text-success'
                                : 'bg-text-muted/15 text-text-muted'
                            }`}
                          >
                            {game.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleToggleStatus(game.id, game.status)}
                            disabled={togglingId === game.id}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                              game.status === 'active'
                                ? 'bg-error/10 text-error hover:bg-error/20'
                                : 'bg-gold/15 text-gold hover:bg-gold/25'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {togglingId === game.id
                              ? 'Updating...'
                              : game.status === 'active'
                              ? 'Deactivate'
                              : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesPage;
