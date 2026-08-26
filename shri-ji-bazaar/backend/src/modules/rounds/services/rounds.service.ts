import { RoundsRepository } from '../repositories/rounds.repository';
import { RoundEntity } from '../entities/round.entity';

export class RoundsService {
  constructor(private roundsRepository: RoundsRepository) {}

  async findByGame(gameId: string, options?: any) {
    return this.roundsRepository.findByGame(gameId, options);
  }

  async findById(id: string): Promise<RoundEntity> {
    const round = await this.roundsRepository.findById(id);
    if (!round) throw new Error('Round not found');
    return round;
  }

  async create(data: Partial<RoundEntity>): Promise<RoundEntity> {
    return this.roundsRepository.create(data);
  }

  async closeRound(id: string): Promise<RoundEntity> {
    return this.roundsRepository.closeRound(id);
  }

  async declareResult(id: string, result: string): Promise<RoundEntity> {
    return this.roundsRepository.declareResult(id, result);
  }
}
