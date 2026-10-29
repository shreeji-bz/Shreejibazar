import { useEffect, useState } from 'react';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { gameratesService, type PlayConfig } from '../../services/gamerates.service';
import { Button } from '../../components/common/Button';

export const GameRatesPage = () => {
  const [configs, setConfigs] = useState<PlayConfig[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await gameratesService.fetchPlayConfigs();
      setConfigs(data);
      setDrafts(Object.fromEntries(data.map((c) => [c.slug, JSON.stringify(c.config, null, 2)])));
    } catch (e: any) {
      setLoadError(e?.message || 'Failed to load play configs');
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (slug: string) => {
    const draft = drafts[slug];
    let parsed: Record<string, any>;
    try {
      parsed = JSON.parse(draft);
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, [slug]: `Invalid JSON: ${e.message}` }));
      setSavedSlug(null);
      return;
    }
    setSavingSlug(slug);
    setErrors((prev) => ({ ...prev, [slug]: '' }));
    setSavedSlug(null);
    try {
      await gameratesService.savePlayConfig(slug, parsed);
      setDrafts((prev) => ({ ...prev, [slug]: JSON.stringify(parsed, null, 2) }));
      setSavedSlug(slug);
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, [slug]: e?.message || 'Failed to save config' }));
    } finally {
      setSavingSlug(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gold-bright" />
        <span className="ml-3 text-text-secondary">Loading game rates...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal size={22} className="text-gold-bright" />
          <h1 className="text-2xl font-bold text-text-primary">Games Rate</h1>
        </div>
        <div className="p-4 rounded-lg bg-error/10 border border-error text-error text-sm">{loadError}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <SlidersHorizontal size={22} className="text-gold-bright" />
        <h1 className="text-2xl font-bold text-text-primary">Games Rate</h1>
      </div>
      <p className="text-sm text-text-muted mb-6">Rates drive per-game payout multipliers.</p>

      {configs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-5 text-center py-12 text-text-muted">No games with play configs found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {configs.map((c) => {
            const err = errors[c.slug] ?? '';
            const dirty = (drafts[c.slug] ?? '') !== JSON.stringify(c.config, null, 2);
            return (
              <div key={c.slug} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-text-primary">{c.name}</h3>
                  <span className="text-xs text-text-muted">{c.slug}</span>
                </div>
                <textarea
                  value={drafts[c.slug] ?? ''}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [c.slug]: e.target.value }))}
                  rows={8}
                  spellCheck={false}
                  className={`w-full px-3 py-2 bg-card-secondary border rounded-lg text-sm font-mono text-text-primary focus:outline-none resize-y ${
                    err ? 'border-error' : 'border-border focus:border-gold'
                  }`}
                />
                {err && <p className="mt-2 text-xs text-error">{err}</p>}
                {savedSlug === c.slug && !dirty && (
                  <p className="mt-2 text-xs text-success">Saved.</p>
                )}
                <div className="mt-3 flex justify-end">
                  <Button onClick={() => handleSave(c.slug)} disabled={savingSlug === c.slug}>
                    {savingSlug === c.slug ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GameRatesPage;
