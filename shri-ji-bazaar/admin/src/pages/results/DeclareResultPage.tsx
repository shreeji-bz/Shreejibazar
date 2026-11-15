import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, getRounds, declareResult } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common';

export const DeclareResultPage = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [loadingGames, setLoadingGames] = useState(true);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState<any>(null);
  const [resultValue, setResultValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getGames({ page: 1, limit: 100 });
        if (data.success) setGames(data.data);
        else setError(data.message || 'Failed to load games');
      } catch {
        setError('Failed to load games');
      } finally {
        setLoadingGames(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedGameId) {
      setRounds([]);
      setSelectedRound(null);
      return;
    }
    setLoadingRounds(true);
    setSelectedRound(null);
    setResultValue('');
    (async () => {
      try {
        const data = await getRounds({ gameId: selectedGameId });
        if (data.success) {
          const closed = data.data.filter((r: any) => r.status === 'closed');
          closed.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
          setRounds(closed);
        } else {
          setError(data.message || 'Failed to load rounds');
        }
      } catch {
        setError('Failed to load rounds');
      } finally {
        setLoadingRounds(false);
      }
    })();
  }, [selectedGameId]);

  const handleDeclare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRound || !resultValue.trim() || !/^\d{2}$/.test(resultValue.trim())) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await declareResult(selectedRound.id, resultValue.trim());
      if ((data as any).success) {
        navigate('/results');
      } else {
        setError((data as any).message || 'Failed to declare result');
      }
    } catch {
      setError('Failed to declare result');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleString('en-IN'); }
    catch { return dateStr; }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Declare Result</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-error/15 text-error rounded-lg text-sm">{error}</div>
      )}

      {!selectedGameId ? (
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-text-secondary text-sm mb-4">Select a game to view its closed rounds and declare a result.</p>
          {loadingGames ? (
            <div className="text-text-muted text-sm">Loading games...</div>
          ) : (
            <Select
              label="Game"
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="w-full max-w-md"
            >
              <option value="">Select a game</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </Select>
          )}
        </div>
      ) : selectedRound ? (
        <div className="max-w-xl">
          <div className="bg-card border border-border rounded-xl p-5 mb-5">
            <p className="text-text-secondary text-sm mb-1">
              <span className="text-text-muted">Game:</span>{' '}
              <span className="text-text-primary font-medium">{selectedRound.gameName}</span>
            </p>
            <p className="text-text-secondary text-sm">
              <span className="text-text-muted">Round:</span>{' '}
              <span className="text-text-primary font-medium">#{String(selectedRound.roundNumber).padStart(3, '0')}</span>
            </p>
            <p className="text-text-secondary text-sm mt-1">
              <span className="text-text-muted">Round Date:</span>{' '}
              <span className="text-text-primary">{formatDate(selectedRound.startTime)}</span>
            </p>
          </div>

          <form onSubmit={handleDeclare} className="bg-card border border-border rounded-xl p-6 space-y-5">
            <Input
              label="Result Value"
              placeholder="Enter 2-digit result (e.g. 12, 45)"
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value.replace(/\D/g, '').slice(0, 2))}
              maxLength={2}
              inputMode="numeric"
              autoFocus
            />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={!resultValue.trim() || submitting}>
                {submitting ? 'Declaring...' : 'Declare Result'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setSelectedRound(null); setResultValue(''); }}>
                Back
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setSelectedGameId(''); setRounds([]); }}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              ← Change Game
            </button>
          </div>

          {loadingRounds ? (
            <div className="text-center py-8 text-text-muted">Loading rounds...</div>
          ) : rounds.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-text-muted">
              No closed rounds found for this game.
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 font-semibold text-text-secondary">Round</th>
                    <th className="py-3 px-4 font-semibold text-text-secondary">Date</th>
                    <th className="py-3 px-4 font-semibold text-text-secondary">Start Time</th>
                    <th className="py-3 px-4 font-semibold text-text-secondary">End Time</th>
                    <th className="py-3 px-4 font-semibold text-text-secondary text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r) => (
                    <tr key={r.id} className="border-b border-border hover:bg-card-secondary transition-colors">
                      <td className="py-3 px-4 text-text-primary font-medium">
                        #{String(r.roundNumber).padStart(3, '0')}
                      </td>
                      <td className="py-3 px-4 text-text-secondary">{formatDate(r.startTime)}</td>
                      <td className="py-3 px-4 text-text-secondary">{formatDate(r.startTime)}</td>
                      <td className="py-3 px-4 text-text-secondary">{formatDate(r.endTime)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="primary"
                          className="text-xs px-3 py-1.5"
                          onClick={() => { setSelectedRound(r); setResultValue(''); }}
                        >
                          Declare Result
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeclareResultPage;
