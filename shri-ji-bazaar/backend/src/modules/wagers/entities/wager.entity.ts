export interface WagerEntity {
  id: string;
  userId: string;
  gameId: string;
  roundId: string;
  wagerTypeId: string;
  playType: string;
  selection: string;
  pointsStaked: number;
  potentialPayout: number;
  status: string;
  resultStatus: string;
  resultText: string | null;
  pointsWon: number;
  pointsRefunded: number;
  idempotencyKey: string | null;
  placedAt: string;
  settledAt: string | null;
  createdAt: string;
  updatedAt: string;
}
