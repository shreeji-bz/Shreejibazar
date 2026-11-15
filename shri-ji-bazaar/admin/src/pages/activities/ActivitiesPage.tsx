import { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { get } from '../../services/api';

interface Activity {
  id: string;
  userId: string;
  userName?: string;
  activityType: string;
  description: string;
  pointsChange: number;
  gameName?: string;
  createdAt: string;
}

export const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchUserId, setSearchUserId] = useState('');
  const [filterType, setFilterType] = useState('');

  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get<{ success: boolean; data: Activity[] }>('/v1/admin/activities');
      if (response.success) {
        setActivities(response.data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const filteredActivities = activities.filter((activity) => {
    const matchesUserId = !searchUserId || activity.userId.toLowerCase().includes(searchUserId.toLowerCase());
    const matchesType = !filterType || activity.activityType.toLowerCase().includes(filterType.toLowerCase());
    return matchesUserId && matchesType;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatPoints = (points: number) => {
    const sign = points > 0 ? '+' : '';
    return `${sign}${points}`;
  };

  const POINTS_STYLES: Record<string, string> = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-text-muted',
  };

  const getPointsStyle = (points: number): string => {
    if (points > 0) return POINTS_STYLES.positive;
    if (points < 0) return POINTS_STYLES.negative;
    return POINTS_STYLES.neutral;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">User Activities</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-error/30 bg-error/10 text-error rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                placeholder="Search by user ID..."
                className="w-full pl-9 pr-4 py-2 bg-card-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold"
              />
            </div>
            <input
              type="text"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              placeholder="Filter by activity type..."
              className="min-w-[200px] px-4 py-2 bg-card-secondary border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold"
            />
            <button
              onClick={loadActivities}
              className="px-4 py-2 bg-gold text-text-primary text-sm font-medium rounded-lg hover:bg-gold-bright transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
              <span className="ml-3 text-text-muted">Loading activities...</span>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-16 text-text-muted">
              {activities.length === 0 ? 'No activities found' : 'No activities match your filters'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-text-muted font-medium">User</th>
                      <th className="px-4 py-3 text-left text-text-muted font-medium">Activity Type</th>
                      <th className="px-4 py-3 text-left text-text-muted font-medium">Description</th>
                      <th className="px-4 py-3 text-left text-text-muted font-medium">Points Change</th>
                      <th className="px-4 py-3 text-left text-text-muted font-medium">Game</th>
                      <th className="px-4 py-3 text-left text-text-muted font-medium">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-card-secondary">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-text-primary">{activity.userName || 'User'}</div>
                            <div className="text-xs text-text-muted font-mono">{activity.userId}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/15 text-gold">
                            {activity.activityType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{activity.description}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${getPointsStyle(activity.pointsChange)}`}>
                            {formatPoints(activity.pointsChange)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">{activity.gameName || '-'}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                          {formatDate(activity.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm text-text-muted">
                <span>
                  Showing {filteredActivities.length} of {activities.length} activities
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
