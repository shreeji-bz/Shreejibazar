import { useEffect, useState } from 'react';
import { Check, X, Loader2, Undo2 } from 'lucide-react';
import { paymentService } from '../../services/payment.service';
import type { PaginatedPaymentsResponse, Payment } from '../../types/payment.types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

const TYPE_STYLES: Record<string, string> = {
  deposit: 'bg-emerald-50 text-emerald-700',
  withdrawal: 'bg-orange-50 text-orange-700',
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              <span className="ml-3 text-gray-500">Loading payments...</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No payments found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">User</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">Amount</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">Type</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-gray-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{payment.userName}</div>
                            <div className="text-xs text-gray-400">{payment.userMobile}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLES[payment.type] || 'bg-gray-100 text-gray-700'}`}>
                            {payment.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[payment.status] || 'bg-gray-100 text-gray-700'}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(payment.id)}
                              disabled={processingId === payment.id || payment.status !== 'pending'}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
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
