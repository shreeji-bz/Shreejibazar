import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBanners, updateBanner, deleteBanner } from '../../services/banner.service';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url?: string;
  link?: string;
  status: string;
  [key: string]: any;
}

const BannersPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchBanners();
        if (response.success && Array.isArray(response.data)) {
          setBanners(response.data);
        } else {
          setBanners(response.data || []);
        }
      } catch (err) {
        setError('Failed to load banners. Please try again later.');
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      setUpdatingId(id);
      await updateBanner(id, { status: newStatus });
      setBanners((prev) =>
        prev.map((banner) =>
          banner.id === id ? { ...banner, status: newStatus } : banner
        )
      );
    } catch (err) {
      setError('Failed to update banner status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }
    try {
      setDeletingId(id);
      await deleteBanner(id);
      setBanners((prev) => prev.filter((banner) => banner.id !== id));
    } catch (err) {
      setError('Failed to delete banner. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Banners Management</h1>
          <button
            onClick={() => navigate('/banners/create')}
            className="px-4 py-2 bg-gold text-text-primary rounded-lg hover:bg-gold-bright transition-colors"
          >
            Create Banner
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error/10 p-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-10 w-10 text-gold"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm text-text-muted">Loading banners...</p>
            </div>
          </div>
        ) : (
          /* Banners Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.length === 0 ? (
              <div className="col-span-full bg-card border border-border rounded-xl p-12 text-center">
                <p className="text-sm text-text-muted">No banners found. Click "Create Banner" to add your first banner.</p>
              </div>
            ) : (
              banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`bg-card border rounded-xl p-6 ${
                    banner.status === 'active'
                      ? 'border-success'
                      : 'border-border'
                  }`}
                >
                  {/* Image Preview */}
                  {banner.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden bg-card-secondary">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Title & Subtitle */}
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-sm text-text-secondary mb-2">{banner.subtitle}</p>
                  )}

                  {/* Link */}
                  {banner.link && (
                    <p className="text-sm text-gold mb-3 truncate">
                      {banner.link}
                    </p>
                  )}

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        banner.status === 'active'
                          ? 'bg-success/15 text-success'
                          : 'bg-card-tertiary text-text-muted'
                      }`}
                    >
                      {banner.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/banners/edit/${banner.id}`)}
                      className="px-3 py-1.5 text-xs font-medium text-gold bg-gold/15 rounded-lg hover:bg-gold/25 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(banner.id, banner.status)}
                      disabled={updatingId === banner.id}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        banner.status === 'active'
                          ? 'text-error bg-error/10 hover:bg-error/20'
                          : 'text-gold bg-gold/15 hover:bg-gold/25'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updatingId === banner.id ? 'Updating...' : banner.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      disabled={deletingId === banner.id}
                      className="px-3 py-1.5 text-xs font-medium text-error bg-error/10 rounded-lg hover:bg-error/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === banner.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannersPage;
