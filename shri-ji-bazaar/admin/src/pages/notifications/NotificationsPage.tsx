import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, CheckCheck, X, Bell } from 'lucide-react';
import { fetchNotifications, sendNotification, markAllRead } from '../../services/notification.service';
import { del } from '../../services/api';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert';
  target: 'all' | 'users';
  userIds?: string[];
  createdAt: string;
}

type NotificationType = 'info' | 'warning' | 'alert';
type NotificationTarget = 'all' | 'users';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Modal/form state
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formType, setFormType] = useState<NotificationType>('info');
  const [formTarget, setFormTarget] = useState<NotificationTarget>('all');
  const [formUserIds, setFormUserIds] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const result: any = await fetchNotifications();
      setNotifications(result.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadNotifications(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    try {
      const payload: any = {
        title: formTitle.trim(),
        message: formMessage.trim(),
        type: formType,
        target: formTarget,
      };
      if (formTarget === 'users') {
        payload.userIds = formUserIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);
      }
      await sendNotification(payload);
      setShowModal(false);
      resetForm();
      await loadNotifications();
    } catch (e: any) {
      setSendError(e.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      await loadNotifications();
    } catch (e: any) {
      setError(e.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    setProcessing(id);
    try {
      await del(`/v1/admin/notifications/${id}`);
      await loadNotifications();
    } catch (e: any) {
      setError(e.message || 'Failed to delete notification');
    } finally {
      setProcessing(null);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormMessage('');
    setFormType('info');
    setFormTarget('all');
    setFormUserIds('');
    setSendError(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    if (sending) return;
    setShowModal(false);
    resetForm();
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const typeStyles: Record<string, string> = {
    info: 'bg-gold/15 text-gold',
    warning: 'bg-gold/15 text-gold',
    alert: 'bg-error/15 text-error',
  };

  const targetStyles: Record<string, string> = {
    all: 'bg-success/15 text-success',
    users: 'bg-gold/15 text-gold',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Notifications Management</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-card border border-border rounded-lg hover:bg-card-secondary transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-gold rounded-lg hover:bg-gold-bright transition-colors"
            >
              <Plus className="w-4 h-4" />
              Send Notification
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-error/30 bg-error/10 text-error rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-text-muted animate-spin" />
              <span className="ml-3 text-text-muted">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-muted">No notifications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {notifications.map((n) => (
                    <tr key={n._id} className="hover:bg-card-secondary transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-text-primary whitespace-nowrap">
                        {n.title}
                      </td>
                      <td className="px-4 py-4 text-sm text-text-secondary max-w-xs truncate">
                        {n.message}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            typeStyles[n.type] || 'bg-card-tertiary text-text-muted'
                          }`}
                        >
                          {n.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            targetStyles[n.target] || 'bg-card-tertiary text-text-muted'
                          }`}
                        >
                          {n.target === 'all' ? 'All' : 'Users'}
                        </span>
                        {n.target === 'users' && n.userIds && n.userIds.length > 0 && (
                          <span className="ml-2 text-xs text-text-muted">
                            ({n.userIds.length})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-text-muted whitespace-nowrap">
                        {formatDate(n.createdAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(n._id)}
                          disabled={processing === n._id}
                          className="p-1.5 text-text-muted hover:text-error rounded-md hover:bg-error/10 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {processing === n._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-card border border-border rounded-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">Send Notification</h2>
              <button
                onClick={closeModal}
                disabled={sending}
                className="p-1 text-text-muted hover:text-text-primary rounded-md hover:bg-card-secondary transition-colors disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="p-6 space-y-4">
              {sendError && (
                <div className="p-3 border border-error/30 bg-error/10 text-error rounded-lg text-sm">
                  {sendError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  placeholder="Enter notification title"
                  className="w-full px-3 py-2 border border-border bg-card-secondary rounded-lg text-sm text-text-primary focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Message <span className="text-error">*</span>
                </label>
                <textarea
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  required
                  rows={3}
                  placeholder="Enter notification message"
                  className="w-full px-3 py-2 border border-border bg-card-secondary rounded-lg text-sm text-text-primary focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Type <span className="text-error">*</span>
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as NotificationType)}
                    className="w-full px-3 py-2 border border-border bg-card-secondary rounded-lg text-sm text-text-primary focus:outline-none focus:border-gold"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Target <span className="text-error">*</span>
                  </label>
                  <select
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value as NotificationTarget)}
                    className="w-full px-3 py-2 border border-border bg-card-secondary rounded-lg text-sm text-text-primary focus:outline-none focus:border-gold"
                  >
                    <option value="all">All</option>
                    <option value="users">Users</option>
                  </select>
                </div>
              </div>

              {formTarget === 'users' && (
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    User IDs <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formUserIds}
                    onChange={(e) => setFormUserIds(e.target.value)}
                    required
                    placeholder="Enter user IDs separated by commas"
                    className="w-full px-3 py-2 border border-border bg-card-secondary rounded-lg text-sm text-text-primary focus:outline-none focus:border-gold"
                  />
                  <p className="mt-1 text-xs text-text-muted">
                    Separate multiple user IDs with commas (e.g. abc123, def456)
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={sending}
                  className="px-4 py-2 text-sm font-medium text-text-primary bg-card border border-border rounded-lg hover:bg-card-secondary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-gold rounded-lg hover:bg-gold-bright transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Notification'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
