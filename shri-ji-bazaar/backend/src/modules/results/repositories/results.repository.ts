import { ResultsService } from '../services/results.service';

export class ResultsRepository {
  constructor(private service: ResultsService) {}

  async getLatest(limit: number) { return this.service.getLatest(limit); }
  async getByGame(gameId: string, limit: number) { return this.service.getByGame(gameId, limit); }
  async getByRound(roundId: string) { return this.service.getByRound(roundId); }
  async declareResult(roundId: string, result: string, adminId: string) { return this.service.declareResult(roundId, result, adminId); }
}
