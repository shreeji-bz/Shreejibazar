/**
 * Shri Ji Bazaar - Users Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';

export class UsersRepository {
  async findById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, mobile, email, avatar, referral_code, referred_by, status, last_login, created_at, updated_at, password_hash')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`UsersRepository.findById error for id=${id}:`, JSON.stringify(error));
      return null;
    }
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
    const mapped = (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      mobile: row.mobile,
      email: row.email,
      avatar: row.avatar,
      referralCode: row.referral_code,
      referredBy: row.referred_by,
      status: row.status,
      lastLogin: row.last_login ? new Date(row.last_login).toISOString() : null,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    }));
    return { data: mapped, meta: { total: count || 0, page, limit } };
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
