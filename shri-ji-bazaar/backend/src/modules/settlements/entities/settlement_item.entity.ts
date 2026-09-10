export interface SettlementItemEntity {
  id: string;
  settlementId: string;
  wagerId: string;
  userId: string;
  pointsStaked: number;
  pointsWon: number;
  pointsRefunded: number;
  isWinner: boolean;
  createdAt: string;
}
