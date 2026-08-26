export interface Round {
  id: string;
  gameId: string;
  gameName: string;
  roundNumber: number;
  startTime: string;
  endTime: string;
  status: 'pending' | 'open' | 'closed' | 'result_declared';
  result?: string;
  createdAt: string;
}

export interface CreateRoundRequest {
  gameId: string;
  startTime: string;
  endTime: string;
}
