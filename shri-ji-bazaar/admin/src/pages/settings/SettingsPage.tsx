import { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';

interface SettingsData {
  [key: string]: any;
}

const SETTING_CATEGORIES = [
  {
    title: 'General',
    keys: ['app_name', 'support_email', 'contact_number'],
  },
  {
    title: 'Maintenance',
    keys: ['maintenance_mode', 'maintenance_message'],
  },
  {
    title: 'Payments',
    keys: ['min_deposit', 'min_withdrawal', 'max_withdrawal', 'withdrawal_processing_hours'],
  },
  {
    title: 'Features',
    keys: ['latest_version', 'force_update', 'enable_registration', 'enable_referral'],
  },
];

const DESCRIPTION_MAP: Record<string, string> = {
  app_name: 'Public display name of the application shown to users.',
  support_email: 'Email address for user support inquiries.',
  contact_number: 'Customer support contact number displayed in the app.',
  maintenance_mode: 'When enabled, all non-admin users will see a maintenance banner and cannot access app features.',
  maintenance_message: 'Custom message shown to users while the app is in maintenance mode.',
  min_deposit: 'Minimum deposit amount accepted from users.',
  min_withdrawal: 'Minimum withdrawal amount users can request.',
  max_withdrawal: 'Maximum withdrawal amount per transaction.',
  withdrawal_processing_hours: 'Estimated processing time for withdrawals in hours.',
  latest_version: 'Latest available app version code used to detect outdated installs.',
  force_update: 'When enabled, users on versions below latest_version cannot use the app until they update.',
  enable_registration: 'Allow new users to create accounts.',
  enable_referral: 'Enable the referral rewards system.',
};

const LABEL_MAP: Record<string, string> = {
  app_name: 'App Name',
  support_email: 'Support Email',
  contact_number: 'Contact Number',
  maintenance_mode: 'Maintenance Mode',
  maintenance_message: 'Maintenance Message',
  min_deposit: 'Minimum Deposit',
  min_withdrawal: 'Minimum Withdrawal',
  max_withdrawal: 'Maximum Withdrawal',
  withdrawal_processing_hours: 'Withdrawal Processing Hours',
  latest_version: 'Latest Version',
  force_update: 'Force Update',
  enable_registration: 'Enable Registration',
  enable_referral: 'Enable Referral',
};

export default function SettingsPage() {
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const [settings, setSettings] = useState<SettingsData>({});
  const [formData, setFormData] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Admin endpoint (authenticateAdmin). Response data is a [{key,value}]
      // array in this backend — normalize to a key->value object for the form.
      const response = await import('../../services/api').then((m) => m.get<any>('/v1/admin/settings'));
      // get() resolves the raw JSON body: { success, data }. `data` is a
      // [{key,value}] array in this backend — normalize it for the form.
      const raw = response?.data;
      let data: SettingsData = {};
      if (Array.isArray(raw)) {
        raw.forEach((row: any) => { if (row && row.key !== undefined) data[row.key] = row.value; });
      } else if (raw && typeof raw === 'object') {
        data = raw;
      }
      setSettings(data);
      setFormData({ ...data });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      // Backend batch endpoint is PUT /admin/settings (updateMultiple);
      // there is no POST /admin/settings route (it 404s "Route not found").
      await import('../../services/api').then((m) => m.put<any>('/v1/admin/settings', formData));
      setSettings({ ...formData });
      setSaveMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (err: any) {
      setSaveMessage({
        type: 'error',
        text: err?.message ?? 'Failed to save settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (key: string) => {
    const label = LABEL_MAP[key] ?? key;
    const value = formData[key];

    if (key === 'maintenance_mode' || key === 'force_update' || key === 'enable_registration' || key === 'enable_referral') {
      const isActive = value === true || value === 'true';
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">{label}</span>
          <button
            type="button"
            onClick={() => handleChange(key, !isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isActive ? 'bg-gold' : 'bg-card-tertiary'
            }`}
            role="switch"
            aria-checked={isActive}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      );
    }

    if (key === 'maintenance_message') {
      return (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
          <textarea
            value={value ?? ''}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-card-secondary px-3 py-2 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold resize-y"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
        <input
          type={key.includes('email') ? 'email' : key.includes('hours') ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(e) => handleChange(key, key.includes('hours') || key.includes('version') ? Number(e.target.value) : e.target.value)}
          className="w-full rounded-lg border border-border bg-card-secondary px-3 py-2 text-sm text-text-primary focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-gold" />
          <p className="text-sm text-text-muted">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-xl border border-error/30 bg-error/10 p-6 text-center">
          <p className="text-sm font-medium text-error">{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-4 rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:bg-error/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(formData);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Settings Management</h1>
            <p className="mt-1 text-sm text-text-muted">Manage application configuration and feature toggles.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-text-primary shadow-sm hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {saveMessage && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium border ${
              saveMessage.type === 'success'
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-error/30 bg-error/10 text-error'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        <div className="mb-6 bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-text-primary">Dark mode</span>
              <p className="text-xs text-text-muted mt-1">Switch the admin panel between light and dark themes.</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isDark ? 'bg-gold' : 'bg-card-tertiary'
              }`}
              role="switch"
              aria-checked={isDark}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-card shadow transform transition-transform duration-200 ease-in-out ${
                  isDark ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {SETTING_CATEGORIES.map((category) => (
            <div key={category.title} className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">{category.title}</h2>
              <div className="space-y-5">
                {category.keys.map((key) => (
                  <div key={key} className="space-y-1">
                    {renderField(key)}
                    <p className="text-xs text-text-muted">{DESCRIPTION_MAP[key] ?? ''}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
