/**
 * Shri Ji Bazaar - Points Repository Interface
 */

export interface IPointsRepository {
  getWallet(userId: string): Promise<any>;
  getTransactions(options: GetTransactionsOptions): Promise<GetTransactionsResult>;
  creditPoints(userId: string, amount: number, description: string, reference: PointReference): Promise<any>;
  debitPoints(userId: string, amount: number, description: string, reference: PointReference): Promise<any>;
  adjustPoints(userId: string, amount: number, description: string): Promise<any>;
}

export interface GetTransactionsOptions {
  userId: string;
  type?: 'credit' | 'debit';
  page?: number;
  limit?: number;
}

export interface GetTransactionsResult {
  data: any[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PointReference {
  referenceId?: string;
  referenceType?: string;
}
