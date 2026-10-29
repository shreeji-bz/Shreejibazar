import { useEffect, useState } from 'react';
import { Loader2, Package } from 'lucide-react';
import { appsettingsService } from '../../services/appsettings.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const APK_FIELDS = [
  { key: 'app.apk_url', label: 'APK Download URL', type: 'text', placeholder: 'https://example.com/app.apk' },
  { key: 'app.apk_version', label: 'APK Version', type: 'text', placeholder: 'e.g. 2.4.0' },
  { key: 'app.apk_changelog', label: 'Changelog / Update Notes', type: 'textarea', placeholder: 'What is new in this version...' },
];

export const ApkManagerPage = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setValues(await appsettingsService.getApkSettings());
    } catch (e: any) {
      setError(e?.message || 'Failed to load APK settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (key: string) => {
    setSavingKey(key);
    setSavedKey(null);
    try {
      await appsettingsService.saveApkSetting(key, values[key] ?? '');
      setSavedKey(key);
    } catch (e: any) {
      setError(e?.message || 'Failed to save APK setting');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Package size={22} className="text-gold-bright" />
        <h1 className="text-2xl font-bold text-text-primary">Apk Manager</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gold-bright" />
          <span className="ml-3 text-text-secondary">Loading APK settings...</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {APK_FIELDS.map(({ key, label, type, placeholder }) => (
            <div key={key} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <p className="text-text-primary font-medium mb-0.5">{label}</p>
                <p className="text-text-muted text-xs mb-2">{key}</p>
                {type === 'textarea' ? (
                  <textarea
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    rows={4}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold resize-y"
                  />
                ) : (
                  <Input
                    type={type}
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                  />
                )}
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-2">
                <Button onClick={() => handleSave(key)} disabled={savingKey !== null}>
                  {savingKey === key ? 'Saving...' : 'Save'}
                </Button>
                {savedKey === key && <span className="text-xs text-success">Saved</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApkManagerPage;
