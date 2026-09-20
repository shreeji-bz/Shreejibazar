import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { getNotifications, createNotification } from '../../services/authService';
import { TableRow, TableCell } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Modal, Input } from '../../components/common';

interface Notification { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string; }

export const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', message: '', type: 'info' });

  const load = () => getNotifications({ page: 1, limit: 50 }).then((data: any) => { if (data.success) setNotifications(data.data); });
  useEffect(() => { load(); }, []);

  const handleSend = async () => { await createNotification(formData); setIsModalOpen(false); setFormData({ title: '', message: '', type: 'info' }); load(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button onClick={() => setIsModalOpen(true)}><Plus size={16} className="mr-1.5" />Send</Button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary"><tr><th className="px-4 py-3 text-left text-text-muted">Title</th><th className="px-4 py-3 text-left text-text-muted">Message</th><th className="px-4 py-3 text-left text-text-muted">Type</th><th className="px-4 py-3 text-left text-text-muted">Date</th></tr></thead>
          <tbody className="divide-y divide-border">
            {notifications.map((n) => (
              <TableRow key={n.id}>
                <TableCell>{n.title}</TableCell>
                <TableCell className="max-w-xs truncate">{n.message}</TableCell>
                <TableCell>{n.type}</TableCell>
                <TableCell>{new Date(n.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Send Notification">
        <div className="space-y-4">
          <Input label="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <div><label className="block text-sm text-text-secondary mb-1">Message</label><textarea className="w-full bg-card-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary h-24" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} /></div>
          <div><label className="block text-sm text-text-secondary mb-1">Type</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-card-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"><option value="info">Info</option><option value="alert">Alert</option><option value="promotion">Promotion</option></select></div>
          <Button onClick={handleSend} className="w-full">Send</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Notifications;
