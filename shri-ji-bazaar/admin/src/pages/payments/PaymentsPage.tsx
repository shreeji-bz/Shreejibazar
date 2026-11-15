import { useEffect, useState } from 'react';
import { Check, X, Loader2, Undo2 } from 'lucide-react';
import { paymentService } from '../../services/payment.service';
import type { PaginatedPaymentsResponse, Payment } from '../../types/payment.types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gold/15 text-gold',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-error/15 text-error',
  completed: 'bg-gold/15 text-gold',
};

const TYPE_STYLES: Record<string, string> = {
  deposit: 'bg-success/15 text-success',
  withdrawal: 'bg-gold/15 text-gold',
};

export const PaymentsPage = () => {
  const [data, setData] = useState<PaginatedPaymentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.getPayments({});
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await paymentService.approvePayment(id);
      await loadPayments();
    } catch (e: any) {
      setError(e.message || 'Failed to approve payment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await paymentService.rejectPayment(id);
      await loadPayments();
    } catch (e: any) {
      setError(e.message || 'Failed to reject payment');
    } finally {
      setProcessingId(null);
    }
  };

  // Remove/revert a completed deposit: cuts the points back out of the user's wallet.
  const handleRevert = async (id: string) => {
    const reason = window.prompt('Reason for reverting this deposit?') ?? '';
    if (reason === null) return; // prompt dismissed
    if (!window.confirm('This will immediately cut the credited amount out of the user\'s wallet. Continue?')) return;
    setProcessingId(id);
    try {
      await paymentService.revertPayment(id, reason || undefined);
      setError('');
      await loadPayments();
    } catch (e: any) {
      setError(e.message || 'Failed to revert payment');
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const payments: Payment[] = data?.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Payments Management</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-error/30 bg-error/10 text-error rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
              <span className="ml-3 text-text-muted">Loading payments...</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16 text-text-muted">No payments found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-text-muted font-medium">User</th>
                      <th className="px-4 py-3 text-left text-text-muted font-medium">Amount</th>
                      <th className="px-4 py-3 text-left text-text-muted font-medium">Type</th>
                      <th className="px-4 py-3 text-left text-text-muted font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-text-muted font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-text-muted font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-card-secondary">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-text-primary">{payment.userName}</div>
                            <div className="text-xs text-text-muted">{payment.userMobile}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-text-primary">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[payment.type] || 'bg-card-tertiary text-text-muted'}`}>
                            {payment.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[payment.status] || 'bg-card-tertiary text-text-muted'}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(payment.id)}
                              disabled={processingId === payment.id || payment.status !== 'pending'}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-success text-text-primary text-xs font-medium rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {processingId === payment.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(payment.id)}
                              disabled={processingId === payment.id || payment.status !== 'pending'}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-error text-text-primary text-xs font-medium rounded-lg hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {processingId === payment.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <X size={12} />
                              )}
                              Reject
                            </button>
                            {payment.type === 'deposit' && payment.status === 'completed' && (
                              <button
                                onClick={() => handleRevert(payment.id)}
                                disabled={processingId === payment.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gold text-text-primary text-xs font-medium rounded-lg hover:bg-gold-bright disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Remove this deposit and cut the points out of the user's wallet"
                              >
                                {processingId === payment.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Undo2 size={12} />
                                )}
                                Revert
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm text-text-muted">
                <span>
                  Showing {payments.length} of {data?.total ?? 0} payments
                </span>
                <span>
                  Page {data?.page ?? 1} of {data?.totalPages ?? 1}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
