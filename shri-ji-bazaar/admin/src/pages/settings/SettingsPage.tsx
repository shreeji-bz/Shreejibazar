import { useState, useEffect } from 'react';

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
      const response = await import('../../services/api').then((m) => m.default.get('/v1/settings'));
      const data: SettingsData = response.data?.data ?? {};
      setSettings(data);
      setFormData({ ...data });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to load settings. Please try again.');
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
      const response = await import('../../services/api').then((m) => m.default.post('/v1/admin/settings', formData));
      setSettings({ ...formData });
      setSaveMessage({ type: 'success', text: response.data?.message ?? 'Settings saved successfully.' });
    } catch (err: any) {
      setSaveMessage({
        type: 'error',
        text: err?.response?.data?.message ?? 'Failed to save settings. Please try again.',
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
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <button
            type="button"
            onClick={() => handleChange(key, !isActive)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              isActive ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={isActive}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
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
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <textarea
            value={value ?? ''}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={key.includes('email') ? 'email' : key.includes('hours') ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(e) => handleChange(key, key.includes('hours') || key.includes('version') ? Number(e.target.value) : e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder={`Enter ${label.toLowerCase()}...`}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(formData);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage application configuration and feature toggles.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {saveMessage && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
              saveMessage.type === 'success'
                ? 'border border-green-200 bg-green-50 text-green-800'
                : 'border border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {saveMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {SETTING_CATEGORIES.map((category) => (
            <div key={category.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{category.title}</h2>
              <div className="space-y-5">
                {category.keys.map((key) => (
                  <div key={key} className="space-y-1">
                    {renderField(key)}
                    <p className="text-xs text-gray-400">{DESCRIPTION_MAP[key] ?? ''}</p>
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
