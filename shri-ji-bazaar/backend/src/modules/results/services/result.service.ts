import type { FindByIdResult, FindByGameResult } from '../interfaces/results.interface';
import { ResultsRepository } from '../repositories/result.repository';

export class ResultsService {
  constructor(private resultsRepository: ResultsRepository) {}

  async findLatest(options?: any): Promise<FindByIdResult[]> {
    return this.resultsRepository.findLatest(options);
  }

  async findById(id: string): Promise<FindByIdResult | null> {
    const result = await this.resultsRepository.findById(id);
    if (!result) {
      throw new Error('Result not found');
    }
    return result;
  }

  async findByGame(gameId: string, options?: any): Promise<FindByGameResult> {
    return this.resultsRepository.findByGame(gameId, options);
  }

  async create(data: any): Promise<FindByIdResult> {
    if (!data.gameId || !data.roundId || !data.result) {
      throw new Error('gameId, roundId, and result are required');
    }
    return this.resultsRepository.create(data);
  }
}
