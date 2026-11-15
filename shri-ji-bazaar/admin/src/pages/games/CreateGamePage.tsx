import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame } from '../../services/game.service';
import { Input, Select, Button } from '../../components/common';

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

export const CreateGamePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createGame(formData);
      navigate('/games');
    } catch (err: any) {
      setError(err?.message || 'Failed to create game');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Create Game</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 max-w-2xl space-y-5">
        {error && <div className="p-3 border border-error/30 bg-error/10 text-error rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm text-text-secondary mb-1">Name</label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Slug</label>
          <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Description</label>
          <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Image URL</label>
          <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1">Opening Time</label>
            <Input type="time" value={formData.openingTime} onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Closing Time</label>
            <Input type="time" value={formData.closingTime} onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Result Time</label>
          <Input type="time" value={formData.resultTime} onChange={(e) => setFormData({ ...formData, resultTime: e.target.value })} />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isPopular"
            type="checkbox"
            checked={formData.isPopular}
            onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
            className="rounded border-border accent-gold"
          />
          <label htmlFor="isPopular" className="text-sm text-text-secondary">Popular Game</label>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Status</label>
          <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'maintenance' })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </Select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Creating...' : 'Create Game'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/games')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};
