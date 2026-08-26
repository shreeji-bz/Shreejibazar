/**
 * Shri Ji Bazaar - Referrals Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';
import { IReferralRepository, ReferralEntity, ReferralFindAllOptions } from '../interfaces/referrals.interface';

export class ReferralRepository implements IReferralRepository {
  async findAll(options?: ReferralFindAllOptions): Promise<{ data: ReferralEntity[]; meta: { total: number; page: number; limit: number } }> {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, options?.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('referrals')
      .select(
        `
        id,
        referrer_id,
        referred_user_id,
        points,
        status,
        created_at,
        referrer:users!referrals_referrer_id_fkey(name),
        referred:users!referrals_referred_user_id_fkey(name)
      `,
        { count: 'exact' }
      );

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch referrals: ${error.message}`);
    }

    const formattedData: ReferralEntity[] = (data || []).map((row: any) => ({
      id: row.id,
      referrerId: row.referrer_id,
      referrerName: row.referrer?.name || '',
      referredUserId: row.referred_user_id,
      referredUserName: row.referred?.name || '',
      points: row.points,
      status: row.status,
      createdAt: new Date(row.created_at),
    }));

    return {
      data: formattedData,
      meta: { total: count || 0, page, limit },
    };
  }

  async findById(id: string): Promise<ReferralEntity | null> {
    const { data, error } = await supabase
      .from('referrals')
      .select(
        `
        id,
        referrer_id,
        referred_user_id,
        points,
        status,
        created_at,
        referrer:users!referrals_referrer_id_fkey(name),
        referred:users!referrals_referred_user_id_fkey(name)
      `
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    const row = data as any;
    return {
      id: row.id,
      referrerId: row.referrer_id,
      referrerName: row.referrer?.name || '',
      referredUserId: row.referred_user_id,
      referredUserName: row.referred?.name || '',
      points: row.points,
      status: row.status,
      createdAt: new Date(row.created_at),
    };
  }

  async create(referrerId: string, referredUserId: string, points: number): Promise<ReferralEntity> {
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_user_id: referredUserId,
        points,
        status: 'pending',
      })
      .select(
        `
        id,
        referrer_id,
        referred_user_id,
        points,
        status,
        created_at,
        referrer:users!referrals_referrer_id_fkey(name),
        referred:users!referrals_referred_user_id_fkey(name)
      `
      )
      .single();

    if (error || !data) {
      throw new Error(`Failed to create referral: ${error?.message || 'Unknown error'}`);
    }

    const row = data as any;
    return {
      id: row.id,
      referrerId: row.referrer_id,
      referrerName: row.referrer?.name || '',
      referredUserId: row.referred_user_id,
      referredUserName: row.referred?.name || '',
      points: row.points,
      status: row.status,
      createdAt: new Date(row.created_at),
    };
  }

  async completeReferral(id: string): Promise<void> {
    const { error } = await supabase
      .from('referrals')
      .update({ status: 'completed' })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to complete referral: ${error.message}`);
    }
  }

  async getByUser(userId: string): Promise<ReferralEntity[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select(
        `
        id,
        referrer_id,
        referred_user_id,
        points,
        status,
        created_at,
        referrer:users!referrals_referrer_id_fkey(name),
        referred:users!referrals_referred_user_id_fkey(name)
      `
      )
      .or(`referrer_id.eq.${userId},referred_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user referrals: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      referrerId: row.referrer_id,
      referrerName: row.referrer?.name || '',
      referredUserId: row.referred_user_id,
      referredUserName: row.referred?.name || '',
      points: row.points,
      status: row.status,
      createdAt: new Date(row.created_at),
    }));
  }
}
