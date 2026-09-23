import { supabase } from '../../../config/database.config';
import { invalidateSettingsCache } from '../../../common/utils/settings.util';

export class SettingsRepository {
  async getAll() {
    const { data } = await supabase.from('settings').select('*').order('key');
    invalidateSettingsCache();
    return (data || []).map((row: any) => ({
      key: row.key,
      value: row.value,
      type: row.type || 'text',
      updatedAt: row.updated_at,
    }));
  }

  async getByKey(key: string) {
    const { data } = await supabase.from('settings').select('*').eq('key', key).single();
    return data;
  }

  async set(key: string, value: string) {
    const result = await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }).select().single();
    invalidateSettingsCache();
    return result;
  }

  async setMany(updates: Record<string, string>) {
    const rows = Object.entries(updates).map(([key, value]) => ({ key, value: String(value), updated_at: new Date().toISOString() }));
    const result = await supabase.from('settings').upsert(rows);
    invalidateSettingsCache();
    return result;
  }
}
