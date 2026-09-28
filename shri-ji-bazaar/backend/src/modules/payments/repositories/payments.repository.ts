import { PaymentEntity } from '../entities/payment.entity';
import { supabase } from '../../../config/database.config';

export class PaymentsRepository {
  async create(data: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const { data: record, error } = await supabase
      .from('payments')
      .insert({
        user_id: data.userId,
        processed_by: data.processedBy,
        type: data.type,
        amount: data.amount,
        currency: data.currency || 'INR',
        method: data.method,
        status: data.status || 'pending',
        reference_id: data.referenceId,
        reference_type: data.referenceType,
        notes: data.notes,
        admin_notes: data.adminNotes,
        balance_before: data.balanceBefore,
        balance_after: data.balanceAfter,
        txn_id: data.txnId,
        utr_number: data.utrNumber,
        screenshot_url: data.screenshotUrl,
        provider: data.provider || 'manual',
        rejection_reason: data.rejectionReason,
        bank_name: data.bankName,
        account_number: data.accountNumber,
        ifsc_code: data.ifscCode,
        account_holder_name: data.accountHolderName,
      })
      .select()
      .single();

    if (error || !record) {
      console.error('Payments insert error:', JSON.stringify(error));
      throw new Error(`Failed to create payment: ${error?.message || 'Unknown error'}`);
    }

    return this.mapRow(record);
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    const { data } = await supabase.from('payments').select('*').eq('id', id).single();
    return data ? this.mapRow(data) : null;
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number,
    type?: string,
    status?: string,
  ): Promise<{ data: PaymentEntity[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('payments').select('*', { count: 'exact' }).eq('user_id', userId);

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);

    return {
      data: (data || []).map(this.mapRow),
      total: count || 0,
    };
  }

  async findPendingDeposits(limit = 50): Promise<PaymentEntity[]> {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('type', 'deposit')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    return (data || []).map(this.mapRow);
  }

  async findPendingWithdrawals(limit = 50): Promise<PaymentEntity[]> {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('type', 'withdrawal')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    return (data || []).map(this.mapRow);
  }

  async approve(id: string, adminId: string, adminNotes?: string): Promise<PaymentEntity> {
    const payment = await this.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'pending') throw new Error('Payment is not pending');

    const now = new Date().toISOString();
    const updateData: any = {
      status: 'completed',
      processed_by: adminId,
      admin_notes: adminNotes,
      approved_at: now,
      completed_at: now,
      updated_at: now,
    };

    const { data: record, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !record) {
      throw new Error(`Failed to approve payment: ${error?.message || 'Unknown error'}`);
    }

    return this.mapRow(record);
  }

  async reject(id: string, adminId: string, adminNotes: string): Promise<PaymentEntity> {
    const payment = await this.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'pending') throw new Error('Payment is not pending');

    const now = new Date().toISOString();
    const updateData: any = {
      status: 'rejected',
      processed_by: adminId,
      admin_notes: adminNotes,
      updated_at: now,
    };

    const { data: record, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !record) {
      throw new Error(`Failed to reject payment: ${error?.message || 'Unknown error'}`);
    }

    return this.mapRow(record);
  }

  async getAll(
    page: number,
    limit: number,
    type?: string,
    status?: string,
  ): Promise<{ data: PaymentEntity[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('payments').select('*', { count: 'exact' });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);

    return {
      data: (data || []).map(this.mapRow),
      total: count || 0,
    };
  }

  async getStats(): Promise<{ totalDeposits: number; totalWithdrawals: number; pendingCount: number }> {
    const { count: totalDeposits } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'deposit')
      .eq('status', 'completed');

    const { count: totalWithdrawals } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'withdrawal')
      .eq('status', 'completed');

    const { count: pendingCount } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    return {
      totalDeposits: totalDeposits || 0,
      totalWithdrawals: totalWithdrawals || 0,
      pendingCount: pendingCount || 0,
    };
  }

  async creditWallet(userId: string, amount: number, paymentId: string, description: string): Promise<void> {
    const { data: wallet } = await supabase
      .from('point_wallets')
      .select('balance, total_earned')
      .eq('user_id', userId)
      .single();

    if (!wallet) throw new Error('Wallet not found');

    const newBalance = wallet.balance + amount;

    await supabase
      .from('point_wallets')
      .update({
        balance: newBalance,
        total_earned: wallet.total_earned + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    await supabase.from('point_transactions').insert({
      user_id: userId,
      type: 'credit',
      amount,
      description,
      reference_id: paymentId,
      balance_after: newBalance,
    });
  }

  async debitWallet(userId: string, amount: number, paymentId: string, description: string): Promise<void> {
    const { data: wallet } = await supabase
      .from('point_wallets')
      .select('balance, total_spent')
      .eq('user_id', userId)
      .single();

    if (!wallet) throw new Error('Wallet not found');

    const newBalance = wallet.balance - amount;
    if (newBalance < 0) throw new Error('Insufficient points balance');

    await supabase
      .from('point_wallets')
      .update({
        balance: newBalance,
        total_spent: wallet.total_spent + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    await supabase.from('point_transactions').insert({
      user_id: userId,
      type: 'debit',
      amount: -amount,
      description,
      reference_id: paymentId,
      balance_after: newBalance,
    });
  }

  async refundWallet(userId: string, amount: number, paymentId: string, description: string): Promise<void> {
    const { data: wallet } = await supabase
      .from('point_wallets')
      .select('balance, total_earned')
      .eq('user_id', userId)
      .single();

    if (!wallet) throw new Error('Wallet not found');

    const newBalance = wallet.balance + amount;

    await supabase
      .from('point_wallets')
      .update({
        balance: newBalance,
        total_earned: wallet.total_earned + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    await supabase.from('point_transactions').insert({
      user_id: userId,
      type: 'refund',
      amount,
      description,
      reference_id: paymentId,
      balance_after: newBalance,
    });
  }

  async getWalletBalance(userId: string): Promise<number> {
    const { data } = await supabase
      .from('point_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    return data?.balance || 0;
  }

  private toIso(value: any): string | null {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    return value;
  }

  private mapRow(row: any): PaymentEntity {
    return {
      id: row.id,
      userId: row.user_id,
      processedBy: row.processed_by,
      type: row.type,
      amount: row.amount,
      currency: row.currency,
      method: row.method,
      status: row.status,
      referenceId: row.reference_id,
      referenceType: row.reference_type,
      notes: row.notes,
      adminNotes: row.admin_notes,
      balanceBefore: row.balance_before,
      balanceAfter: row.balance_after,
      approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : null,
      completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      txnId: row.txn_id ?? null,
      utrNumber: row.utr_number ?? null,
      screenshotUrl: row.screenshot_url ?? null,
      provider: row.provider,
      rejectionReason: row.rejection_reason ?? null,
      bankName: row.bank_name ?? null,
      accountNumber: row.account_number ?? null,
      ifscCode: row.ifsc_code ?? null,
      accountHolderName: row.account_holder_name ?? null,
    };
  }
}
