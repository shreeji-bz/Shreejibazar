import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, RefreshCw, X } from 'lucide-react';
import { reportsService } from '../../services/reports.service';
import { paymentService } from '../../services/payment.service';
import { Button } from '../../components/common/Button';
import { Table, TableRow, TableCell } from '../../components/common/Table';
import type { Payment, PaginatedPaymentsResponse } from '../../types/payment.types';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'completed', 'failed'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-500/15 text-yellow-600',
  approved: 'bg-green-500/15 text-green-600',
  rejected: 'bg-red-500/15 text-red-600',
  completed: 'bg-blue-500/15 text-blue-600',
  failed: 'bg-red-500/15 text-red-600',
};

interface WithdrawalsPageProps {
  methodFilter: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (dateStr?: string) =>
  dateStr ? new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

export const WithdrawalsPage = ({ methodFilter }: WithdrawalsPageProps) => {
  const [data, setData] = useState<PaginatedPaymentsResponse | null>(null);
  const [status, setStatus] = useState<StatusTab>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getWithdrawals(methodFilter, status, 1, 200);
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  }, [methodFilter, status]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (payment: Payment) => {
    const note = window.prompt('Approve withdrawal (optional note):');
    if (note === null) return;
    setActionId(payment.id);
    try {
      await paymentService.approvePayment(payment.id, note || undefined);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to approve withdrawal');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (payment: Payment) => {
    const note = window.prompt('Reject withdrawal (reason):');
    if (note === null) return;
    setActionId(payment.id);
    try {
      await paymentService.rejectPayment(payment.id, note || undefined);
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to reject withdrawal');
    } finally {
      setActionId(null);
    }
  };

  const payments: Payment[] = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Withdrawals ({methodFilter})</h1>
        <Button variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>
      )}

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                status === tab ? 'bg-card-tertiary text-gold-bright' : 'bg-card-secondary text-text-secondary hover:bg-card-tertiary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Table headers={['User', 'Amount', 'Method', 'Status', 'Reference', 'Requested', 'Actions']}>
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-text-muted py-8">
                {loading ? 'Loading withdrawals...' : 'No withdrawals found'}
              </TableCell>
            </TableRow>
          )}
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <div className="font-medium text-text-primary">{payment.userName}</div>
                <div className="text-xs text-text-muted">{payment.userMobile}</div>
              </TableCell>
              <TableCell className="font-medium text-text-primary">{formatCurrency(payment.amount)}</TableCell>
              <TableCell className="capitalize">{payment.method}</TableCell>
              <TableCell>
                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_BADGE[payment.status] ?? 'bg-card-tertiary text-text-secondary'}`}>
                  {payment.status}
                </span>
              </TableCell>
              <TableCell className="text-xs text-text-muted">{payment.referenceId || '-'}</TableCell>
              <TableCell className="text-xs text-text-muted whitespace-nowrap">{formatDate(payment.createdAt)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {payment.status === 'pending' ? (
                    <>
                      <Button variant="secondary" size="sm" disabled={actionId !== null} onClick={() => handleApprove(payment)} className="!bg-success/15 !text-success hover:!bg-success/25">
                        {actionId === payment.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approve
                      </Button>
                      <Button variant="outline" size="sm" disabled={actionId !== null} onClick={() => handleReject(payment)} className="!border-error/40 !text-error">
                        {actionId === payment.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />} Reject
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-text-muted">
                      {payment.adminNote ? `Note: ${payment.adminNote}` : '-'}
                    </span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>

        {payments.length > 0 && data && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm text-text-muted">
            <span>Showing {payments.length} of {data.total} withdrawals</span>
            <span>Page {data.page} of {data.totalPages}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalsPage;
