import { ReferralEntity } from '../entities/referral.entity';
import { supabase } from '../../../config/database.config';

export class ReferralsRepository {
  async getStats(userId: string) {
    const { data: user } = await supabase.from('auth.users').select('referral_code').eq('id', userId).single();

    const { count: total } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId);
    const { count: completed } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId).eq('status', 'completed');

    let totalPointsEarned = 0;
    const { data: completedRows } = await supabase
      .from('referrals')
      .select('reward_points')
      .eq('referrer_id', userId)
      .eq('status', 'completed')
      .not('reward_points', 'is', null);

    if (completedRows && completedRows.length) {
      totalPointsEarned = completedRows.reduce((sum, row: any) => sum + (row.reward_points || 0), 0);
    }

    return { referralCode: user?.referral_code, totalReferrals: total || 0, completedReferrals: completed || 0, totalPointsEarned };
  }

  async getList(userId: string) {
    const { data } = await supabase
      .from('referrals')
      .select('*, referred:auth.users!referred_id(name)')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    return (data || []).map((row: any) => ({
      id: row.id,
      referredName: row.referred?.name || 'Unknown',
      status: row.status,
      rewardPoints: row.reward_points,
      createdAt: row.created_at,
    }));
  }

  async getAllReferrals(page: number, limit: number) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data } = await supabase
      .from('referrals')
      .select('*, referrer:auth.users!referrer_id(name), referred:auth.users!referred_id(name)')
      .order('created_at', { ascending: false })
      .range(from, to);

    return (data || []).map((row: any) => ({
      id: row.id,
      referrerId: row.referrer_id,
      referredId: row.referred_id,
      referrerName: row.referrer?.name || 'Unknown',
      referredUserName: row.referred?.name || 'Unknown',
      referralCode: row.referral_code,
      status: row.status,
      rewardPoints: row.reward_points,
      createdAt: row.created_at,
    }));
  }

  async create(data: { referrerId: string; referredId: string; referralCode: string }) {
    const { data: record } = await supabase.from('referrals').insert({
      ...data,
      status: 'pending',
      reward_points: 0,
    }).select().single();
    return record;
  }

  async updateStatus(id: string, status: string, rewardPoints: number) {
    const updateData: any = { status };
    if (status === 'completed') updateData.completed_at = new Date().toISOString();
    if (rewardPoints > 0) updateData.reward_points = rewardPoints;

    const { data } = await supabase.from('referrals').update(updateData).eq('id', id).select().single();
    return data;
  }
}
