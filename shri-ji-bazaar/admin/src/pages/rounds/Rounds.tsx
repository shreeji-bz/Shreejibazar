import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getGames } from '../../services/authService';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal, Input } from '../../components/common';

interface Round { id: string; gameId: string; gameName: string; roundNumber: string; startTime: string; endTime: string; status: string; result?: string; }
interface Game { id: string; name: string; }

export const Rounds = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ gameId: '', roundNumber: '', startTime: '', endTime: '' });

  useEffect(() => { getGames({ page: 1, limit: 100 }).then((data: any) => { if (data.success) setGames(data.data); }); }, []);

  const loadRounds = () => { if (!selectedGame) return; };

  const handleCreate = async () => { setIsModalOpen(false); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Rounds</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex gap-3">
          <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)} className="bg-card-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary">
            <option value="">Select Game</option>
            {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <Button onClick={() => setIsModalOpen(true)}><Plus size={16} className="mr-1.5" />Add Round</Button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-card-secondary"><tr><th className="px-4 py-3 text-left text-text-muted">Game</th><th className="px-4 py-3 text-left text-text-muted">Round</th><th className="px-4 py-3 text-left text-text-muted">Start</th><th className="px-4 py-3 text-left text-text-muted">End</th><th className="px-4 py-3 text-left text-text-muted">Status</th><th className="px-4 py-3 text-left text-text-muted">Result</th></tr></thead>
          <tbody className="divide-y divide-border">
            {rounds.length === 0 ? (
              <tr><td colSpan={6}><div className="text-center py-8 text-text-muted">Select a game to view rounds</div></td></tr>
            ) : rounds.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.gameName}</TableCell>
                <TableCell>{r.roundNumber}</TableCell>
                <TableCell>{r.startTime}</TableCell>
                <TableCell>{r.endTime}</TableCell>
                <TableCell><span className="px-2 py-0.5 rounded text-xs bg-success/15 text-success">{r.status}</span></TableCell>
                <TableCell>{r.result || '-'}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Round">
        <div className="space-y-4">
          <div><label className="block text-sm text-text-secondary mb-1">Game</label><select className="w-full bg-card-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"><option value="">Select</option>{games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
          <Input label="Round Number" placeholder="e.g. #001" />
          <Input label="Start Time" type="time" />
          <Input label="End Time" type="time" />
          <Button onClick={handleCreate} className="w-full">Create Round</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Rounds;
