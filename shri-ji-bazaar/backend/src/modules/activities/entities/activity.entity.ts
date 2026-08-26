export interface ActivityEntity {
  id: string;
  userId: string;
  userName: string;
  gameId: string;
  gameName: string;
  roundId: string;
  roundNumber: number;
  playType: string;
  selection: string;
  points: number;
  result: string | null;
  status: string;
  idempotencyKey: string | null;
  createdAt: Date;
}
