import { BonusesRepository } from '../repositories/bonuses.repository';

export class BonusesService {
  constructor(private bonusesRepo: BonusesRepository) {}

  async getAll(options: any) {
    return this.bonusesRepo.findAll(options);
  }

  async getById(id: string) {
    const bonus = await this.bonusesRepo.findById(id);
    if (!bonus) throw new Error('Bonus not found');
    return bonus;
  }

  async claim(userId: string, bonusId: string) {
    return this.bonusesRepo.claimBonus(userId, bonusId);
  }

  async getUserClaimed(userId: string) {
    return this.bonusesRepo.getUserClaimed(userId);
  }

  async create(data: any) {
    return this.bonusesRepo.create(data);
  }

  async update(id: string, data: any) {
    return this.bonusesRepo.update(id, data);
  }
}
