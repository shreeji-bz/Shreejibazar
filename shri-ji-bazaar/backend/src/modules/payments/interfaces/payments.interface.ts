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
  /** The user's single open withdrawal request (one-pending-per-user rule). */
  findUserPendingWithdrawal(userId: string): Promise<PaymentEntity | null>;
  /** Pending withdrawals older than the cutoff (expiry job). */
  findPendingWithdrawalsOverdue(cutoffIso: string, limit?: number): Promise<PaymentEntity[]>;
  /**
   * Guarded status claim: only moves while status is still 'pending'.
   * Returns null when the request is already in a terminal state, so a
   * decided withdrawal can never be processed twice.
   */
  claimDecision(id: string, nextStatus: string, extra?: Record<string, any>): Promise<PaymentEntity | null>;
  approve(id: string, adminId: string, adminNotes?: string): Promise<PaymentEntity>;
  reject(id: string, adminId: string, adminNotes: string): Promise<PaymentEntity>;
  /** Mark a completed deposit as rejected (revert) after the wallet has been debited. */
  markReverted(id: string, adminId: string, reason: string): Promise<PaymentEntity>;
  getAll(
    page: number,
    limit: number,
    type?: string,
    status?: string,
  ): Promise<{ data: PaymentEntity[]; total: number }>;
  getStats(): Promise<{ totalDeposits: number; totalWithdrawals: number; pendingCount: number }>;
  getWalletBalance(userId: string): Promise<number>;
  /** Wallet snapshot incl. the withdrawal reservation (018; 0 before that). */
  getWallet(userId: string): Promise<{ balance: number; pendingWithdrawal: number; available: number }>;
  creditWallet(userId: string, amount: number, paymentId: string, description: string): Promise<void>;
  debitWallet(userId: string, amount: number, paymentId: string, description: string): Promise<void>;
  refundWallet(userId: string, amount: number, paymentId: string, description: string): Promise<void>;
  // --- Admin-approved withdrawal reservation (sync 018 RPCs) ---
  /** Hold the amount (available = balance - pending must cover it). */
  reserveWithdrawal(userId: string, amount: number, paymentId: string, description: string): Promise<{ ok: boolean; missing: boolean; error?: string }>;
  /** Approve: atomic balance-=amount + hold release + ledger row. */
  settleWithdrawal(userId: string, amount: number, paymentId: string, description: string): Promise<{ ok: boolean; missing: boolean; error?: string }>;
  /** Reject/expire: release the hold, balance untouched. */
  releaseWithdrawal(userId: string, amount: number, paymentId: string, description: string): Promise<{ ok: boolean; missing: boolean; error?: string }>;
  /** A settings value with fallback (config store). */
  getSetting(key: string, fallback: string): Promise<string>;
  /** User-facing in-app notification (type 'system'). */
  notifyUser(userId: string, title: string, message: string): Promise<void>;
  /** Audit trail entry (audit_logs). */
  logAudit(data: { adminId: string | null; action: string; entityId: string; metadata: Record<string, any> }): Promise<void>;
}

