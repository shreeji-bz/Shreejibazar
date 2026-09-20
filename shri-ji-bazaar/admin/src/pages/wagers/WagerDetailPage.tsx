import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import type { WagerDetail } from '../../types/wager.types';
import { wagerService } from '../../services/wager.service';
import { Button } from '../../components/common/Button';
import { VoidWagerModal } from './VoidWagerModal';
import { useDispatch } from 'react-redux';
import { fetchWagerById } from '../../store/wager.slice';
import type { AppDispatch } from '../../store';

const PLAY_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-info/15', text: 'text-info' },
  close: { bg: 'bg-warning/15', text: 'text-warning' },
};

const WAGER_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-warning/15', text: 'text-warning' },
  active: { bg: 'bg-info/15', text: 'text-info' },
  won: { bg: 'bg-success/15', text: 'text-success' },
  lost: { bg: 'bg-error/15', text: 'text-error' },
  void: { bg: 'bg-text-muted/15', text: 'text-text-muted' },
};

export const WagerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [wager, setWager] = useState<WagerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voidModalOpen, setVoidModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    dispatch(fetchWagerById(id))
      .then((action) => setWager(action.payload as WagerDetail))
      .catch(() => setError('Failed to load wager details'))
      .finally(() => setLoading(false));
  }, [id, dispatch]);

  const handleVoidSuccess = (updated: WagerDetail) => {
    setWager(updated);
    setVoidModalOpen(false);
  };

  if (loading) {
    return <div className="p-6 text-center text-text-muted">Loading wager details...</div>;
  }

  if (error || !wager) {
    return (
      <div className="p-6">
        <div className="bg-error/15 text-error rounded-lg p-4 text-sm">{error || 'Wager not found'}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/wagers">
          <Button variant="outline" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Wager Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Wager Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-text-muted text-sm">Wager ID</p>
                <p className="font-mono text-sm mt-1">{wager.id}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Status</p>
                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${WAGER_STATUS_COLORS[wager.status]?.bg ?? 'bg-text-muted/15'} ${WAGER_STATUS_COLORS[wager.status]?.text ?? 'text-text-muted'}`}>
                  {wager.status}
                </span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Game</p>
                <p className="text-sm mt-1">{wager.gameName}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Round</p>
                <p className="text-sm mt-1">#{String(wager.roundNumber).padStart(3, '0')}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Play Type</p>
                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${PLAY_TYPE_COLORS[wager.playType]?.bg ?? 'bg-text-muted/15'} ${PLAY_TYPE_COLORS[wager.playType]?.text ?? 'text-text-muted'}`}>
                  {wager.playType}
                </span>
              </div>
              <div>
                <p className="text-text-muted text-sm">Selection</p>
                <p className="text-sm mt-1">{wager.selection}{wager.number ? ` - ${wager.number}` : ''}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Stake</p>
                <p className="text-sm mt-1 font-semibold">{wager.stake.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Potential Payout</p>
                <p className="text-sm mt-1 font-semibold text-gold-bright">{wager.potentialPayout.toLocaleString('en-IN')}</p>
              </div>
              {wager.resultStatus && (
                <div>
                  <p className="text-text-muted text-sm">Result Status</p>
                  <p className="text-sm mt-1">{wager.resultStatus}</p>
                </div>
              )}
              {wager.settledAt && (
                <div>
                  <p className="text-text-muted text-sm">Settled At</p>
                  <p className="text-sm mt-1">{new Date(wager.settledAt).toLocaleString('en-IN')}</p>
                </div>
              )}
              <div>
                <p className="text-text-muted text-sm">Created At</p>
                <p className="text-sm mt-1">{new Date(wager.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Points Deducted</p>
                <p className="text-sm mt-1">{wager.pointsDeducted.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Points Refunded</p>
                <p className="text-sm mt-1">{wager.pointsRefunded.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Points Paid Out</p>
                <p className="text-sm mt-1">{wager.pointsPaidOut.toLocaleString('en-IN')}</p>
              </div>
            </div>
            {wager.adminNote && (
              <div className="mt-4 p-3 bg-card-secondary rounded-lg">
                <p className="text-text-muted text-sm">Admin Note</p>
                <p className="text-sm mt-1">{wager.adminNote}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">User Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-text-muted text-sm">Name</p>
                <p className="text-sm mt-1 font-medium">{wager.userName}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">Mobile</p>
                <p className="text-sm mt-1">{wager.userMobile}</p>
              </div>
              <div>
                <p className="text-text-muted text-sm">User ID</p>
                <p className="font-mono text-xs mt-1">{wager.userId}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              {wager.status !== 'void' && (
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 text-error border-error/30 hover:bg-error/10"
                  onClick={() => setVoidModalOpen(true)}
                >
                  <AlertTriangle size={16} />
                  Void Wager
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <VoidWagerModal
        isOpen={voidModalOpen}
        onClose={() => { setVoidModalOpen(false); }}
        onError={(msg) => setError(msg)}
        wager={wager}
        onVoid={handleVoidSuccess}
      />
    </div>
  );
};

export default WagerDetailPage;
