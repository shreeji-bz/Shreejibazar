import { RoundsRepository } from '../repositories/rounds.repository';
import { RoundEntity } from '../entities/round.entity';

export class RoundService {
  constructor(private roundsRepository: RoundsRepository) {}

  async findByGame(gameId: string, options?: any) {
    return this.roundsRepository.findByGame(gameId, options);
  }

  async findById(id: string): Promise<RoundEntity> {
    const round = await this.roundsRepository.findById(id);
    if (!round) throw new Error('Round not found');
    return round;
  }

  async create(data: Partial<RoundEntity>) {
    return this.roundsRepository.create(data);
  }

  async closeRound(id: string) {
    return this.roundsRepository.closeRound(id);
  }

  async declareResult(id: string, result: string) {
    return this.roundsRepository.declareResult(id, result);
  }
}
