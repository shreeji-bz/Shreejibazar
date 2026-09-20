import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRound } from '../../services/round.service';
import { getGames } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common';

export const CreateRoundPage = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [gameId, setGameId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGames({ page: 1, limit: 100 })
      .then((data: any) => {
        if (data.success) setGames(data.data);
      })
      .catch(() => setError('Failed to load games'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !startTime || !endTime) return;

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
            label="Start Time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />

          <Input
            label="End Time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={!gameId || !startTime || !endTime || submitting}>
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
