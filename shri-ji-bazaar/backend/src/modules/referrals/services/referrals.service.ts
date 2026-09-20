import { ReferralsRepository } from '../repositories/referrals.repository';
import { supabase } from '../../../config/database.config';

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
    const { data: referrer } = await supabase.from('auth.users').select('id').eq('referral_code', referralCode).single();
    if (!referrer) throw new Error('Invalid referral code');

    const referral = await this.referralsRepo.create({
      referrerId: referrer.id,
      referredId: userId,
      referralCode,
    });

    const settings = await this.getSettings();
    const reward = parseInt(settings.referral_reward || '50');

    await this.referralsRepo.updateStatus(referral.id, 'completed', reward);

    return { message: 'Referral applied', rewardPoints: reward };
  }

  private async getSettings() {
    const { data } = await supabase.from('settings').select('*');
    const settings: Record<string, string> = {};
    (data || []).forEach((s: any) => { settings[s.key] = s.value; });
    return settings;
  }
}
