import { ReferralsRepository } from '../repositories/referrals.repository';
import { supabase } from '../../../config/database.config';
import { getSettingsMap } from '../../../common/utils/settings.util';

export class ReferralsService {
  constructor(private referralsRepo: ReferralsRepository) {}

  async getStats(userId: string) {
    return this.referralsRepo.getStats(userId);
  }

  async getList(userId: string) {
    return this.referralsRepo.getList(userId);
  }

  async getAllReferrals(page: number, limit: number) {
    return this.referralsRepo.getAllReferrals(page, limit);
  }

  async applyReferral(userId: string, referralCode: string) {
    const { data: referrer } = await supabase.from('users').select('id').eq('referral_code', referralCode).single();
    if (!referrer) throw new Error('Invalid referral code');

    const referral = await this.referralsRepo.create({
      referrerId: referrer.id,
      referredId: userId,
      referralCode,
    });

    const settings = await getSettingsMap();
    const reward = parseInt(settings.referral_bonus_points || settings.referral_reward || '0', 10) || 0;
    if (reward <= 0) {
      await this.referralsRepo.updateStatus(referral.id, 'completed', 0);
      return { message: 'Referral applied', rewardPoints: 0 };
    }

    // Credit wallet directly via Supabase
    const { data: wallet } = await supabase
      .from('point_wallets')
      .select('balance, total_earned')
      .eq('user_id', referrer.id)
      .maybeSingle();

    const currentBalance = wallet?.balance ?? 0;
    const currentEarned = wallet?.total_earned ?? 0;

    if (wallet) {
      await supabase
        .from('point_wallets')
        .update({ balance: currentBalance + reward, total_earned: currentEarned + reward, updated_at: new Date().toISOString() })
        .eq('user_id', referrer.id);
    } else {
      await supabase
        .from('point_wallets')
        .insert({ user_id: referrer.id, balance: reward, total_earned: reward });
    }

    await supabase.from('point_transactions').insert({
      user_id: referrer.id,
      type: 'referral',
      amount: reward,
      description: `Referral bonus for referring ${referralCode}`,
      balance_after: currentBalance + reward,
    });

    await this.referralsRepo.updateStatus(referral.id, 'completed', reward);

    return { message: 'Referral applied', rewardPoints: reward };
  }
}
