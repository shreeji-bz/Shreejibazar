/**
 * Shri Ji Bazaar - Users Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';

export class UsersRepository {
  async findById(id: string): Promise<any | null> {
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data || null;
  }

  async findAll(options: any = {}): Promise<{ data: any[]; meta: any }> {
    let query = supabase.from('users').select('*', { count: 'exact' });

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,mobile.ilike.%${options.search}%`);
    }
    if (options.status) query = query.eq('status', options.status);

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);
    return { data: data || [], meta: { total: count || 0, page, limit } };
  }

  async update(id: string, data: any): Promise<any> {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.avatar) updateData.avatar = data.avatar;
    updateData.updated_at = new Date().toISOString();

    const { data: record } = await supabase.from('users').update(updateData).eq('id', id).select().single();
    return record;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await supabase.from('users').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await supabase.from('users').update({ password_hash: passwordHash, updated_at: new Date().toISOString() }).eq('id', id);
  }
}
