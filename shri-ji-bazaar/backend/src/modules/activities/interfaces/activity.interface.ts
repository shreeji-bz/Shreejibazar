export interface FindAllOptions {
  userId?: string;
  gameId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateActivityData {
  userId: string;
  gameId: string;
  roundId: string;
  playType: string;
  selection: string;
  points: number;
  idempotencyKey?: string;
}

export interface IActivitiesRepository {
  findAll(options: FindAllOptions): Promise<{ data: any[]; meta: any }>;
  findById(id: string): Promise<any | null>;
  create(data: CreateActivityData): Promise<any>;
  updateResult(id: string, result: string, status: string): Promise<void>;
  findByIdempotencyKey(key: string): Promise<any | null>;
}
