import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRound } from '../../services/round.service';
import { getGames } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Select, Input } from '../../components/common';

export const CreateRoundPage = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<{ id: string; name: string; openingTime: string; closingTime: string }[]>([]);
  const [gameId, setGameId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGames({ page: 1, limit: 100 })
      .then((data: any) => {
        if (data.success) {
          const list = data.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            openingTime: (g.openingTime || g.opening_time || '').slice(0, 5),
            closingTime: (g.closingTime || g.closing_time || '').slice(0, 5),
          }));
          setGames(list);
        }
      })
      .catch(() => setError('Failed to load games'));
  }, []);

  const selectedGame = games.find((g) => g.id === gameId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !selectedDate) return;

    const game = games.find((g) => g.id === gameId);
    if (!game?.openingTime || !game?.closingTime) {
      setError('Selected game does not have opening/closing times configured');
      return;
    }

    const startTime = `${selectedDate}T${game.openingTime}`;
    const endTime = `${selectedDate}T${game.closingTime}`;

    setSubmitting(true);
    setError(null);
    try {
      const data = (await createRound({ gameId, startTime, endTime })) as any;
      if (data.success) {
        navigate('/rounds');
      } else {
        setError(data.message || 'Failed to create round');
      }
    } catch {
      setError('Failed to create round');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Create Round</h1>

        {error && (
          <div className="mb-4 px-4 py-3 bg-error/15 text-error rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
          <Select
            label="Game"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          >
            <option value="">Select a game</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </Select>

          <Input
            label="Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          {selectedGame && selectedGame.openingTime && (
            <div className="bg-card-secondary rounded-lg p-3 text-sm text-text-secondary">
              <p>Round will be created from <span className="font-medium">{selectedGame.openingTime}</span> to <span className="font-medium">{selectedGame.closingTime}</span></p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={!gameId || !selectedDate || submitting}>
              {submitting ? 'Creating...' : 'Create Round'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/rounds')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoundPage;
