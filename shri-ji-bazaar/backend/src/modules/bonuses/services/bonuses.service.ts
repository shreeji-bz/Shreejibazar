import type {
  IBonusService,
  FindAllOptions,
  FindAllResult,
  BonusEntity,
  IBonusRepository,
  IBonusClaimRepository,
} from '../interfaces/bonuses.interface';
import type { PointsService } from '../../points/services/points.service';

export class BonusService implements IBonusService {
  constructor(
    private bonusRepository: IBonusRepository,
    private bonusClaimRepository: IBonusClaimRepository,
    private pointsService: PointsService,
  ) {}

  async findAll(options: FindAllOptions): Promise<FindAllResult> {
    const normalized: FindAllOptions = {
      status: options.status,
      type: options.type,
      page: options.page ? Math.max(1, parseInt(options.page as any)) : 1,
      limit: options.limit ? Math.min(100, Math.max(1, parseInt(options.limit as any))) : 20,
    };
    return this.bonusRepository.findAll(normalized);
  }

  async findById(id: string): Promise<BonusEntity | null> {
    return this.bonusRepository.findById(id);
  }

  async findActiveBySlug(slug: string): Promise<BonusEntity | null> {
    return this.bonusRepository.findActiveBySlug(slug);
  }

  async create(data: Partial<BonusEntity>): Promise<BonusEntity> {
    if (!data.name || !data.slug || !data.points || !data.type) {
      throw new Error('Missing required fields: name, slug, points, type');
    }

    const existing = await this.bonusRepository.findActiveBySlug(data.slug);
    if (existing) {
      throw new Error('A bonus with this slug already exists');
    }

    return this.bonusRepository.create({ ...data, status: data.status || 'draft' });
  }

  async update(id: string, data: Partial<BonusEntity>): Promise<BonusEntity> {
    const existing = await this.bonusRepository.findById(id);
    if (!existing) {
      throw new Error('Bonus not found');
    }

    if (data.slug && data.slug !== existing.slug) {
      const conflict = await this.bonusRepository.findActiveBySlug(data.slug);
      if (conflict) {
        throw new Error('A bonus with this slug already exists');
      }
    }

    return this.bonusRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.bonusRepository.findById(id);
    if (!existing) {
      throw new Error('Bonus not found');
    }
    await this.bonusRepository.delete(id);
  }

  async claim(userId: string, bonusId: string): Promise<{ points: number; claimedAt: Date }> {
    const existingClaim = await this.bonusClaimRepository.findByUserAndBonus(userId, bonusId);
    if (existingClaim) {
      throw new Error('You have already claimed this bonus');
    }

    const bonus = await this.bonusRepository.findById(bonusId);
    if (!bonus) {
      throw new Error('Bonus not found');
    }

    if (bonus.status !== 'active') {
      throw new Error('This bonus is not currently active');
    }

    const now = new Date();
    if (bonus.startDate && now < bonus.startDate) {
      throw new Error('This bonus has not started yet');
    }
    if (bonus.endDate && now > bonus.endDate) {
      throw new Error('This bonus has expired');
    }

    const claim = await this.bonusClaimRepository.create({
      userId,
      bonusId,
      pointsEarned: bonus.points,
    });

    await this.pointsService.creditPoints(
      userId,
      bonus.points,
      `Claimed bonus: ${bonus.name}`,
      { referenceId: bonusId, referenceType: 'bonus' },
    );

    return { points: bonus.points, claimedAt: new Date(claim.created_at) };
  }

  async getUserClaims(userId: string): Promise<any[]> {
    return this.bonusClaimRepository.findByUserId(userId);
  }
}
