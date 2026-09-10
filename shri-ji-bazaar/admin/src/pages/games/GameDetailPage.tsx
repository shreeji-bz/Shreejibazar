import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { setCurrentGame } from '../../store/game.slice';

export const GameDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const current = useSelector((state: RootState) => state.games.current);

  useEffect(() => {
    if (id && (!current || current.id !== id)) {
      // In a full implementation, fetch the game by ID here
      dispatch(setCurrentGame(null));
    }
  }, [id, current, dispatch]);

  if (!current) {
    return (
      <div className="p-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft size={18} className="mr-2" /> Back to Games
        </button>
        <p className="text-text-muted">No game selected. Click a game row on the Games page.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-text-muted hover:text-text-primary mb-6">
        <ArrowLeft size={18} className="mr-2" /> Back to Games
      </button>

      <h1 className="text-2xl font-bold mb-6">Game Detail</h1>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-text-muted mb-1">Name</p>
            <p className="font-medium">{current.name}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">Slug</p>
            <p className="font-medium text-text-secondary">{current.slug}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">Status</p>
            <span className={`px-2 py-0.5 rounded text-xs ${
              current.status === 'active' ? 'bg-success/15 text-success' :
              current.status === 'maintenance' ? 'bg-gold/15 text-gold' :
              'bg-text-muted/15 text-text-muted'
            }`}>{current.status}</span>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">Popular</p>
            <p className="font-medium">{current.isPopular ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">Opening Time</p>
            <p className="font-medium">{current.openingTime || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-text-muted mb-1">Closing Time</p>
            <p className="font-medium">{current.closingTime || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailPage;
