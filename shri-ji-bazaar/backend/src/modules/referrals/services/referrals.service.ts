import { ReferralRepository } from '../repositories/referrals.repository';
import { PointsService } from '../../points/services/points.service';
import { IReferralRepository, ReferralEntity } from '../interfaces/referrals.interface';

export class ReferralsService {
  constructor(
    private referralRepository: IReferralRepository,
    private pointsService: PointsService
  ) {}

  async findAll(options?: { status?: string; page?: number; limit?: number }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const status = options?.status as 'pending' | 'completed' | 'cancelled' | undefined;

    const result = await this.referralRepository.findAll({ status, page, limit });
    return result;
  }

  async findById(id: string): Promise<ReferralEntity> {
    const referral = await this.referralRepository.findById(id);
    if (!referral) {
      throw new Error('Referral not found');
    }
    return referral;
  }

  async create(referrerId: string, referredUserId: string, points: number): Promise<ReferralEntity> {
    if (referrerId === referredUserId) {
      throw new Error('Cannot refer yourself');
    }

    const existing = await this.referralRepository.getByUser(referrerId);
    const alreadyReferred = existing.some(
      (r) => r.referredUserId === referredUserId && r.status !== 'cancelled'
    );
    if (alreadyReferred) {
      throw new Error('This user has already been referred');
    }

    const referral = await this.referralRepository.create(referrerId, referredUserId, points);
    return referral;
  }

  async completeReferral(id: string): Promise<ReferralEntity> {
    const referral = await this.referralRepository.findById(id);
    if (!referral) {
      throw new Error('Referral not found');
    }

    if (referral.status === 'completed') {
      throw new Error('Referral is already completed');
    }

    if (referral.status === 'cancelled') {
      throw new Error('Cannot complete a cancelled referral');
    }

    await this.referralRepository.completeReferral(id);

    await this.pointsService.creditPoints(
      referral.referrerId,
      referral.points,
      'Referral bonus',
      { referenceId: referral.referredUserId, referenceType: 'referral' },
    );

    const updated = await this.referralRepository.findById(id);
    return updated!;
  }

  async getByUser(userId: string): Promise<ReferralEntity[]> {
    return this.referralRepository.getByUser(userId);
  }
}
