import { useEffect, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { appsettingsService } from '../../services/appsettings.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const MEDIA_KEYS = [
  { key: 'app.image_banner', label: 'Image Banner', placeholder: 'https://example.com/banner.png' },
  { key: 'app.image_splash', label: 'Image Splash', placeholder: 'https://example.com/splash.png' },
  { key: 'app.image_header', label: 'Image Header', placeholder: 'https://example.com/header.png' },
];

export const AppImagesPage = () => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setValues(await appsettingsService.getMediaSettings());
    } catch (e: any) {
      setError(e?.message || 'Failed to load app images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSavingKey(key);
    setSavedKey(null);
    try {
      await appsettingsService.saveMediaSetting(key, value);
      setSavedKey(key);
    } catch (e: any) {
      setError(e?.message || 'Failed to save image');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ImagePlus size={22} className="text-gold-bright" />
        <h1 className="text-2xl font-bold text-text-primary">App Image</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gold-bright" />
          <span className="ml-3 text-text-secondary">Loading app images...</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {MEDIA_KEYS.map(({ key, label, placeholder }) => (
            <div key={key} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-1">
                  <p className="text-text-primary font-medium mb-0.5">{label}</p>
                  <p className="text-text-muted text-xs mb-2">{key}</p>
                  <Input
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                  />
                  <div className="mt-2 h-36 w-full rounded-lg border border-border bg-card-secondary overflow-hidden flex items-center justify-center">
                    {values[key] ? (
                      <img
                        src={values[key]}
                        alt={label}
                        className="max-h-36 max-w-full object-contain"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.display = ''; }}
                      />
                    ) : (
                      <span className="text-xs text-text-muted">No image URL set</span>
                    )}
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <Button onClick={() => handleSave(key, values[key] ?? '')} disabled={savingKey !== null}>
                    {savingKey === key ? 'Saving...' : 'Save'}
                  </Button>
                  {savedKey === key && <span className="text-xs text-success">Saved</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppImagesPage;
