import { PaymentEntity } from '../entities/payment.entity';
import { supabase } from '../../../config/database.config';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
      admin_notes: adminNotes,
      approved_at: now,
      completed_at: now,
      updated_at: now,
    };
    // processed_by is a UUID column; gateway/system callers pass non-UUID
    // ids ('imb_gateway') — only store it when it is a valid UUID.
    if (UUID_RE.test(adminId)) updateData.processed_by = adminId;

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

  /**
   * Mark an ALREADY-COMPLETED deposit as rejected (reverted). Unlike
   * `reject` this does NOT require the payment to be pending — it is the
   * "remove / claw back a deposit" path, called after `revertPayment` has
   * already cut the points back out of the user's wallet.
   */
  async markReverted(id: string, adminId: string, reason: string): Promise<PaymentEntity> {
    const payment = await this.findById(id);
    if (!payment) throw new Error('Payment not found');

    const now = new Date().toISOString();
    const { data: record, error } = await supabase
      .from('payments')
      .update({
        status: 'rejected',
        processed_by: adminId,
        admin_notes: reason,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !record) {
      throw new Error(`Failed to revert payment: ${error?.message || 'Unknown error'}`);
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

  /**
   * Full wallet snapshot including the withdrawal reservation.
   * `pending_withdrawal` only exists after sync 018 is run on the live DB,
   * so read it defensively (select('*')) — missing column => 0 reserved.
   */
  async getWallet(userId: string): Promise<{ balance: number; pendingWithdrawal: number; available: number }> {
    const { data } = await supabase
      .from('point_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const balance = data?.balance ?? 0;
    const pendingWithdrawal = Number(data?.pending_withdrawal ?? 0);
    return { balance, pendingWithdrawal, available: balance - pendingWithdrawal };
  }

  /** The user's single open withdrawal request (one pending per user rule). */
  async findUserPendingWithdrawal(userId: string): Promise<PaymentEntity | null> {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'withdrawal')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ? this.mapRow(data) : null;
  }

  /** Pending withdrawals whose clock has run out (server-side expiry job). */
  async findPendingWithdrawalsOverdue(cutoffIso: string, limit = 200): Promise<PaymentEntity[]> {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('type', 'withdrawal')
      .eq('status', 'pending')
      .lt('created_at', cutoffIso)
      .order('created_at', { ascending: true })
      .limit(limit);
    return (data || []).map(this.mapRow);
  }

  /**
   * Guarded status claim: moves a payment INTO `nextStatus` ONLY while it is
   * still 'pending' (single WHERE clause => single writer wins the race).
   * Returns the updated row, or null when someone else already acted — the
   * backstop that a terminal request can never be processed twice.
   */
  async claimDecision(id: string, nextStatus: string, extra: Record<string, any> = {}): Promise<PaymentEntity | null> {
    const update: any = { status: nextStatus, updated_at: new Date().toISOString(), ...extra };
    const { data, error } = await supabase
      .from('payments')
      .update(update)
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .maybeSingle();
    if (error) throw new Error(`Failed to update payment status: ${error.message}`);
    return data ? this.mapRow(data) : null;
  }

  /**
   * Wallet reservation moves via Postgres RPCs (sync 018). Each returns
   * `{ ok, missing }`:
   *   missing=true  -> the RPC/column doesn't exist on the live DB yet;
   *                    the caller falls back to the plain ledger path.
   *   ok=false      -> real business rejection (insufficient, not reserved).
   */
  /**
   * True when the RPC isn't deployed to the live DB yet (sync 018 pending).
   * PostgREST reports it two ways: Postgres error 42883, or its own
   * "Could not find the function ... in the schema cache" wrapper.
   */
  private rpcNotDeployed(message: string): boolean {
    return /42883|undefined_function|does not exist|could not find the function|schema cache|PGRST200/i.test(message);
  }

  async reserveWithdrawal(userId: string, amount: number, paymentId: string, description: string): Promise<{ ok: boolean; missing: boolean; error?: string }> {
    const { error } = await supabase.rpc('reserve_withdrawal_points', {
      p_user_id: userId,
      p_amount: Math.round(amount),
      p_payment_id: paymentId,
      p_description: description,
    });
    if (!error) return { ok: true, missing: false };
    const msg = String(error.message || error);
    const missing = this.rpcNotDeployed(msg);
    return { ok: false, missing, error: msg };
  }

  // (settle/release use rpcNotDeployed below)
  async settleWithdrawal(userId: string, amount: number, paymentId: string, description: string): Promise<{ ok: boolean; missing: boolean; error?: string }> {
    const { error } = await supabase.rpc('settle_withdrawal_points', {
      p_user_id: userId,
      p_amount: Math.round(amount),
      p_payment_id: paymentId,
      p_description: description,
    });
    if (!error) return { ok: true, missing: false };
    const msg = String(error.message || error);
    const missing = this.rpcNotDeployed(msg);
    return { ok: false, missing, error: msg };
  }

  async releaseWithdrawal(userId: string, amount: number, paymentId: string, description: string): Promise<{ ok: boolean; missing: boolean; error?: string }> {
    const { error } = await supabase.rpc('release_withdrawal_points', {
      p_user_id: userId,
      p_amount: Math.round(amount),
      p_payment_id: paymentId,
      p_description: description,
    });
    if (!error) return { ok: true, missing: false };
    const msg = String(error.message || error);
    const missing = this.rpcNotDeployed(msg);
    return { ok: false, missing, error: msg };
  }

  /** One settings value (fallback when the row is absent). */
  async getSetting(key: string, fallback: string): Promise<string> {
    const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
    return data?.value != null && String(data.value).trim() !== '' ? String(data.value) : fallback;
  }

  /** User-facing notification (in-app feed, type 'system'). Best-effort safe. */
  async notifyUser(userId: string, title: string, message: string): Promise<void> {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type: 'system',
      status: 'sent',
      is_read: false,
    });
  }

  /** Audit trail: who acted, when, on which request, and the outcome. */
  async logAudit(data: { adminId: string | null; action: string; entityId: string; metadata: Record<string, any> }): Promise<void> {
    await supabase.from('audit_logs').insert({
      admin_id: data.adminId,
      action: data.action,
      entity: 'payments',
      entity_id: data.entityId,
      metadata: data.metadata,
      user_agent: data.metadata?.source || '',
    });
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
