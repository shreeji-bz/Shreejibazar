import { RoundEntity, RoundListResult } from '../entities/round.entity';

export interface IRoundsRepository {
  findByGame(gameId: string, options?: any): Promise<RoundListResult>;
  findById(id: string): Promise<RoundEntity | null>;
  create(data: Partial<RoundEntity>): Promise<RoundEntity>;
  closeRound(id: string): Promise<RoundEntity>;
  declareResult(id: string, result: string): Promise<RoundEntity>;
  findActive(gameId?: string): Promise<RoundEntity | null>;
}
