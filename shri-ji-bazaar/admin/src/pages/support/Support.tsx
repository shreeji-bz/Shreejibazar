import { useEffect, useState } from 'react';
import { getSupportTickets, updateTicket } from '../../services/authService';
import { TableRow, TableCell } from '../../components/common/Table';

interface Ticket { id: string; userName: string; subject: string; category: string; status: string; createdAt: string; }

export const Support = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  useEffect(() => { getSupportTickets().then((data: any) => { if (data.success) setTickets(data.data); }); }, []);

  const handleStatus = async (id: string, status: string) => { await updateTicket(id, { status }); };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary"><tr><th className="px-4 py-3 text-left text-text-muted">User</th><th className="px-4 py-3 text-left text-text-muted">Subject</th><th className="px-4 py-3 text-left text-text-muted">Category</th><th className="px-4 py-3 text-left text-text-muted">Status</th></tr></thead>
          <tbody className="divide-y divide-border">
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.userName}</TableCell>
                <TableCell>{t.subject}</TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell>
                  <select value={t.status} onChange={(e) => handleStatus(t.id, e.target.value)} className="bg-card-secondary border border-border rounded px-2 py-1 text-xs text-text-secondary">
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Support;
