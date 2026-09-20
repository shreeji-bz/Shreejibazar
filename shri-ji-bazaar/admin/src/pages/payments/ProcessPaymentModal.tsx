import { useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import type { Payment } from '../../types/payment.types';
import { paymentService } from '../../services/payment.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  actionType: 'approve' | 'reject' | null;
  onSuccess: (payment: Payment) => void;
}

export const ProcessPaymentModal = ({ isOpen, onClose, payment, actionType, onSuccess }: Props) => {
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!payment || !actionType) return null;

  const isApprove = actionType === 'approve';
  const title = isApprove ? 'Approve Payment' : 'Reject Payment';
  const submitLabel = isApprove ? 'Approve' : 'Reject';
  const submitClass = isApprove
    ? 'bg-success hover:bg-success/90'
    : 'border-error/30 text-error hover:bg-error/10';

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const updated = isApprove
        ? await paymentService.approvePayment(payment.id, adminNote.trim() || undefined)
        : await paymentService.rejectPayment(payment.id, adminNote.trim() || undefined);
      onSuccess(updated);
      setAdminNote('');
    } catch (err: any) {
      setError(err.message || `Failed to ${actionType} payment`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAdminNote('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        {error && (
          <div className="px-4 py-3 bg-error/15 text-error rounded-lg text-sm">{error}</div>
        )}

        <div className="flex items-start gap-3 p-3 bg-card-secondary rounded-lg">
          {isApprove ? (
            <CheckCircle size={20} className="text-success shrink-0 mt-0.5" />
          ) : (
            <XCircle size={20} className="text-error shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-medium text-text-primary">
              {isApprove ? (
                <>
                  Approving this {payment.type} will {payment.type === 'deposit' ? 'credit' : 'deduct'} <span className="font-semibold">{payment.amount.toLocaleString('en-IN')} points</span> to/from the user&apos;s wallet.
                </>
              ) : (
                <>
                  Rejecting this {payment.type} will {payment.pointsDeducted > 0 ? 'refund the deducted points back to the user' : 'cancel the transaction'}.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="bg-card-secondary rounded-lg p-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-text-muted">Payment ID</span>
            <span className="font-mono text-xs">{payment.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">User</span>
            <span className="text-text-primary">{payment.userName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Type</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payment.type === 'deposit' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
              {payment.type}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Amount</span>
            <span className="text-text-primary font-semibold">{payment.amount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Method</span>
            <span className="text-text-primary">{payment.method}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Reference</span>
            <span className="font-mono text-xs">{payment.referenceId}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Admin Note {isApprove ? '(optional)' : '(optional)'}</label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder={isApprove ? 'Add a note (optional)' : 'Add a note explaining the rejection (optional)'}
            className="w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold min-h-[80px] resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={`flex-1 ${submitClass}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-1.5" />
                {isApprove ? 'Approving...' : 'Rejecting...'}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
