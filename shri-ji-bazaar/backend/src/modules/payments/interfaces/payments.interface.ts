import { PaymentEntity } from '../entities/payment.entity';

export interface IPaymentsRepository {
  create(data: any): Promise<PaymentEntity>;
  findById(id: string): Promise<PaymentEntity | null>;
  findByUserId(
    userId: string,
    page: number,
    limit: number,
    type?: string,
    status?: string,
  ): Promise<{ data: PaymentEntity[]; total: number }>;
  findPendingDeposits(limit?: number): Promise<PaymentEntity[]>;
  findPendingWithdrawals(limit?: number): Promise<PaymentEntity[]>;
  approve(id: string, adminId: string, adminNotes?: string): Promise<PaymentEntity>;
  reject(id: string, adminId: string, adminNotes: string): Promise<PaymentEntity>;
  getAll(
    page: number,
    limit: number,
    type?: string,
    status?: string,
  ): Promise<{ data: PaymentEntity[]; total: number }>;
  getStats(): Promise<{ totalDeposits: number; totalWithdrawals: number; pendingCount: number }>;
  getWalletBalance(userId: string): Promise<number>;
  creditWallet(userId: string, amount: number, paymentId: string, description: string): Promise<void>;
  debitWallet(userId: string, amount: number, paymentId: string, description: string): Promise<void>;
  refundWallet(userId: string, amount: number, paymentId: string, description: string): Promise<void>;
}
