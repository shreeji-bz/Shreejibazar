import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import type { WagerDetail } from '../../types/wager.types';
import { wagerService } from '../../services/wager.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wager: WagerDetail | null;
  onVoid: (wager: WagerDetail) => void;
  onError: (msg: string) => void;
}

export const VoidWagerModal = ({ isOpen, onClose, wager, onVoid, onError }: Props) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!wager) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      const updated = await wagerService.voidWager(wager.id, reason.trim());
      onVoid(updated);
      setReason('');
    } catch (err: any) {
      onError(err.message || 'Failed to void wager');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Void Wager">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
          <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">This action cannot be undone</p>
            <p className="text-xs text-text-muted mt-1">Voiding will refund the stake to the user and cancel the wager permanently.</p>
          </div>
        </div>

        <div className="bg-card-secondary rounded-lg p-3 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-text-muted">Wager ID</span>
            <span className="font-mono text-xs">{wager.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">User</span>
            <span className="text-text-primary">{wager.userName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Game</span>
            <span className="text-text-primary">{wager.gameName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Round</span>
            <span className="text-text-primary">#{String(wager.roundNumber).padStart(3, '0')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Stake</span>
            <span className="text-text-primary font-semibold">{wager.stake.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <Input
          label="Reason for Voiding"
          placeholder="Enter reason (required)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-error hover:bg-error/90"
            disabled={!reason.trim() || loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-1.5" />
                Voiding...
              </>
            ) : (
              'Confirm Void'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
