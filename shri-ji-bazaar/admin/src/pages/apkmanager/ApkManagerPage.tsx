import { useEffect, useState } from 'react';
import { Loader2, Package, Save, Check, Info } from 'lucide-react';
import { appsettingsService } from '../../services/appsettings.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

/**
 * APK Manager — controls the "Update App" prompt shown in the mobile app.
 *
 * The app calls GET /system/status on launch (splash). It compares
 * `app.apk_version` to its own build version; when a newer one is found it
 * shows an "Update available" dialog with the changelog and a Download
 * button (url_launcher -> app.apk_url). `force_update_apk` makes that
 * dialog non-dismissible (users must update to continue).
 *
 * All values are plain settings rows — no rebuild, no DB migration. Save a
 * new APK URL + version here and the very next app launch picks it up.
 */
const TEXT_FIELDS = [
  { key: 'app.apk_url', label: 'APK Download URL', placeholder: 'https://golden-app.online/app/app.apk', hint: 'Public HTTPS URL the app downloads from' },
  { key: 'app.apk_version', label: 'APK Version', placeholder: 'e.g. 2.4.0', hint: 'Shown in the app; must be greater than the installed version to trigger the update prompt' },
  { key: 'app.apk_changelog', label: 'Changelog / What is New', placeholder: 'What is new in this version...', hint: 'Shown inside the update dialog (multiline)' },
];

export const ApkManagerPage = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

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

  useEffect(() => { load(); }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    setError(null);
    try {
      // Save every key in one pass (changelog may be empty = cleared).
      await Promise.all([
        appsettingsService.saveApkSetting('app.apk_url', values['app.apk_url'] ?? ''),
        appsettingsService.saveApkSetting('app.apk_version', values['app.apk_version'] ?? ''),
        appsettingsService.saveApkSetting('app.apk_changelog', values['app.apk_changelog'] ?? ''),
        appsettingsService.saveApkSetting('force_update_apk', values['force_update_apk'] === 'true' ? 'true' : 'false'),
      ]);
      setSavedAt(new Date().toLocaleString());
    } catch (e: any) {
      setError(e?.message || 'Failed to save APK settings');
    } finally {
      setSaving(false);
    }
  };

  const forceUpdate = values['force_update_apk'] === 'true';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package size={22} className="text-gold-bright" />
          <h1 className="text-2xl font-bold text-text-primary">Apk Manager</h1>
        </div>
        <Button onClick={handleSaveAll} disabled={saving || loading}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save All
        </Button>
      </div>

      {/* How this drives the app */}
      <div className="mb-4 p-3 rounded-lg bg-info/10 border border-info/30 text-info text-sm flex gap-2">
        <Info size={16} className="shrink-0 mt-0.5" />
        <span>
          The mobile app checks these values on every launch (splash screen). If <b>APK Version</b> is newer
          than the installed build, the app shows an "Update App" dialog with this changelog and a Download
          button that opens the <b>APK URL</b>. Enabling <b>Force Update</b> makes the dialog mandatory.
        </span>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>}
      {savedAt && (
        <div className="mb-4 p-3 rounded-lg bg-success/10 border border-success/30 text-success text-sm flex items-center justify-between">
          <span className="flex items-center gap-2"><Check size={14} /> Saved &amp; live — the next app launch will pick these up.</span>
          <span className="text-xs opacity-80">Updated {savedAt}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gold-bright" />
          <span className="ml-3 text-text-secondary">Loading APK settings...</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {TEXT_FIELDS.map(({ key, label, placeholder, hint }) => (
            <div key={key} className="p-4">
              <p className="text-text-primary font-medium">{label}</p>
              <p className="text-text-muted text-xs mb-2">{hint}</p>
              {key === 'app.apk_changelog' ? (
                <textarea
                  value={values[key] ?? ''}
                  onChange={(e) => setValues((p) => ({ ...p, [key]: e.target.value }))}
                  rows={4}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 bg-card-secondary border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:border-gold resize-y"
                />
              ) : (
                <Input
                  value={values[key] ?? ''}
                  onChange={(e) => setValues((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              )}
            </div>
          ))}

          {/* Force Update toggle */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-text-primary font-medium">Force Update</p>
              <p className="text-text-muted text-xs">When on, users cannot dismiss the update dialog and must install the new APK.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={forceUpdate}
              onClick={() => setValues((p) => ({ ...p, force_update_apk: forceUpdate ? 'false' : 'true' }))}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${forceUpdate ? 'bg-error' : 'bg-card-tertiary'}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-card shadow transform transition-transform ${forceUpdate ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApkManagerPage;
