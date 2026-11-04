import { useEffect, useState } from 'react';
import { Plus, Pencil, RefreshCw } from 'lucide-react';
import { fetchBonuses, createBonus, updateBonus } from '../../services/bonus.service';
import { Button } from '../../components/common/Button';
import { Modal, Input } from '../../components/common';
import { TableRow, TableCell } from '../../components/common/Table';

interface Bonus {
  id: string;
  name: string;
  slug: string;
  description?: string;
  points: number;
  type: string;
  status: string;
  [key: string]: any;
}

const EMPTY = { name: '', description: '', points: 0, type: 'daily', status: 'active' };

/**
 * Real Bonuses CRUD (list / create / edit / status toggle) against the admin
 * endpoints. Previously this menu rendered a 2-line placeholder stub even
 * though the backend + services were ready.
 */
export const BonusesPage = () => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Bonus | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY>(EMPTY);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await fetchBonuses();
      if (res?.success && Array.isArray(res.data)) setBonuses(res.data);
      else setBonuses(Array.isArray(res?.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load bonuses');
      setBonuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openModal = (b?: Bonus) => {
    setEditing(b || null);
    setFormData(b
      ? { name: b.name, description: b.description || '', points: b.points ?? 0, type: b.type || 'daily', status: b.status || 'active' }
      : EMPTY);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) await updateBonus(editing.id, formData);
      else await createBonus(formData);
      setIsModalOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to save bonus');
    }
  };

  const toggleStatus = async (b: Bonus) => {
    try {
      await updateBonus(b.id, { status: b.status === 'active' ? 'inactive' : 'active' });
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Bonuses</h1>
        <div className="flex gap-2">
          <Button onClick={() => load()}><RefreshCw size={14} className="mr-1.5" />Refresh</Button>
          <Button onClick={() => openModal()}><Plus size={16} className="mr-1.5" />Add Bonus</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-text-muted">Name</th>
              <th className="px-4 py-3 text-left text-text-muted">Points</th>
              <th className="px-4 py-3 text-left text-text-muted">Type</th>
              <th className="px-4 py-3 text-left text-text-muted">Status</th>
              <th className="px-4 py-3 text-right text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-text-muted py-8">Loading...</TableCell></TableRow>
            ) : bonuses.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-text-muted py-8">No bonuses yet. Click "Add Bonus" to create one.</TableCell></TableRow>
            ) : (
              bonuses.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.name}<div className="text-xs text-text-muted">{b.description || b.slug}</div></TableCell>
                  <TableCell className="text-gold-bright font-semibold">{b.points}</TableCell>
                  <TableCell>{b.type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-xs ${b.status === 'active' ? 'bg-success/15 text-success' : 'bg-text-muted/15 text-text-muted'}`}>{b.status}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5 justify-end">
                      <Button variant="outline" onClick={() => openModal(b)}><Pencil size={13} /></Button>
                      <Button variant="outline" onClick={() => toggleStatus(b)}>{b.status === 'active' ? 'Disable' : 'Enable'}</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Bonus' : 'Add Bonus'}>
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e: any) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Description" value={formData.description} onChange={(e: any) => setFormData({ ...formData, description: e.target.value })} />
          <Input label="Points" type="number" value={String(formData.points)} onChange={(e: any) => setFormData({ ...formData, points: Number(e.target.value) })} />
          <div>
            <label className="block text-sm text-text-secondary mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-card-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="signup">Signup</option>
              <option value="login">Login</option>
              <option value="referral">Referral</option>
              <option value="achievement">Achievement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-card-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <Button onClick={handleSubmit} className="w-full">{editing ? 'Update Bonus' : 'Create Bonus'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default BonusesPage;
