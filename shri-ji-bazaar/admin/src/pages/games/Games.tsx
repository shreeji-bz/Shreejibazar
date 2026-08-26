import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getGames, createGame, updateGame, deleteGame } from '../../services/authService';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal, Select, Input } from '../../components/common';

interface Game { id: string; name: string; slug: string; status: string; isPopular: boolean; openingTime: string; closingTime: string; }

export const Games = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', image: '', openingTime: '', closingTime: '', resultTime: '', status: 'active' as string, isPopular: false });

  const loadGames = () => getGames({ page: 1, limit: 50 }).then((data: any) => { if (data.success) setGames(data.data); });

  useEffect(() => { loadGames(); }, []);

  const openModal = (game?: Game) => {
    if (game) { setEditingGame(game); setFormData({ name: game.name, slug: game.slug, description: '', image: '', openingTime: game.openingTime, closingTime: game.closingTime, resultTime: '', status: game.status, isPopular: game.isPopular }); }
    else { setEditingGame(null); setFormData({ name: '', slug: '', description: '', image: '', openingTime: '', closingTime: '', resultTime: '', status: 'active', isPopular: false }); }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (editingGame) await updateGame(editingGame.id, formData); else await createGame(formData);
    setIsModalOpen(false);
    loadGames();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) { await deleteGame(id); loadGames(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Games</h1>
        <Button onClick={() => openModal()}><Plus size={16} className="mr-1.5" />Add Game</Button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary">
            <tr><th className="px-4 py-3 text-left text-text-muted font-medium">Name</th><th className="px-4 py-3 text-left text-text-muted font-medium">Slug</th><th className="px-4 py-3 text-left text-text-muted font-medium">Opening</th><th className="px-4 py-3 text-left text-text-muted font-medium">Closing</th><th className="px-4 py-3 text-left text-text-muted font-medium">Status</th><th className="px-4 py-3 text-left text-text-muted font-medium">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {games.map((game) => (
              <tr key={game.id} className="hover:bg-card-secondary/50">
                <TableCell>{game.name}</TableCell>
                <TableCell className="text-text-muted">{game.slug}</TableCell>
                <TableCell>{game.openingTime}</TableCell>
                <TableCell>{game.closingTime}</TableCell>
                <TableCell><span className={`px-2 py-0.5 rounded text-xs ${game.status === 'active' ? 'bg-success/15 text-success' : 'bg-text-muted/15 text-text-muted'}`}>{game.status}</span></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(game)} className="p-1.5 text-gold hover:bg-card-secondary rounded"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(game.id)} className="p-1.5 text-error hover:bg-card-secondary rounded"><Trash2 size={14} /></button>
                  </div>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGame ? 'Edit Game' : 'Add Game'}>
        <div className="space-y-4">
          <div><label className="block text-sm text-text-secondary mb-1">Name</label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="block text-sm text-text-secondary mb-1">Slug</label><Input value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm text-text-secondary mb-1">Opening Time</label><Input value={formData.openingTime} onChange={(e) => setFormData({...formData, openingTime: e.target.value})} /></div>
            <div><label className="block text-sm text-text-secondary mb-1">Closing Time</label><Input value={formData.closingTime} onChange={(e) => setFormData({...formData, closingTime: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm text-text-secondary mb-1">Status</label><Select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></Select></div>
          <Button onClick={handleSubmit} className="w-full">{editingGame ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Games;
