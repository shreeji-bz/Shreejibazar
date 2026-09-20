import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { getRounds, closeRound, declareResult, getGames } from '../../services/authService';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal, Input, Select } from '../../components/common';
import type { Round } from '../../types/round.types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-warning/15', text: 'text-warning' },
  open: { bg: 'bg-info/15', text: 'text-info' },
  closed: { bg: 'bg-text-muted/15', text: 'text-text-muted' },
  result_declared: { bg: 'bg-success/15', text: 'text-success' },
};

export const Rounds = () => {
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getGames({ page: 1, limit: 100 })
      .then((data: any) => {
        if (data.success) setGames(data.data);
      })
      .catch(() => setError('Failed to load games'));
  }, []);

  useEffect(() => {
    if (!selectedGameId) {
      setRounds([]);
      return;
    }
    setLoading(true);
    setError(null);
    getRounds({ gameId: selectedGameId })
      .then((data: any) => {
        if (data.success) setRounds(data.data);
        else setError(data.message || 'Failed to load rounds');
      })
      .catch(() => setError('Failed to load rounds'))
      .finally(() => setLoading(false));
  }, [selectedGameId]);

  const handleCloseRound = async (round: Round) => {
    if (round.status !== 'open') return;
    try {
      const data = (await closeRound(round.id)) as any;
      if (data.success) {
        setRounds((prev) =>
          prev.map((r) => (r.id === round.id ? { ...r, status: 'closed' } : r))
        );
      }
    } catch {
      setError('Failed to close round');
    }
  };

  const openResultModal = (round: Round) => {
    setSelectedRound(round);
    setResultValue('');
    setResultModalOpen(true);
  };

  const handleDeclareResult = async () => {
    if (!selectedRound || !resultValue.trim()) return;
    setSubmitting(true);
    try {
      const data = (await declareResult(selectedRound.id, resultValue.trim())) as any;
      if (data.success) {
        setRounds((prev) =>
          prev.map((r) =>
            r.id === selectedRound.id ? { ...r, result: resultValue.trim(), status: 'result_declared' } : r
          )
        );
        setResultModalOpen(false);
        setSelectedRound(null);
        setResultValue('');
      }
    } catch {
      setError('Failed to declare result');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Rounds</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-error/15 text-error rounded-lg text-sm">{error}</div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-3">
          <Select
            value={selectedGameId}
            onChange={(e) => setSelectedGameId(e.target.value)}
            className="w-56"
          >
            <option value="">Select Game</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </Select>
          {selectedGameId && (
            <Button variant="primary">
              <Plus size={16} className="mr-1.5" />
              Add Round
            </Button>
          )}
        </div>

        <Table headers={['Game', 'Round', 'Start Time', 'End Time', 'Status', 'Result', 'Actions']}>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="text-center py-8 text-text-muted">Loading rounds...</div>
              </TableCell>
            </TableRow>
          ) : rounds.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <div className="text-center py-8 text-text-muted">
                  {selectedGameId ? 'No rounds found for this game' : 'Select a game to view rounds'}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rounds.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-text-primary">{r.gameName}</TableCell>
                <TableCell>#{String(r.roundNumber).padStart(3, '0')}</TableCell>
                <TableCell>{new Date(r.startTime).toLocaleString('en-IN')}</TableCell>
                <TableCell>{new Date(r.endTime).toLocaleString('en-IN')}</TableCell>
                <TableCell>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]?.bg ?? 'bg-text-muted/15'} ${STATUS_COLORS[r.status]?.text ?? 'text-text-muted'}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  {r.result ? (
                    <span className="text-gold-bright font-bold text-lg">{r.result}</span>
                  ) : (
                    <span className="text-text-muted">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {r.status === 'open' && (
                      <Button
                        variant="outline"
                        className="text-xs px-3 py-1.5"
                        onClick={() => handleCloseRound(r)}
                      >
                        Close
                      </Button>
                    )}
                    {r.status === 'closed' && (
                      <Button
                        variant="primary"
                        className="text-xs px-3 py-1.5"
                        onClick={() => openResultModal(r)}
                      >
                        Declare Result
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </div>

      <Modal isOpen={resultModalOpen} onClose={() => setResultModalOpen(false)} title="Declare Result">
        {selectedRound && (
          <div className="space-y-4">
            <div className="bg-card-secondary rounded-lg p-3 text-sm">
              <p className="text-text-secondary">
                <span className="text-text-muted">Game:</span>{' '}
                <span className="text-text-primary font-medium">{selectedRound.gameName}</span>
              </p>
              <p className="text-text-secondary mt-1">
                <span className="text-text-muted">Round:</span>{' '}
                <span className="text-text-primary font-medium">#{String(selectedRound.roundNumber).padStart(3, '0')}</span>
              </p>
            </div>
            <Input
              label="Result Value"
              placeholder="Enter result (e.g. 123, A, Red)"
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value)}
              autoFocus
            />
            <Button
              onClick={handleDeclareResult}
              className="w-full"
              disabled={!resultValue.trim() || submitting}
            >
              {submitting ? 'Declaring...' : 'Declare Result'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Rounds;
