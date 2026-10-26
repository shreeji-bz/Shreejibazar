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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Banners Management</h1>
          <button
            onClick={() => navigate('/banners/create')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Banner
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="animate-spin h-10 w-10 text-indigo-600"
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
              <p className="text-gray-500 text-sm">Loading banners...</p>
            </div>
          </div>
        ) : (
          /* Banners Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-sm text-gray-500">No banners found. Click "Create Banner" to add your first banner.</p>
              </div>
            ) : (
              banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                    banner.status === 'active'
                      ? 'border-green-500'
                      : 'border-gray-200'
                  }`}
                >
                  {/* Image Preview */}
                  {banner.image_url && (
                    <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>
                  )}

                  {/* Link */}
                  {banner.link && (
                    <p className="text-sm text-indigo-600 mb-3 truncate">
                      {banner.link}
                    </p>
                  )}

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        banner.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {banner.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/banners/edit/${banner.id}`)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(banner.id, banner.status)}
                      disabled={updatingId === banner.id}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        banner.status === 'active'
                          ? 'text-red-700 bg-red-50 hover:bg-red-100'
                          : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updatingId === banner.id ? 'Updating...' : banner.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      disabled={deletingId === banner.id}
                      className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
