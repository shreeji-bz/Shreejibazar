/**
 * Shri Ji Bazaar - Settings Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';

export class SettingRepository {
  async findAll(): Promise<any[]> {
    const { data } = await supabase.from('settings').select('*').order('key');
    return data || [];
  }

  async findByKey(key: string): Promise<any | null> {
    const { data } = await supabase.from('settings').select('*').eq('key', key).single();
    return data || null;
  }

  async get(key: string): Promise<string | null> {
    const { data } = await supabase.from('settings').select('value').eq('key', key).single();
    return data?.value || null;
  }

  async set(key: string, value: any, type: string = 'string'): Promise<void> {
    const existing = await this.findByKey(key);
    if (existing) {
      await supabase.from('settings').update({ value, type, updated_at: new Date().toISOString() }).eq('key', key);
    } else {
      await supabase.from('settings').insert({ key, value, type });
    }
  }
}
