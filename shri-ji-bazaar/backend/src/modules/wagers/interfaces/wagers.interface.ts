import { WagerEntity } from '../entities/wager.entity';

export interface IWagersRepository {
  create(data: any): Promise<WagerEntity>;
  findById(id: string): Promise<WagerEntity | null>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ data: WagerEntity[]; total: number }>;
  findByRoundId(roundId: string): Promise<WagerEntity[]>;
  findByGameId(gameId: string, page: number, limit: number): Promise<{ data: WagerEntity[]; total: number }>;
  findByIdempotencyKey(key: string): Promise<WagerEntity | null>;
  updateStatus(id: string, status: string, resultStatus: string): Promise<WagerEntity>;
  settleWager(id: string, resultText: string, isWinner: boolean, payout: number): Promise<WagerEntity>;
  voidWager(id: string, reason: string): Promise<WagerEntity>;
  getActiveWagersForRound(roundId: string): Promise<WagerEntity[]>;
  countPendingWagers(userId: string): Promise<number>;
}
