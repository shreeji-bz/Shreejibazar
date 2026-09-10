import { PaymentEntity } from '../entities/payment.entity';
import { IPaymentsRepository } from '../interfaces/payments.interface';
import { supabase } from '../../../config/database.config';

export class PaymentsService {
  constructor(private paymentsRepo: IPaymentsRepository) {}

  async createDeposit(userId: string, amount: number, method: string, referenceId?: string, notes?: string): Promise<PaymentEntity> {
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }

    // Check for idempotency: if a pending deposit with this referenceId already exists, return it
    if (referenceId) {
      const { data: existing } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('reference_id', referenceId)
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .single();

      if (existing) {
        return {
          id: existing.id,
          userId: existing.user_id,
          processedBy: existing.processed_by,
          type: existing.type,
          amount: existing.amount,
          currency: existing.currency,
          method: existing.method,
          status: existing.status,
          referenceId: existing.reference_id,
          referenceType: existing.reference_type,
          notes: existing.notes,
          adminNotes: existing.admin_notes,
          balanceBefore: existing.balance_before,
          balanceAfter: existing.balance_after,
          approvedAt: existing.approved_at,
          completedAt: existing.completed_at,
          createdAt: existing.created_at,
          updatedAt: existing.updated_at,
        };
      }
    }

    // Get current wallet balance
    const balanceBefore = await this.paymentsRepo.getWalletBalance(userId);

    // Create a point_transaction record for idempotency tracking
    const { data: transaction, error: txnError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'credit',
        amount,
        description: `Pending deposit via ${method}${notes ? `: ${notes}` : ''}`,
        reference_id: referenceId,
        reference_type: 'payment_deposit',
        balance_after: balanceBefore,
      })
      .select()
      .single();

    if (txnError || !transaction) {
      throw new Error(`Failed to create deposit transaction: ${txnError?.message || 'Unknown error'}`);
    }

    return this.paymentsRepo.create({
      userId,
      type: 'deposit',
      amount,
      currency: 'INR',
      method: method as PaymentEntity['method'],
      status: 'pending',
      referenceId: referenceId || transaction.id,
      referenceType: 'point_transaction',
      notes,
      balanceBefore,
      balanceAfter: balanceBefore,
    });
  }

  async createWithdrawal(userId: string, amount: number, method: string, referenceId?: string, notes?: string): Promise<PaymentEntity> {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

    // Check for idempotency
    if (referenceId) {
      const { data: existing } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .eq('reference_id', referenceId)
        .eq('type', 'withdrawal')
        .eq('status', 'pending')
        .single();

      if (existing) {
        return {
          id: existing.id,
          userId: existing.user_id,
          processedBy: existing.processed_by,
          type: existing.type,
          amount: existing.amount,
          currency: existing.currency,
          method: existing.method,
          status: existing.status,
          referenceId: existing.reference_id,
          referenceType: existing.reference_type,
          notes: existing.notes,
          adminNotes: existing.admin_notes,
          balanceBefore: existing.balance_before,
          balanceAfter: existing.balance_after,
          approvedAt: existing.approved_at,
          completedAt: existing.completed_at,
          createdAt: existing.created_at,
          updatedAt: existing.updated_at,
        };
      }
    }

    // Check minimum withdrawal from settings
    const { data: minSetting } = await supabase.from('settings').select('value').eq('key', 'min_withdrawal_amount').single();
    const minWithdrawal = parseInt(minSetting?.value || '100', 10);

    if (amount < minWithdrawal) {
      throw new Error(`Minimum withdrawal amount is ${minWithdrawal} INR`);
    }

    // Validate sufficient balance
    const currentBalance = await this.paymentsRepo.getWalletBalance(userId);
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance. Available: ${currentBalance} INR`);
    }

    const balanceBefore = currentBalance;

    // Create a point_transaction record for idempotency tracking
    const { data: transaction, error: txnError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'debit',
        amount: -amount,
        description: `Pending withdrawal via ${method}${notes ? `: ${notes}` : ''}`,
        reference_id: referenceId,
        reference_type: 'payment_withdrawal',
        balance_after: currentBalance,
      })
      .select()
      .single();

    if (txnError || !transaction) {
      throw new Error(`Failed to create withdrawal transaction: ${txnError?.message || 'Unknown error'}`);
    }

    return this.paymentsRepo.create({
      userId,
      type: 'withdrawal',
      amount,
      currency: 'INR',
      method: method as PaymentEntity['method'],
      status: 'pending',
      referenceId: referenceId || transaction.id,
      referenceType: 'point_transaction',
      notes,
      balanceBefore,
      balanceAfter: currentBalance,
    });
  }

  async approveDeposit(id: string, adminId: string, adminNotes?: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.type !== 'deposit') throw new Error('Payment is not a deposit');
    if (payment.status !== 'pending') throw new Error('Payment is not pending');

    // Credit wallet via RPC
    await this.paymentsRepo.creditWallet(
      payment.userId,
      payment.amount,
      id,
      `Deposit approved${adminNotes ? `: ${adminNotes}` : ''}`,
    );

    // Update payment to completed
    return this.paymentsRepo.approve(id, adminId, adminNotes);
  }

  async approveWithdrawal(id: string, adminId: string, adminNotes?: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.type !== 'withdrawal') throw new Error('Payment is not a withdrawal');
    if (payment.status !== 'pending') throw new Error('Payment is not pending');

    // Check balance one more time before deducting
    const currentBalance = await this.paymentsRepo.getWalletBalance(payment.userId);
    if (currentBalance < payment.amount) {
      throw new Error(`Insufficient balance for withdrawal. Available: ${currentBalance}, Required: ${payment.amount}`);
    }

    // Deduct from wallet
    await this.paymentsRepo.debitWallet(
      payment.userId,
      payment.amount,
      id,
      `Withdrawal approved${adminNotes ? `: ${adminNotes}` : ''}`,
    );

    // Update payment to completed
    return this.paymentsRepo.approve(id, adminId, adminNotes);
  }

  async rejectPayment(id: string, adminId: string, adminNotes: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'pending') throw new Error('Payment is not pending');

    // For withdrawals, if the wallet was already debited (edge case), refund it
    if (payment.type === 'withdrawal') {
      const currentBalance = await this.paymentsRepo.getWalletBalance(payment.userId);
      if (currentBalance < payment.balanceAfter) {
        await this.paymentsRepo.refundWallet(
          payment.userId,
          payment.amount,
          id,
          `Withdrawal rejected${adminNotes ? `: ${adminNotes}` : ''}`,
        );
      }
    }

    return this.paymentsRepo.reject(id, adminId, adminNotes);
  }

  async getPaymentHistory(userId: string, page: number = 1, limit: number = 20, type?: string, status?: string) {
    return this.paymentsRepo.findByUserId(userId, page, limit, type, status);
  }

  async getPendingDeposits(limit = 50) {
    return this.paymentsRepo.findPendingDeposits(limit);
  }

  async getPendingWithdrawals(limit = 50) {
    return this.paymentsRepo.findPendingWithdrawals(limit);
  }

  async getStats() {
    return this.paymentsRepo.getStats();
  }
}
