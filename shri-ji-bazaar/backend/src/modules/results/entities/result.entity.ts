export interface ResultEntity {
  id: string;
  gameId: string;
  gameName: string;
  roundId: string;
  roundNumber: number;
  result: string;
  declaredAt: Date;
  createdAt: Date;
}
