import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../../services/authService';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal, Input, Select } from '../../components/common';

interface Banner { id: string; title: string; image: string; action: string; status: string; sortOrder: number; }

export const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({ title: '', image: '', description: '', action: '', actionValue: '', sortOrder: 0 });

  const load = () => getBanners().then((data: any) => { if (data.success) setBanners(data.data); });
  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (editingBanner) await updateBanner(editingBanner.id, formData); else await createBanner(formData);
    setIsModalOpen(false); load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={() => { setEditingBanner(null); setFormData({ title: '', image: '', description: '', action: '', actionValue: '', sortOrder: 0 }); setIsModalOpen(true); }}><Plus size={16} className="mr-1.5" />Add Banner</Button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary"><tr><th className="px-4 py-3 text-left text-text-muted">Title</th><th className="px-4 py-3 text-left text-text-muted">Image</th><th className="px-4 py-3 text-left text-text-muted">Action</th><th className="px-4 py-3 text-left text-text-muted">Status</th><th className="px-4 py-3 text-left text-text-muted">Order</th></tr></thead>
          <tbody className="divide-y divide-border">
            {banners.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.title}</TableCell>
                <TableCell className="text-text-muted truncate max-w-xs">{b.image}</TableCell>
                <TableCell>{b.action}</TableCell>
                <TableCell>{b.status}</TableCell>
                <TableCell>{b.sortOrder}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBanner ? 'Edit Banner' : 'Add Banner'}>
        <div className="space-y-4">
          <Input label="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <Input label="Image URL" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
          <Input label="Action (web/deep_link)" value={formData.action} onChange={(e) => setFormData({...formData, action: e.target.value})} />
          <Button onClick={handleSubmit} className="w-full">{editingBanner ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Banners;
