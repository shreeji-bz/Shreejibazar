import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { declareResult } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const DeclareResultPage = () => {
  const { roundId } = useParams<{ roundId: string }>();
  const navigate = useNavigate();
  const [round, setRound] = useState<{
    id: string;
    gameName: string;
    roundNumber: number;
    status: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!roundId) return;
    setLoading(true);
    setError(null);

    // Fetch from all games to find the round by ID
    import('../../services/authService').then(({ getRounds }) => {
      return getRounds({ gameId: '' });
    })
      .then((data: any) => {
        if (data.success) {
          const found = data.data.find((r: any) => r.id === roundId);
          if (found) setRound(found);
          else setError('Round not found');
        } else {
          setError(data.message || 'Failed to load round');
        }
      })
      .catch(() => setError('Failed to load round'))
      .finally(() => setLoading(false));
  }, [roundId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundId || !resultValue.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const data = await declareResult(roundId, resultValue.trim());
      if (data.success) {
        navigate('/results');
      } else {
        setError(data.message || 'Failed to declare result');
      }
    } catch {
      setError('Failed to declare result');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Declare Result</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-error/15 text-error rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-text-muted">
          Loading round...
        </div>
      ) : round ? (
        <div className="max-w-xl">
          <div className="bg-card border border-border rounded-xl p-5 mb-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted block mb-0.5">Game</span>
                <span className="text-text-primary font-medium">{round.gameName}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-0.5">Round</span>
                <span className="text-text-primary font-medium">#{String(round.roundNumber).padStart(3, '0')}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-0.5">Start Time</span>
                <span className="text-text-primary">{new Date(round.startTime).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-0.5">End Time</span>
                <span className="text-text-primary">{new Date(round.endTime).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-0.5">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block ${
                  round.status === 'closed'
                    ? 'bg-text-muted/15 text-text-muted'
                    : round.status === 'result_declared'
                    ? 'bg-success/15 text-success'
                    : 'bg-info/15 text-info'
                }`}>
                  {round.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {round.status === 'closed' ? (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
              <Input
                label="Result Value"
                placeholder="Enter result (e.g. 123, A, Red)"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={!resultValue.trim() || submitting}>
                  {submitting ? 'Declaring...' : 'Declare Result'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/results')}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5 text-sm text-text-muted">
              This round is not yet closed and cannot have a result declared.
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-text-muted">
          Round not found.
        </div>
      )}
    </div>
  );
};

export default DeclareResultPage;
