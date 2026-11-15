import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Clock, Loader2, RefreshCw, Timer, X } from 'lucide-react';
import { paymentService } from '../../services/payment.service';
import { Button } from '../../components/common/Button';
import { Modal, Input } from '../../components/common';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import type { Payment } from '../../types/payment.types';

const TABS = ['pending', 'rejected', 'expired'] as const;
type Tab = (typeof TABS)[number] | 'all';

const TAB_LABELS: Record<string, string> = {
  all: 'All',
  pending: 'Pending',
  rejected: 'Rejected',
  expired: 'Expired',
};

/**
 * Admin-approved withdrawals queue: every withdrawal request with the
 * requester's identity, amount, payment details, request time, and their
 * CURRENT wallet balance/reservation. Live-updates on a 10s poll (the panel
 * has no socket infra today); a banner alerts on newly-arrived requests.
 * Admin gets ONLY the new-request alert — never a 3-4s reminder (that's a
 * user-side concern).
 */
export const WithdrawalRequestsPage = () => {
  const [data, setData] = useState<Payment[]>([]);
  const [tab, setTab] = useState<Tab>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [newAlert, setNewAlert] = useState<string | null>(null);
  const [expireBusy, setExpireBusy] = useState(false);
  const seenIds = useRef<Set<string> | null>(null); // null until first load

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
        const status = tab === 'all' ? 'pending' : tab;
        const rows = await paymentService.getWithdrawalRequests(status, 100);
        const list = tab === 'all' ? rows : rows; // backend filters per tab
        // New-request alert: any id not seen on a previous poll.
        const prev = seenIds.current;
        if (prev) {
          const fresh = rows.filter((r) => !prev.has(r.id));
          if (fresh.length > 0) {
            const first = fresh[0];
            setNewAlert(`New withdrawal request: ${first.userName || first.userMobile || 'a user'} — ₹${first.amount}`);
          }
        }
        seenIds.current = new Set(rows.map((r) => r.id));
        setData(list);
      } catch (e: any) {
        setError(e?.message || 'Failed to load withdrawal requests');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [tab],
  );

  useEffect(() => {
    seenIds.current = null; // reset fresh-request detection when switching tabs
    load();
  }, [load]);

  // Live polling — "real-time" listener for the admin.
  useEffect(() => {
    const t = setInterval(() => load(true), 10000);
    return () => clearInterval(t);
  }, [load]);

  const handleApprove = async (p: Payment) => {
    const note = window.prompt(`Approve withdrawal of ₹${p.amount} for ${p.userName || p.userMobile}? (optional note)`);
    if (note === null) return;
    setActionId(p.id);
    try {
      await paymentService.approvePayment(p.id, note || undefined);
      seenIds.current = null;
      await load(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to approve withdrawal');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejecting) return;
    setActionId(rejecting.id);
    try {
      await paymentService.rejectPayment(rejecting.id, rejectReason.trim() || undefined);
      setRejecting(null);
      setRejectReason('');
      seenIds.current = null;
      await load(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to reject withdrawal');
    } finally {
      setActionId(null);
    }
  };

  const handleRunExpiry = async () => {
    setExpireBusy(true);
    try {
      const { expired, skipped, reason } = await paymentService.runWithdrawalExpiry();
      let msg = expired ? `${expired} idle request(s) expired and released to the user.` : 'No idle requests to expire.';
      if (skipped > 0) msg += ` (${skipped} skipped${reason ? ` — ${reason}` : ''})`;
      alert(msg);
      seenIds.current = null;
      await load(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to run expiry');
    } finally {
      setExpireBusy(false);
    }
  };

  const rows = data;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-text-primary">Withdrawal Requests</h1>
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Timer size={12} /> live · 10s
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleRunExpiry} disabled={expireBusy}>
            {expireBusy ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />} Expire idle
          </Button>
          <Button variant="secondary" onClick={() => load()} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
      </div>

      {newAlert && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-warning/15 border border-warning text-warning text-sm">
          <AlertCircle size={16} />
          <span className="flex-1">{newAlert}</span>
          <button onClick={() => setNewAlert(null)} className="hover:opacity-70"><X size={14} /></button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          {(['all', ...TABS] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t ? 'bg-card-tertiary text-gold-bright' : 'bg-card-secondary text-text-secondary hover:bg-card-tertiary'
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <Table headers={['User', 'Amount', 'Method / Details', 'Wallet', 'Requested', 'Decision']}>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-text-muted py-8">
                {loading ? 'Loading withdrawal requests...' : 'No withdrawal requests here.'}
              </TableCell>
            </TableRow>
          )}
          {rows.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="font-medium text-text-primary">{p.userName || '-'}</div>
                <div className="text-xs text-text-muted">{p.userMobile || p.userId}</div>
              </TableCell>
              <TableCell className="font-medium text-text-primary">₹{p.amount}</TableCell>
              <TableCell className="text-xs text-text-muted">
                <div className="capitalize">{p.method}</div>
                {p.accountNumber || p.referenceId ? (
                  <div>{[p.accountHolderName, p.accountNumber, p.ifscCode, p.referenceId].filter(Boolean).join(' · ')}</div>
                ) : null}
              </TableCell>
              <TableCell className="text-xs text-text-muted">
                {p.walletBalance != null ? (
                  <>
                    <div>Wallet: ₹{p.walletBalance}</div>
                    <div className="text-text-muted/70">Reserved: ₹{p.pendingWithdrawal ?? 0} · Available: ₹{p.availableBalance ?? p.walletBalance}</div>
                  </>
                ) : '-'}
              </TableCell>
              <TableCell className="text-xs text-text-muted whitespace-nowrap">
                {new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </TableCell>
              <TableCell>
                {p.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" disabled={actionId !== null} onClick={() => handleApprove(p)}
                      className="!bg-success/15 !text-success hover:!bg-success/25">
                      {actionId === p.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approve
                    </Button>
                    <Button variant="outline" size="sm" disabled={actionId !== null}
                      onClick={() => { setRejecting(p); setRejectReason(''); }}
                      className="!border-error/40 !text-error">
                      {actionId === p.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />} Reject
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-text-muted">
                    <span className="capitalize">{p.status}</span>
                    {p.adminNotes ?? p.adminNote ? <div>{p.adminNotes ?? p.adminNote}</div> : null}
                    {p.rejectionReason && p.status === 'rejected' ? <div>Reason: {p.rejectionReason}</div> : null}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>

      {/* Reject with optional reason */}
      <Modal isOpen={!!rejecting} onClose={() => setRejecting(null)} title={`Reject withdrawal — ${rejecting?.userName || rejecting?.userMobile || ''}`}>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Rejecting releases the reserved ₹{rejecting?.amount} back to the user's available balance. The user is notified.
          </p>
          <Input label="Reason (optional)" placeholder="e.g. Unverifiable source of funds"
            value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setRejecting(null)}>Cancel</Button>
            <Button onClick={handleReject} disabled={actionId !== null} className="!bg-error !text-white hover:!bg-error/80">
              {actionId !== null ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WithdrawalRequestsPage;
