export interface ResultEntity {
  id: string;
  roundId: string;
  gameId: string;
  gameName?: string;
  roundNumber?: number;
  result: string;
  declaredAt: string;
  createdAt: string;
}
