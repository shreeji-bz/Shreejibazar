import { useEffect, useState } from 'react';
import { get } from '../../services/api';
import { getRounds, declareResult, closeRound, saveResult } from '../../services/authService';
import { getGames } from '../../services/authService';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal, Input } from '../../components/common';
import type { Round } from '../../types/round.types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-warning/15', text: 'text-warning' },
  open: { bg: 'bg-info/15', text: 'text-info' },
  closed: { bg: 'bg-text-muted/15', text: 'text-text-muted' },
  result_declared: { bg: 'bg-success/15', text: 'text-success' },
};

export const Results = () => {
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [, setLoadingGames] = useState(true);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Declare result modal state
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Save result modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveModalRound, setSaveModalRound] = useState<Round | null>(null);
  const [saveModalValue, setSaveModalValue] = useState('');

  useEffect(() => {
    getGames({ page: 1, limit: 100 })
      .then((data: any) => {
        if (data.success) setGames(data.data);
      })
      .catch(() => setError('Failed to load games'))
      .finally(() => setLoadingGames(false));
  }, []);

  // Load rounds — all games when nothing selected, single game when filtered
  useEffect(() => {
    setLoadingRounds(true);
    setError(null);
    (async () => {
      try {
        let list: Round[];
        if (selectedGameId) {
          const data = await getRounds({ gameId: selectedGameId });
          list = (data as any).data;
        } else {
          const data = await get<{ success: boolean; data: Round[] }>('/v1/admin/rounds/', { params: { limit: 200 } });
          list = data.data;
        }
        list.sort((a: Round, b: Round) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        setRounds(list);
      } catch {
        setError('Failed to load rounds');
      } finally {
        setLoadingRounds(false);
      }
    })();
  }, [selectedGameId]);

  const openDeclareModal = (round: Round) => {
    setSelectedRound(round);
    setResultValue('');
    setResultModalOpen(true);
  };

  const openSaveModal = (round: Round) => {
    setSaveModalRound(round);
    setSaveModalValue('');
    setSaveModalOpen(true);
  };

  const handleDeclareResult = async () => {
    if (!selectedRound || !resultValue.trim() || !/^\d{2}$/.test(resultValue.trim())) return;
    setSubmitting(true);
    try {
      const data = await declareResult(selectedRound.id, resultValue.trim());
      if ((data as any).success) {
        setRounds((prev) =>
          prev.map((r) => (r.id === selectedRound.id ? { ...r, result: resultValue.trim(), status: 'result_declared' } : r))
        );
        setResultModalOpen(false);
        setSelectedRound(null);
        setResultValue('');
      } else {
        setError((data as any).message || 'Failed to declare result');
      }
    } catch {
      setError('Failed to declare result');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveResultSubmit = async () => {
    if (!saveModalRound || !/^\d{2}$/.test(saveModalValue.trim())) {
      setError('Result must be exactly 2 digits (e.g. 12, 45)');
      return;
    }
    setSaveModalOpen(false);
    setError(null);
    try {
      const data = await saveResult(saveModalRound.id, saveModalValue.trim());
      if ((data as any).success) {
        setRounds((prev) =>
          prev.map((r) => (r.id === saveModalRound.id ? { ...r, result: saveModalValue.trim() } : r))
        );
      } else {
        setError((data as any).message || 'Failed to save result');
      }
    } catch {
      setError('Failed to save result');
    }
  };

  const handleCloseRound = async (round: Round) => {
    try {
      const data = await closeRound(round.id);
      if ((data as any).success) {
        setRounds((prev) => prev.map((r) => (r.id === round.id ? { ...r, status: 'closed' } : r)));
      } else {
        setError((data as any).message || 'Failed to close round');
      }
    } catch {
      setError('Failed to close round');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Results</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-error/15 text-error rounded-lg text-sm">{error}</div>
      )}

      <div className="flex items-center justify-between mb-4">
        <select
          value={selectedGameId}
          onChange={(e) => setSelectedGameId(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 bg-card-secondary text-text-primary text-sm"
        >
          <option value="">All Games</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        {selectedGameId && (
          <button
            onClick={() => setSelectedGameId('')}
            className="text-sm text-gold hover:text-gold-dark"
          >
            Show All Games
          </button>
        )}
      </div>

      {loadingRounds ? (
        <div className="text-center py-8 text-text-muted">Loading rounds...</div>
      ) : rounds.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-text-muted">
          No rounds found.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
              <Table headers={['Game', 'Round', 'Start Time', 'End Time', 'Status', 'Result', 'Actions']}>
                {rounds.map((r) => (
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
                      <div className="flex gap-2 flex-wrap">
                        {r.status === 'open' && (
                          <>
                            <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => openSaveModal(r)}>
                              {r.result ? 'Update Result' : 'Save Result'}
                            </Button>
                            <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => handleCloseRound(r)}>
                              Close
                            </Button>
                          </>
                        )}
                        {r.status === 'closed' && (
                          <Button variant="primary" className="text-xs px-3 py-1.5" onClick={() => openDeclareModal(r)}>
                            {r.result ? 'Declare Saved Result' : 'Declare Result'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          )}

      {/* Save Result Modal */}
      <Modal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)} title="Save Result">
        {saveModalRound && (
          <div className="space-y-4">
            <div className="bg-card-secondary rounded-lg p-3 text-sm">
              <p className="text-text-secondary">
                <span className="text-text-muted">Round:</span>{' '}
                <span className="text-text-primary font-medium">#{String(saveModalRound.roundNumber).padStart(3, '0')}</span>
              </p>
              <p className="text-text-secondary mt-1">
                <span className="text-text-muted">Game:</span>{' '}
                <span className="text-text-primary font-medium">{saveModalRound.gameName}</span>
              </p>
            </div>
            <Input
              label="Result Value"
              placeholder="Enter 2-digit result (e.g. 12, 45)"
              value={saveModalValue}
              onChange={(e) => setSaveModalValue(e.target.value.replace(/\D/g, '').slice(0, 2))}
              maxLength={2}
              inputMode="numeric"
              autoFocus
            />
            <Button onClick={handleSaveResultSubmit} className="w-full" disabled={!saveModalValue.trim()}>
              Save Result
            </Button>
          </div>
        )}
      </Modal>

      {/* Declare Result Modal */}
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
              placeholder="Enter 2-digit result (e.g. 12, 45)"
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value.replace(/\D/g, '').slice(0, 2))}
              maxLength={2}
              inputMode="numeric"
              autoFocus
            />
            <Button onClick={handleDeclareResult} className="w-full" disabled={!resultValue.trim() || submitting}>
              {submitting ? 'Declaring...' : 'Declare Result'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Results;
