import { supabase } from '../../../config/database.config';

export class SettingsRepository {
  async getAll() {
    const { data } = await supabase.from('settings').select('*').order('key');
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
    return supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }).select().single();
  }

  async setMany(updates: Record<string, string>) {
    const rows = Object.entries(updates).map(([key, value]) => ({ key, value: String(value), updated_at: new Date().toISOString() }));
    return supabase.from('settings').upsert(rows);
  }
}
