export interface Wager {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  gameId: string;
  gameName: string;
  gameType: string;
  roundId: string;
  roundNumber: number;
  playType: 'open' | 'close';
  selection: string;
  number?: string;
  stake: number;
  potentialPayout: number;
  status: 'pending' | 'active' | 'won' | 'lost' | 'void';
  resultStatus?: string;
  settledAt?: string;
  createdAt: string;
}

export interface WagerFilters {
  gameId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedWagersResponse {
  data: Wager[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VoidWagerRequest {
  reason: string;
}

export interface WagerDetail extends Wager {
  pointsDeducted: number;
  pointsRefunded: number;
  pointsPaidOut: number;
  adminNote?: string;
}
