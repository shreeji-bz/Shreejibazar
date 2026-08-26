/**
 * Shri Ji Bazaar - Settings Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';
import type { SettingEntity } from '../entities/setting.entity';
import type { ISettingsRepository } from '../interfaces/settings.interface';

export class SettingsRepository implements ISettingsRepository {
  async findAll(): Promise<SettingEntity[]> {
    const { data } = await supabase
      .from('settings')
      .select('id, key, value, type, created_at, updated_at')
      .order('key', { ascending: true });

    return (data || []).map((row: any) => ({
      id: row.id,
      key: row.key,
      value: row.value,
      type: row.type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async findByKey(key: string): Promise<SettingEntity | null> {
    const { data } = await supabase
      .from('settings')
      .select('id, key, value, type, created_at, updated_at')
      .eq('key', key)
      .single();

    if (!data) return null;
    return {
      id: data.id,
      key: data.key,
      value: data.value,
      type: data.type,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async update(key: string, value: string): Promise<void> {
    await supabase
      .from('settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);
  }

  async updateMany(settings: Array<{ key: string; value: string }>): Promise<void> {
    const rows = settings.map((s) => ({
      key: s.key,
      value: s.value,
      updated_at: new Date().toISOString(),
    }));

    await supabase.from('settings').upsert(rows, { onConflict: 'key' });
  }
}
