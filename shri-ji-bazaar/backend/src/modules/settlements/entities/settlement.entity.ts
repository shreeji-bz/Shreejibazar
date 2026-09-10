export interface SettlementEntity {
  id: string;
  roundId: string;
  gameId: string;
  result: string;
  totalWagers: number;
  totalStaked: number;
  totalPayout: number;
  totalRefund: number;
  status: string;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
