export interface RoundEntity {
  id: string;
  gameId: string;
  gameName: string;
  roundNumber: string;
  startTime: Date;
  endTime: Date;
  result?: string;
  status: 'open' | 'closed' | 'result_declared';
  createdAt: Date;
  updatedAt: Date;
}

export interface RoundListResult {
  data: RoundEntity[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
