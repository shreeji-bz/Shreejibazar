import { supabase } from '../../config/database.config';

type SettingsMap = Record<string, string>;

let cache: SettingsMap | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60_000;

export async function getSettingsMap(): Promise<SettingsMap> {
  const now = Date.now();
  if (cache && now < cacheExpiresAt) {
    return cache;
  }

  const { data, error } = await supabase.from('settings').select('key,value');
  if (error) {
    console.error('Settings fetch error:', JSON.stringify(error));
    return cache || {};
  }

  cache = {};
  (data || []).forEach((row: any) => { cache![row.key] = row.value; });
  cacheExpiresAt = now + CACHE_TTL_MS;
  return cache;
}

export function getCachedSetting(key: string, fallback?: string): string | undefined {
  if (!cache) return fallback;
  return cache[key] ?? fallback;
}

export function invalidateSettingsCache() {
  cache = null;
  cacheExpiresAt = 0;
}
