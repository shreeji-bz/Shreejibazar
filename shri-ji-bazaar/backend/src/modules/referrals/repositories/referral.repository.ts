/**
 * Shri Ji Bazaar - Referrals Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';

export class ReferralRepository {
  async findAll(options?: any): Promise<{ data: any[]; meta: any }> {
    let query = supabase.from('referrals').select('*');
    if (options?.referrerId) query = query.eq('referrer_id', options.referrerId);
    const page = Math.max(1, parseInt(options?.page || '1'));
    const limit = Math.min(100, parseInt(options?.limit || '20'));
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);
    return { data: data || [], meta: { total: count || 0, page, limit } };
  }

  async findById(id: string): Promise<any | null> {
    const { data } = await supabase.from('referrals').select('*').eq('id', id).single();
    return data || null;
  }

  async create(data: any): Promise<any> {
    const { data: record } = await supabase.from('referrals').insert({
      referrer_id: data.referrerId,
      referred_user_id: data.referredUserId,
      points: data.points || 0,
      status: 'pending',
    }).select().single();
    return record;
  }

  async complete(referralId: string): Promise<void> {
    await supabase.from('referrals').update({ status: 'completed' }).eq('id', referralId);
  }

  async getStats(referrerId?: string): Promise<{ total: number; completed: number }> {
    let query = supabase.from('referrals').select('*', { count: 'exact', head: true });
    if (referrerId) query = query.eq('referrer_id', referrerId);
    const { count: total } = await query;

    let completedQuery = supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'completed');
    if (referrerId) completedQuery = completedQuery.eq('referrer_id', referrerId);
    const { count: completed } = await completedQuery;

    return { total: total || 0, completed: completed || 0 };
  }
}
