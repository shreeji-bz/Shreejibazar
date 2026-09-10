import { SettlementEntity } from '../entities/settlement.entity';
import { SettlementItemEntity } from '../entities/settlement_item.entity';

export interface ISettlementsRepository {
  create(data: any): Promise<SettlementEntity>;
  createSettlementItem(data: any): Promise<SettlementItemEntity>;
  findById(id: string): Promise<SettlementEntity | null>;
  findByRoundId(roundId: string): Promise<SettlementEntity | null>;
  findItemsBySettlementId(settlementId: string): Promise<SettlementItemEntity[]>;
  updateStatus(id: string, status: string): Promise<SettlementEntity>;
  updateTotals(
    id: string,
    totals: { totalWagers: number; totalStaked: number; totalPayout: number; totalRefund: number },
  ): Promise<SettlementEntity>;
  getSettlementHistory(
    gameId: string,
    page: number,
    limit: number,
  ): Promise<{ data: SettlementEntity[]; total: number }>;
  getAll(page: number, limit: number): Promise<{ data: SettlementEntity[]; total: number }>;
}
