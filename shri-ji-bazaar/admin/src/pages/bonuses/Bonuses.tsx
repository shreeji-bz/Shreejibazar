import { useEffect, useState } from 'react';
import { getBonuses, createBonus, updateBonus } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Modal, Input } from '../../components/common';
import { TableRow, TableCell } from '../../components/common/Table';

interface Bonus { id: string; name: string; slug: string; points: number; type: string; status: string; }

export const Bonuses = () => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', points: 0, type: 'daily', status: 'active' });

  const loadBonuses = () => getBonuses().then((data: any) => { if (data.success) setBonuses(data.data); });
  useEffect(() => { loadBonuses(); }, []);

  const handleSubmit = async () => {
    if (editingBonus) await updateBonus(editingBonus.id, formData); else await createBonus(formData);
    setIsModalOpen(false);
    loadBonuses();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bonuses</h1>
        <Button onClick={() => { setEditingBonus(null); setFormData({ name: '', slug: '', points: 0, type: 'daily', status: 'active' }); setIsModalOpen(true); }}>Add Bonus</Button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary"><tr><th className="px-4 py-3 text-left text-text-muted">Name</th><th className="px-4 py-3 text-left text-text-muted">Points</th><th className="px-4 py-3 text-left text-text-muted">Type</th><th className="px-4 py-3 text-left text-text-muted">Status</th></tr></thead>
          <tbody className="divide-y divide-border">
            {bonuses.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.name}</TableCell>
                <TableCell className="text-gold-bright">{b.points}</TableCell>
                <TableCell>{b.type}</TableCell>
                <TableCell><span className={`px-2 py-0.5 rounded text-xs ${b.status === 'active' ? 'bg-success/15 text-success' : 'bg-text-muted/15 text-text-muted'}`}>{b.status}</span></TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBonus ? 'Edit Bonus' : 'Add Bonus'}>
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          <Input label="Points" type="number" value={String(formData.points)} onChange={(e) => setFormData({...formData, points: Number(e.target.value)})} />
          <div><label className="block text-sm text-text-secondary mb-1">Type</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-card-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="login">Login</option><option value="achievement">Achievement</option></select></div>
          <Button onClick={handleSubmit} className="w-full">{editingBonus ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Bonuses;
