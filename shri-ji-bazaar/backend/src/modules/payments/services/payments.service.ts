import { PaymentEntity } from '../entities/payment.entity';
import { IPaymentsRepository } from '../interfaces/payments.interface';
import { supabase } from '../../../config/database.config';

function toIso(value: any): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapAdminPayment(row: any, user?: any): any {
  const balanceBefore = row.balance_before ?? 0;
  const balanceAfter = row.balance_after ?? 0;
  return {
    id: row.id,
    userId: row.user_id,
    userName: user?.name || null,
    userMobile: user?.mobile || null,
    type: row.type,
    amount: row.amount,
    method: row.method,
    status: row.status,
    referenceId: row.reference_id,
    pointsBefore: balanceBefore,
    pointsAfter: balanceAfter,
    pointsDeducted: balanceAfter < balanceBefore ? balanceBefore - balanceAfter : 0,
    notes: row.notes,
    adminNote: row.admin_notes,
    processedBy: row.processed_by,
    processedAt: toIso(row.approved_at || row.completed_at),
    createdAt: toIso(row.created_at) || new Date().toISOString(),
    currency: row.currency,
    provider: row.provider,
    rejectionReason: row.rejection_reason,
    bankName: row.bank_name,
    accountNumber: row.account_number,
    ifscCode: row.ifsc_code,
    accountHolderName: row.account_holder_name,
  };
}

export class PaymentsService {
  constructor(private paymentsRepo: IPaymentsRepository) {}

  private async enrichWithUser(payments: any[]): Promise<any[]> {
    const userIds = Array.from(new Set(payments.map((p) => p.userId).filter(Boolean)));
    if (!userIds.length) return payments.map((p) => mapAdminPayment(p));

    const { data: users } = await supabase.from('users').select('id, name, mobile').in('id', userIds);
    const userMap = new Map((users || []).map((u: any) => [u.id, u]));

    return payments.map((row: any) => mapAdminPayment(row, userMap.get(row.userId)));
  }

  async createDeposit(userId: string, amount: number, method: string, referenceId?: string, notes?: string, extra?: { txnId?: string; utrNumber?: string; screenshotUrl?: string; provider?: string }): Promise<PaymentEntity> {
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }

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
          txnId: existing.txn_id ?? null,
          utrNumber: existing.utr_number ?? null,
          screenshotUrl: existing.screenshot_url ?? null,
          provider: existing.provider ?? 'manual',
          rejectionReason: null,
          bankName: null,
          accountNumber: null,
          ifscCode: null,
          accountHolderName: null,
        };
      }
    }

    const balanceBefore = await this.paymentsRepo.getWalletBalance(userId);

    const { data: transaction, error: txnError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'credit',
        amount,
        description: `Pending deposit via ${method}${notes ? `: ${notes}` : ''}`,
        reference_id: referenceId,
        reference_type: 'play',
        balance_before: balanceBefore,
        balance_after: balanceBefore,
      })
      .select()
      .single();

    if (txnError || !transaction) {
      console.error('Deposit point_transactions insert error:', JSON.stringify(txnError));
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
      referenceType: 'play',
      notes,
      balanceBefore,
      balanceAfter: balanceBefore,
      txnId: extra?.txnId,
      utrNumber: extra?.utrNumber,
      screenshotUrl: extra?.screenshotUrl,
      provider: extra?.provider || 'manual',
    });
  }

  async createWithdrawal(userId: string, amount: number, method: string, referenceId?: string, notes?: string, bankDetails?: { bankName?: string; accountNumber?: string; ifscCode?: string; accountHolderName?: string }): Promise<PaymentEntity> {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

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
          txnId: null,
          utrNumber: null,
          screenshotUrl: null,
          provider: 'manual',
          rejectionReason: null,
          bankName: existing.bank_name ?? null,
          accountNumber: existing.account_number ?? null,
          ifscCode: existing.ifsc_code ?? null,
          accountHolderName: existing.account_holder_name ?? null,
        };
      }
    }

    const minWithdrawalSetting = await supabase.from('settings').select('value').eq('key', 'min_withdrawal_amount').single();
    const minWithdrawal = parseInt(minWithdrawalSetting.data?.value || '100', 10);

    if (amount < minWithdrawal) {
      throw new Error(`Minimum withdrawal amount is ${minWithdrawal} INR`);
    }

    const currentBalance = await this.paymentsRepo.getWalletBalance(userId);
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance. Available: ${currentBalance} INR`);
    }

    const balanceBefore = currentBalance;

    const { data: transaction, error: txnError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'debit',
        amount: -amount,
        description: `Pending withdrawal via ${method}${notes ? `: ${notes}` : ''}`,
        reference_id: referenceId,
        reference_type: 'point_transaction',
        balance_after: currentBalance,
        balance_before: currentBalance,
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
      bankName: bankDetails?.bankName,
      accountNumber: bankDetails?.accountNumber,
      ifscCode: bankDetails?.ifscCode,
      accountHolderName: bankDetails?.accountHolderName,
    });
  }

  async approveDeposit(id: string, adminId: string, adminNotes?: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.type !== 'deposit') throw new Error(`Payment is not a deposit, it's ${payment.type}`);
    if (payment.status !== 'pending') throw new Error(`Payment is not pending, it's ${payment.status}`);

    console.log(`[approveDeposit] crediting wallet for user ${payment.userId}, amount ${payment.amount}`);
    await this.paymentsRepo.creditWallet(
      payment.userId,
      payment.amount,
      id,
      `Deposit approved${adminNotes ? `: ${adminNotes}` : ''}`,
    );

    console.log(`[approveDeposit] approving payment ${id}`);
    return this.paymentsRepo.approve(id, adminId, adminNotes);
  }

  async approveWithdrawal(id: string, adminId: string, adminNotes?: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.type !== 'withdrawal') throw new Error('Payment is not a withdrawal');
    if (payment.status !== 'pending') throw new Error('Payment is not pending');

    const currentBalance = await this.paymentsRepo.getWalletBalance(payment.userId);
    if (currentBalance < payment.amount) {
      throw new Error(`Insufficient balance for withdrawal. Available: ${currentBalance}, Required: ${payment.amount}`);
    }

    await this.paymentsRepo.debitWallet(
      payment.userId,
      payment.amount,
      id,
      `Withdrawal approved${adminNotes ? `: ${adminNotes}` : ''}`,
    );

    return this.paymentsRepo.approve(id, adminId, adminNotes);
  }

  async rejectPayment(id: string, adminId: string, adminNotes: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'pending') throw new Error('Payment is not pending');

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

  async getPaymentById(id: string): Promise<any> {
    const { data, error } = await supabase.from('payments').select('*').eq('id', id).single();
    if (error || !data) return null;
    const mapped = mapAdminPayment(data);
    return this.enrichWithUser([mapped]).then((enriched) => enriched[0] ?? null);
  }

  async getAllPayments({ page, limit, type, status, dateFrom, dateTo, search }: {
    page: number;
    limit: number;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('payments').select('*', { count: 'exact' });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);
    if (search) {
      query = query.or(`reference_id.ilike.%${search}%,user_id.ilike.%${search}%`);
    }

    const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);

    const mapped = (data || []).map((row: any) => mapAdminPayment(row));
    const enriched = await this.enrichWithUser(mapped);

    return {
      data: enriched,
      total: count || 0,
      page,
      limit,
    };
  }
}
