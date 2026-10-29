import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, Video } from 'lucide-react';
import { appsettingsService } from '../../services/appsettings.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const VIDEO_KEY = 'app.video_url';

export const VideosPage = () => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await appsettingsService.getVideoSettings();
      setValue(settings[VIDEO_KEY] ?? '');
    } catch (e: any) {
      setError(e?.message || 'Failed to load video settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await appsettingsService.saveVideoSetting(VIDEO_KEY, value);
      setSaved(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to save video URL');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Video size={22} className="text-gold-bright" />
        <h1 className="text-2xl font-bold text-text-primary">Video</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gold-bright" />
          <span className="ml-3 text-text-secondary">Loading video settings...</span>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-text-primary font-medium mb-0.5">Video URL</p>
          <p className="text-text-muted text-xs mb-2">{VIDEO_KEY} (YouTube / embed URL)</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="flex items-center gap-2">
              {value && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ExternalLink size={14} /> Watch
                </a>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          {saved && <p className="mt-2 text-xs text-success">Saved</p>}
        </div>
      )}
    </div>
  );
};

export default VideosPage;
