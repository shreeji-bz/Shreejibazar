import { useState } from 'react';
import { adjustPoints } from '../../services/points.service';

interface AdjustPointsPageProps {
  userId: string;
  onClose: () => void;
}

export const AdjustPointsPage = ({ userId, onClose }: AdjustPointsPageProps) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!parsed || parsed === 0) {
      setError('Enter a non-zero amount (positive to add, negative to deduct).');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adjustPoints({ userId, amount: parsed, reason: reason.trim() || undefined });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to adjust points');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-text-primary">Adjust Points — {userId}</h1>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">Close</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 border border-error/30 bg-error/10 text-error rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm text-text-secondary mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Use positive to add, negative to deduct"
            className="w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Why are you adjusting this user's points?"
            className="w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold resize-none"
          />
        </div>

        <button type="submit" disabled={saving} className="w-full px-4 py-2.5 bg-gold text-text-primary rounded-lg font-medium text-sm hover:bg-gold-bright transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : 'Adjust Points'}
        </button>
      </form>
    </div>
  );
};
