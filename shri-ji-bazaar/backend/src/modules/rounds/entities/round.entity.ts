export interface RoundEntity {
  id: string;
  gameId: string;
  gameName?: string;
  roundNumber: number;
  startTime: string;
  endTime: string;
  resultTime: string;
  status: 'pending' | 'open' | 'closed' | 'result_declared';
  result?: string;
  declaredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoundListResult {
  data: RoundEntity[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
