import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import type { Payment } from '../../types/payment.types';
import { paymentService } from '../../services/payment.service';
import { Button } from '../../components/common/Button';
import { Modal, Textarea } from '../../components/common';
import { ProcessPaymentModal } from './ProcessPaymentModal';

const PAYMENT_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-warning/15', text: 'text-warning' },
  approved: { bg: 'bg-success/15', text: 'text-success' },
  rejected: { bg: 'bg-error/15', text: 'text-error' },
  completed: { bg: 'bg-info/15', text: 'text-info' },
};

export const PaymentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const urlAction = useMemo(() => searchParams.get('action'), [searchParams]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    paymentService.getPaymentById(id)
      .then((data) => {
        setPayment(data);
        if (urlAction === 'approve' && data.status === 'pending') {
          setActionType('approve');
          setActionModalOpen(true);
        } else if (urlAction === 'reject' && data.status === 'pending') {
          setActionType('reject');
          setActionModalOpen(true);
        }
      })
      .catch(() => setError('Failed to load payment details'))
      .finally(() => setLoading(false));
  }, [id, urlAction]);

  const handleActionSuccess = (updated: Payment) => {
    setPayment(updated);
    setActionModalOpen(false);
    setActionType(null);
    navigate(`/payments/${updated.id}`, { replace: true });
  };

  if (loading) {
    return <div className="p-6 text-center text-text-muted">Loading payment details...</div>;
  }

  if (error || !payment) {
    return (
      <div className="p-6">
        <div className="bg-error/15 text-error rounded-lg p-4 text-sm">{error || 'Payment not found'}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/payments">
          <Button variant="outline" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Payment Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-text-muted text-sm">Payment ID</p>
                <p className="font-mono text-sm mt-1">{payment.id}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Type</p>
                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${payment.type === 'deposit' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                  {payment.type}
                </span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Amount</p>
                <p className="text-sm mt-1 font-semibold">{payment.amount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Method</p>
                <p className="text-sm mt-1">{payment.method}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Status</p>
                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[payment.status]?.bg ?? 'bg-text-muted/15'} ${PAYMENT_STATUS_COLORS[payment.status]?.text ?? 'text-text-muted'}`}>
                  {payment.status}
                </span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Reference ID</p>
                <p className="font-mono text-xs mt-1">{payment.referenceId}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Points Before</p>
                <p className="text-sm mt-1">{payment.pointsBefore.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Points After</p>
                <p className="text-sm mt-1">{payment.pointsAfter.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Points Deducted</p>
                <p className="text-sm mt-1">{payment.pointsDeducted.toLocaleString('en-IN')}</p>
              </div>
              {payment.processedAt && (
                <div>
                  <p className="text-text-muted text-sm">Processed At</p>
                  <p className="text-sm mt-1">{new Date(payment.processedAt).toLocaleString('en-IN')}</p>
                </div>
              )}
              <div>
                <p className="text-text-muted text-sm">Created At</p>
                <p className="text-sm mt-1">{new Date(payment.createdAt).toLocaleString('en-IN')}</p>
              </div>
              {payment.notes && (
                <div className="md:col-span-2">
                  <p className="text-text-muted text-sm">Notes</p>
                  <p className="text-sm mt-1 bg-card-secondary rounded-lg p-2">{payment.notes}</p>
                </div>
              )}
              {payment.adminNote && (
                <div className="md:col-span-2">
                  <p className="text-text-muted text-sm">Admin Note</p>
                  <p className="text-sm mt-1 bg-card-secondary rounded-lg p-2">{payment.adminNote}</p>
                </div>
              )}
              {payment.processedBy && (
                <div>
                  <p className="text-text-muted text-sm">Processed By</p>
                  <p className="text-sm mt-1">{payment.processedBy}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">User Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-text-muted text-sm">Name</p>
                <p className="text-sm mt-1 font-medium">{payment.userName}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Mobile</p>
                <p className="text-sm mt-1">{payment.userMobile}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">User ID</p>
                <p className="font-mono text-xs mt-1">{payment.userId}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              {payment.status === 'pending' && (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => { setActionType('approve'); setActionModalOpen(true); }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-error/30 text-error hover:bg-error/10"
                    onClick={() => { setActionType('reject'); setActionModalOpen(true); }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProcessPaymentModal
        isOpen={actionModalOpen}
        onClose={() => { setActionModalOpen(false); setActionType(null); }}
        payment={payment}
        actionType={actionType}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
};

export default PaymentDetailPage;
