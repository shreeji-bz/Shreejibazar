import { useEffect, useState } from 'react';
import { RefreshCw, Send } from 'lucide-react';
import { fetchTickets, updateTicket, replyToTicket } from '../../services/support.service';
import { Button } from '../../components/common/Button';
import { Modal, Input } from '../../components/common';
import { TableRow, TableCell } from '../../components/common/Table';

interface Ticket {
  id: string;
  user_id?: string;
  subject: string;
  category: string;
  description?: string;
  status: string;
  priority?: string;
  created_at?: string;
  support_messages?: any[];
  [key: string]: any;
}

const STATUSES = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];

/**
 * Real Support-ticket management (list / change status / reply) against the
 * admin endpoints. Previously this menu rendered a 2-line placeholder stub.
 */
export const TicketsPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyFor, setReplyFor] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await fetchTickets();
      if (res?.success && Array.isArray(res.data)) setTickets(res.data);
      else setTickets(Array.isArray(res?.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (t: Ticket, status: string) => {
    try {
      setBusy(true);
      await updateTicket(t.id, { status });
      setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, status } : x)));
    } catch (e: any) {
      setError(e?.message || 'Failed to update ticket status');
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async () => {
    if (!replyFor || !replyText.trim()) return;
    try {
      setBusy(true);
      await replyToTicket(replyFor.id, { message: replyText.trim() });
      setReplyFor(null);
      setReplyText('');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to send reply');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Support Tickets</h1>
        <Button onClick={() => load()}><RefreshCw size={14} className="mr-1.5" />Refresh</Button>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card-secondary">
            <tr>
              <th className="px-4 py-3 text-left text-text-muted">Subject</th>
              <th className="px-4 py-3 text-left text-text-muted">Category</th>
              <th className="px-4 py-3 text-left text-text-muted">Priority</th>
              <th className="px-4 py-3 text-left text-text-muted">Status</th>
              <th className="px-4 py-3 text-right text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-text-muted py-8">Loading...</TableCell></TableRow>
            ) : tickets.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-text-muted py-8">No support tickets yet.</TableCell></TableRow>
            ) : (
              tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="text-text-primary font-medium">{t.subject}</div>
                    {t.description && <div className="text-xs text-text-muted truncate max-w-xs">{t.description}</div>}
                  </TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>{t.priority || 'medium'}</TableCell>
                  <TableCell>
                    <select
                      value={t.status}
                      disabled={busy}
                      onChange={(e) => changeStatus(t, e.target.value)}
                      className="bg-card-secondary border border-border rounded px-2 py-1 text-xs text-text-secondary"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={() => { setReplyFor(t); setReplyText(''); }} disabled={busy}>
                        <Send size={13} className="mr-1" />Reply
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={!!replyFor} onClose={() => setReplyFor(null)} title={`Reply to "${replyFor?.subject ?? ''}"`}>
        <div className="space-y-4">
          <Input label="Reply" value={replyText} onChange={(e: any) => setReplyText(e.target.value)} placeholder="Type your reply to the user..." />
          <Button onClick={sendReply} disabled={busy || !replyText.trim()} className="w-full">
            {busy ? 'Sending...' : 'Send Reply'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TicketsPage;
