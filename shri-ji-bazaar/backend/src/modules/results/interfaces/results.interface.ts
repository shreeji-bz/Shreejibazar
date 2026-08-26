export interface FindLatestOptions {
  page?: number;
  limit?: number;
}

export interface FindByIdResult {
  id: string;
  gameId: string;
  gameName: string;
  roundId: string;
  roundNumber: number;
  result: string;
  declaredAt: Date;
  createdAt: Date;
}

export interface FindByGameOptions {
  page?: number;
  limit?: number;
}

export interface FindByGameResult {
  data: FindByIdResult[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateResultData {
  gameId: string;
  roundId: string;
  result: string;
}

export interface IResultsRepository {
  findLatest(options?: FindLatestOptions): Promise<FindByIdResult[]>;
  findById(id: string): Promise<FindByIdResult | null>;
  findByGame(gameId: string, options?: FindByGameOptions): Promise<FindByGameResult>;
  create(data: CreateResultData): Promise<FindByIdResult>;
}
