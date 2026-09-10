import { ReferralRepository } from '../repositories/referral.repository';
import { PointsService } from '../../points/services/points.service';

export class ReferralService {
  constructor(private referralRepository: ReferralRepository, private pointsService: PointsService) {}

  async getAll(options?: any) {
    return this.referralRepository.findAll(options);
  }

  async processReferral(referrerId: string, referredUserId: string, points: number) {
    const existing = await this.referralRepository.findAll({ referrerId });
    if (existing.data.some((r: any) => r.referredUserId === referredUserId)) {
      throw new Error('Referral already processed');
    }
    const referral = await this.referralRepository.create({ referrerId, referredUserId, points });
    await this.referralRepository.complete(referral.id);
    await this.pointsService.awardPoints(referrerId, points, 'referral', 'Referral bonus', referredUserId);
    return referral;
  }

  async getStats(referrerId?: string) {
    return this.referralRepository.getStats(referrerId);
  }
}
