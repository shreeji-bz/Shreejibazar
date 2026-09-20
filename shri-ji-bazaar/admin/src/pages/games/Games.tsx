import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, Power, PowerOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchGames, createGame, updateGame, deleteGame, toggleGameStatus } from '../../services/game.service';
import { Button } from '../../components/common/Button';
import { Modal, Select, Input } from '../../components/common';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setGames, setCurrentGame } from '../../store/game.slice';
import type { Game } from '../../types/game.types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Maintenance' },
];

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  image: '',
  openingTime: '',
  closingTime: '',
  resultTime: '',
  status: 'active' as 'active' | 'inactive' | 'maintenance',
  isPopular: false,
};

export const Games = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const games = useSelector((state: RootState) => state.games.list);
  const current = useSelector((state: RootState) => state.games.current);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = { page: '1', limit: '100' };
      if (statusFilter !== 'all') params.status = statusFilter;
      const result = (await fetchGames()) as any;
      if (result.success) {
        dispatch(setGames(result.data));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dispatch]);

  useEffect(() => { loadGames(); }, [loadGames]);

  const filteredGames = games.filter((g) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q);
  });

  const openModal = (game?: Game) => {
    if (game) {
      setEditingGame(game);
      setFormData({
        name: game.name,
        slug: game.slug,
        description: game.description || '',
        image: game.image || '',
        openingTime: game.openingTime || '',
        closingTime: game.closingTime || '',
        resultTime: game.resultTime || '',
        status: game.status as 'active' | 'inactive' | 'maintenance',
        isPopular: game.isPopular,
      });
    } else {
      setEditingGame(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingGame) {
        await updateGame(editingGame.id, formData);
      } else {
        await createGame(formData);
      }
      setIsModalOpen(false);
      loadGames();
    } catch (e: any) {
      setError(e.message || 'Save failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      await deleteGame(id);
      loadGames();
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    }
  };

  const handleRowClick = (game: Game) => {
    dispatch(setCurrentGame(game));
    navigate(`/games/${game.id}`);
  };

  const handleToggleStatus = async (game: Game, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = game.status === 'active' ? 'inactive' : 'active';
    if (!confirm(`Set this game to ${newStatus}?`)) return;
    try {
      await toggleGameStatus(game.id, newStatus);
      loadGames();
    } catch (err: any) {
      setError(err?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Games</h1>
        <Button onClick={() => openModal()}>
          <Plus size={16} className="mr-1.5" />
          Add Game
        </Button>
      </div>

      {error && <div className="mb-4 p-3 bg-error/15 text-error rounded-lg text-sm">{error}</div>}

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-text-muted font-medium">Name</th>
              <th className="px-4 py-3 text-left text-text-muted font-medium">Slug</th>
              <th className="px-4 py-3 text-left text-text-muted font-medium">Opening</th>
              <th className="px-4 py-3 text-left text-text-muted font-medium">Closing</th>
              <th className="px-4 py-3 text-left text-text-muted font-medium">Popular</th>
              <th className="px-4 py-3 text-left text-text-muted font-medium">Status</th>
              <th className="px-4 py-3 text-left text-text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && filteredGames.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">Loading games...</td></tr>
            ) : filteredGames.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted">No games found</td></tr>
            ) : (
              filteredGames.map((game) => (
                <tr
                  key={game.id}
                  onClick={() => handleRowClick(game)}
                  className={`hover:bg-card-secondary/50 cursor-pointer ${current?.id === game.id ? 'bg-gold/5' : ''}`}
                >
                  <td>{game.name}</td>
                  <td className="text-text-muted">{game.slug}</td>
                  <td>{game.openingTime || '-'}</td>
                  <td>{game.closingTime || '-'}</td>
                  <td>{game.isPopular ? 'Yes' : 'No'}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      game.status === 'active' ? 'bg-success/15 text-success' :
                      game.status === 'maintenance' ? 'bg-gold/15 text-gold' :
                      'bg-text-muted/15 text-text-muted'
                    }`}>
                      {game.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(game, e); }}
                        title={game.status === 'active' ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 hover:bg-card-secondary rounded ${
                          game.status === 'active' ? 'text-success' : 'text-text-muted'
                        }`}
                      >
                        {game.status === 'active' ? <Power size={14} /> : <PowerOff size={14} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openModal(game); }}
                        title="Edit"
                        className="p-1.5 text-gold hover:bg-card-secondary rounded"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(game.id); }}
                        title="Delete"
                        className="p-1.5 text-error hover:bg-card-secondary rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingGame ? 'Edit Game' : 'Add Game'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Name</label>
            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Slug</label>
            <Input value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Description</label>
            <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Image URL</label>
            <Input value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Opening Time</label>
              <Input type="time" value={formData.openingTime} onChange={(e) => setFormData({...formData, openingTime: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Closing Time</label>
              <Input type="time" value={formData.closingTime} onChange={(e) => setFormData({...formData, closingTime: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Result Time</label>
            <Input type="time" value={formData.resultTime} onChange={(e) => setFormData({...formData, resultTime: e.target.value})} />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isPopular"
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
              className="rounded border-border"
            />
            <label htmlFor="isPopular" className="text-sm text-text-secondary">Popular Game</label>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Status</label>
            <Select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive' | 'maintenance'})}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </div>
          <Button onClick={handleSubmit} className="w-full">{editingGame ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Games;
