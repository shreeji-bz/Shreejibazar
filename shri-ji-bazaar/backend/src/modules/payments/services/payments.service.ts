import { PaymentEntity } from '../entities/payment.entity';
import { IPaymentsRepository } from '../interfaces/payments.interface';
import { supabase } from '../../../config/database.config';

// processed_by is a UUID column; gateway/system callers pass non-UUID ids.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    const newBalance = balanceBefore + amount;

    const { data: transaction, error: txnError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'credit',
        amount,
        description: `Deposit via ${method}${notes ? `: ${notes}` : ''}`,
        reference_id: referenceId,
        reference_type: 'play',
        balance_before: balanceBefore,
        balance_after: newBalance,
      })
      .select()
      .single();

    if (txnError || !transaction) {
      console.error('Deposit point_transactions insert error:', JSON.stringify(txnError));
      throw new Error(`Failed to create deposit transaction: ${txnError?.message || 'Unknown error'}`);
    }

    const payment = await this.paymentsRepo.create({
      userId,
      type: 'deposit',
      amount,
      currency: 'INR',
      method: method as PaymentEntity['method'],
      status: 'completed',
      referenceId: referenceId || transaction.id,
      referenceType: 'play',
      notes,
      balanceBefore,
      balanceAfter: newBalance,
      txnId: extra?.txnId,
      utrNumber: extra?.utrNumber,
      screenshotUrl: extra?.screenshotUrl,
      provider: extra?.provider || 'manual',
    });

    await this.paymentsRepo.creditWallet(
      userId,
      amount,
      payment.id,
      `Deposit via ${method}${notes ? `: ${notes}` : ''}`,
    );

    return payment;
  }

  /**
   * Request an admin-approved withdrawal.
   *
   * The money is NOT deducted here: the amount is only RESERVED
   * (point_wallets.pending_withdrawal) so it can't be spent or requested
   * twice. The wallet balance changes only when an admin approves
   * (settle) — rejection/expiry just releases the hold.
   */
  async createWithdrawal(userId: string, amount: number, method: string, referenceId?: string, notes?: string, bankDetails?: { bankName?: string; accountNumber?: string; ifscCode?: string; accountHolderName?: string }): Promise<PaymentEntity> {
    if (!amount || amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

    // Existing business rule (the mobile UI mirrors it): requests are only
    // accepted 6:00 AM -> 1:00 PM server-local time. Admins may still act on
    // pending requests at any time (including the expiry job).
    const hour = new Date().getHours();
    if (hour < 6 || hour >= 13) {
      throw new Error('Withdrawals can be requested between 6:00 AM and 1:00 PM. Please try again within that window.');
    }

    // Minimum is configurable in settings (admin Settings menu), default 100.
    const minWithdrawal = parseInt(await this.paymentsRepo.getSetting('min_withdrawal_amount', '100'), 10);
    if (amount < minWithdrawal) {
      throw new Error(`Minimum withdrawal amount is ${minWithdrawal} INR`);
    }

    // One open request per user — no duplicate pending withdrawals.
    const open = await this.paymentsRepo.findUserPendingWithdrawal(userId);
    if (open) {
      throw new Error('You already have a pending withdrawal request. It will be processed before a new one can be made.');
    }

    // Reserve against AVAILABLE = balance - pending (018 wallet shape).
    const wallet = await this.paymentsRepo.getWallet(userId);
    if (wallet.available < amount) {
      throw new Error(`Insufficient available balance. Available: ${wallet.available} INR`);
    }

    // Create the pending request first (so the payment id exists for the hold).
    const request = await this.paymentsRepo.create({
      userId,
      type: 'withdrawal',
      amount,
      currency: 'INR',
      method: method as PaymentEntity['method'],
      status: 'pending',
      referenceId: referenceId || null,
      referenceType: referenceId ? 'user_provided' : null,
      notes,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance, // untouched until approval
      bankName: bankDetails?.bankName,
      accountNumber: bankDetails?.accountNumber,
      ifscCode: bankDetails?.ifscCode,
      accountHolderName: bankDetails?.accountHolderName,
    });

    // Hold the amount. If the live DB doesn't have the 018 RPC yet, fall
    // back to the legacy ledger behavior (pending debit row, no hold).
    const reserve = await this.paymentsRepo.reserveWithdrawal(userId, amount, request.id, `Withdrawal request ${request.id}`);
    if (!reserve.ok && !reserve.missing) {
      // Real rejection (race, insufficient) — undo the request we just made.
      await supabase.from('payments').delete().eq('id', request.id);
      throw new Error(reserve.error || 'Could not reserve this withdrawal amount');
    }

    if (reserve.missing) {
      // Pre-018 fallback: keep the old pending-debit ledger row so the admin
      // queue still sees the request (reservation simply isn't enforced).
      const { error: txnError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: userId,
          type: 'debit',
          amount: -amount,
          description: `Pending withdrawal via ${method}${notes ? `: ${notes}` : ''}`,
          reference_id: request.id,
          reference_type: 'point_transaction',
          balance_after: wallet.balance,
          balance_before: wallet.balance,
        });
      if (txnError) {
        await supabase.from('payments').delete().eq('id', request.id);
        throw new Error(`Failed to record withdrawal request: ${txnError.message}`);
      }
    }

    // Audit: who requested, when, how much.
    await this.paymentsRepo.logAudit({
      adminId: null,
      action: 'withdrawal_requested',
      entityId: request.id,
      metadata: { source: 'user', userId, amount, method },
    });

    return request;
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

  /**
   * Admin ACCEPTS a withdrawal: atomically move the reserved amount out of
   * the wallet (settle RPC), flip the request to a terminal "paid" state,
   * notify the user, and audit-log the decision.
   *
   * The guarded claim makes this safe against double-processing: two admins
   * (or admin + expiry job) racing on the same request -> only the first
   * claim succeeds; the rest get null and abort.
   */
  async approveWithdrawal(id: string, adminId: string, adminNotes?: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.type !== 'withdrawal') throw new Error('Payment is not a withdrawal');

    // Claim it as 'approved' (still pending -> the request is being settled).
    const claimed = await this.paymentsRepo.claimDecision(id, 'approved', {
      processed_by: UUID_RE.test(adminId) ? adminId : null,
      admin_notes: adminNotes || null,
      approved_at: new Date().toISOString(),
    });
    if (!claimed) {
      // It is no longer pending — someone already decided it.
      const now = await this.paymentsRepo.findById(id);
      throw new Error(`Withdrawal can no longer be approved (status: ${now?.status})`);
    }

    // Settle the hold: balance -= amount, pending -= amount, ledger row —
    // all in one Postgres transaction (the 018 RPC). 'approved' is the
    // terminal "paid" state for a withdrawal.
    const settle = await this.paymentsRepo.settleWithdrawal(
      payment.userId,
      payment.amount,
      id,
      `Withdrawal approved${adminNotes ? `: ${adminNotes}` : ''}`,
    );
    if (!settle.ok && !settle.missing) {
      // Real failure (e.g. hold already released) -> roll the status back.
      await this.paymentsRepo.claimDecision(id, 'pending');
      throw new Error(settle.error || 'Failed to settle the withdrawal');
    }
    if (settle.missing) {
      // Pre-018 fallback: settle via the plain ledger debit. If even that
      // fails, roll the status back to pending so it can be retried.
      try {
        await this.paymentsRepo.debitWallet(payment.userId, payment.amount, id, `Withdrawal approved${adminNotes ? `: ${adminNotes}` : ''}`);
      } catch (e) {
        await this.paymentsRepo.claimDecision(id, 'pending');
        throw e;
      }
    }

    // Notify the user (configured message) and audit-log who decided.
    await this.notifyWithdrawalDecision(payment, 'approved');
    await this.paymentsRepo.logAudit({
      adminId: UUID_RE.test(adminId) ? adminId : null,
      action: 'withdrawal_approved',
      entityId: id,
      metadata: { source: 'admin', userId: payment.userId, amount: payment.amount, note: adminNotes || null },
    });

    return claimed;
  }

  /**
   * Admin REJECTS a withdrawal: release the reservation (money was never
   * spent), mark it rejected with an optional reason, notify + audit.
   */
  async rejectWithdrawal(id: string, adminId: string, adminNotes?: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.type !== 'withdrawal') throw new Error('Payment is not a withdrawal');

    const claimed = await this.paymentsRepo.claimDecision(id, 'rejected', {
      processed_by: UUID_RE.test(adminId) ? adminId : null,
      admin_notes: adminNotes || null,
      rejection_reason: adminNotes || null,
    });
    if (!claimed) {
      const now = await this.paymentsRepo.findById(id);
      throw new Error(`Withdrawal can no longer be rejected (status: ${now?.status})`);
    }

    // Give the hold back; balance untouched. Pre-018 there is no hold to
    // release (missing=true); a real release failure is logged but never
    // blocks the decision (the request is already terminal).
    const release = await this.paymentsRepo.releaseWithdrawal(payment.userId, payment.amount, id, `Withdrawal rejected${adminNotes ? `: ${adminNotes}` : ''}`);
    if (!release.ok && !release.missing) {
      console.error(`withdrawal ${id}: release failed: ${release.error}`);
    }

    await this.notifyWithdrawalDecision(payment, 'rejected', adminNotes);
    await this.paymentsRepo.logAudit({
      adminId: UUID_RE.test(adminId) ? adminId : null,
      action: 'withdrawal_rejected',
      entityId: id,
      metadata: { source: 'admin', userId: payment.userId, amount: payment.amount, reason: adminNotes || null },
    });

    return claimed;
  }

  /**
   * System EXPIRY: the admin left a pending request idle past the timeout.
   * Release the hold, mark it expired, notify + audit. Idempotent-safe via
   * the guarded claim (only 'pending' can move to 'expired').
   */
  async expireWithdrawal(id: string): Promise<PaymentEntity | null> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment || payment.type !== 'withdrawal' || payment.status !== 'pending') return null;

    // processed_by is a UUID column, so the system actor is NOT written there;
    // attribution lives in admin_notes + the audit row below.
    const claimed = await this.paymentsRepo.claimDecision(id, 'expired', {
      admin_notes: 'Expired — no admin action within the response window',
    });
    if (!claimed) return null;

    await this.paymentsRepo.releaseWithdrawal(payment.userId, payment.amount, id, `Withdrawal expired ${id}`);

    await this.notifyWithdrawalDecision(payment, 'expired');
    await this.paymentsRepo.logAudit({
      adminId: null,
      action: 'withdrawal_expired',
      entityId: id,
      metadata: { source: 'system_job', userId: payment.userId, amount: payment.amount },
    });

    return claimed;
  }

  /**
   * One expiry pass: expire every pending withdrawal older than the window.
   * Runs per-row so a single failing request (e.g. the live DB not yet
   * allowing 'expired') never aborts the rest of the batch.
   */
  async runWithdrawalExpiry(): Promise<{ expired: number; skipped: number; reason?: string }> {
    const timeoutHours = parseFloat(await this.paymentsRepo.getSetting('withdrawal_admin_timeout_hours', '24'));
    const cutoff = new Date(Date.now() - timeoutHours * 3600 * 1000).toISOString();
    const overdue = await this.paymentsRepo.findPendingWithdrawalsOverdue(cutoff);
    let expired = 0;
    let skipped = 0;
    let reason: string | undefined;
    for (const p of overdue) {
      try {
        const done = await this.expireWithdrawal(p.id);
        if (done) expired += 1;
        else skipped += 1;
      } catch (e: any) {
        skipped += 1;
        reason = e?.message;
        console.error(`[withdrawal-expiry] failed to expire ${p.id}:`, e?.message || e);
      }
    }
    return { expired, skipped, reason };
  }

  /**
   * User-facing withdrawal config, all from settings (admin-editable). Used by
   * the mobile app for validation + the configurable messages/timeout.
   */
  async getWithdrawalConfig(): Promise<{
    minAmount: number;
    adminTimeoutHours: number;
    pendingNoticeDelayMs: number;
    messages: { pending: string; approved: string; rejected: string; expired: string };
  }> {
    const get = (k: string, f: string) => this.paymentsRepo.getSetting(k, f);
    return {
      minAmount: parseInt(await get('min_withdrawal_amount', '100'), 10),
      adminTimeoutHours: parseFloat(await get('withdrawal_admin_timeout_hours', '24')),
      pendingNoticeDelayMs: parseInt(await get('withdrawal_pending_notice_delay_ms', '3500'), 10),
      messages: {
        pending: await get('msg_withdrawal_pending', 'Your withdrawal request has been sent. It is pending admin approval. Your money is safe in your wallet.'),
        approved: await get('msg_withdrawal_approved', 'Your withdrawal of {amount} has been approved.'),
        rejected: await get('msg_withdrawal_rejected', 'Your withdrawal request was not processed. Your {amount} is safe in your wallet.'),
        expired: await get('msg_withdrawal_expired', 'Your withdrawal request could not be processed in time. Your {amount} is safe in your wallet. You can request again.'),
      },
    };
  }

  /** Fill a configured message template with {amount} and deliver it. */
  private async notifyWithdrawalDecision(payment: PaymentEntity, outcome: 'approved' | 'rejected' | 'expired', reason?: string): Promise<void> {
    const cfg = await this.getWithdrawalConfig();
    const inr = `₹${payment.amount}`;
    const fill = (m: string) => m.replace(/\{amount\}/g, inr);
    const titles: Record<string, string> = {
      approved: 'Withdrawal Approved',
      rejected: 'Withdrawal Not Processed',
      expired: 'Withdrawal Expired',
    };
    let message: string;
    if (outcome === 'approved') {
      message = fill(cfg.messages.approved);
    } else if (outcome === 'expired') {
      message = fill(cfg.messages.expired);
    } else {
      message = reason ? `${fill(cfg.messages.rejected)} Reason: ${reason}` : fill(cfg.messages.rejected);
    }
    try {
      await this.paymentsRepo.notifyUser(payment.userId, titles[outcome], message);
    } catch (e) {
      // A notification failure must never block the financial decision.
      console.error('withdrawal notification failed:', e);
    }
  }

  /**
   * Create a PENDING gateway (IMB) deposit: records the intent to pay
   * WITHOUT touching the wallet. The wallet is only credited when the
   * gateway's webhook confirms the payment (approveDeposit) — crediting at
   * order-creation time would hand out points for money not yet paid.
   */
  async createPendingGatewayDeposit(
    userId: string,
    amount: number,
    method: string,
    orderRef: string,
    description: string
  ): Promise<PaymentEntity> {
    if (amount <= 0) throw new Error('Deposit amount must be greater than 0');

    const balanceBefore = await this.paymentsRepo.getWalletBalance(userId);

    return this.paymentsRepo.create({
      userId,
      type: 'deposit',
      amount,
      currency: 'INR',
      method: method as PaymentEntity['method'],
      status: 'pending',
      referenceId: orderRef,
      referenceType: 'gateway_order',
      notes: description,
      balanceBefore,
      balanceAfter: balanceBefore, // unchanged until the webhook confirms
      provider: 'imb',
    });
  }

  /**
   * Remove/revert an ALREADY-COMPLETED deposit: cut the credited amount back
   * out of the user's wallet (debitWallet) and mark the payment rejected.
   * This is the "add money -> credit, remove money -> auto-cut" requirement.
   * Idempotent-ish: a payment that is not completed cannot be reverted
   * (nothing was credited), so it is rejected with a clear error.
   */
  async revertPayment(id: string, adminId: string, reason: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.type !== 'deposit') {
      throw new Error('Only completed deposits can be reverted');
    }
    if (payment.status !== 'completed') {
      throw new Error(`Payment is not completed (it's ${payment.status}); nothing to revert`);
    }

    // Cut the amount back out of the wallet (adds a debit ledger row).
    await this.paymentsRepo.debitWallet(
      payment.userId,
      payment.amount,
      id,
      `Deposit reverted${reason ? `: ${reason}` : ''}`,
    );

    return this.paymentsRepo.markReverted(id, adminId, `Reverted${reason ? `: ${reason}` : ''}`);
  }

  async rejectPayment(id: string, adminId: string, adminNotes?: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepo.findById(id);
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'pending') throw new Error('Payment is not pending');

    if (payment.type === 'withdrawal') {
      // Release the reservation + notify + audit (reason is optional).
      return this.rejectWithdrawal(id, adminId, adminNotes);
    }

    return this.paymentsRepo.reject(id, adminId, adminNotes || 'Rejected');
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

  /**
   * Admin queue of withdrawal requests. Each row is enriched with the user's
   * identity and their CURRENT wallet snapshot (balance / pending / available)
   * so the admin can decide with full context. `status` defaults to 'pending'
   * (the live queue) but any status is accepted for review/history.
   */
  async getWithdrawalRequests(status: string, limit = 50) {
    // Pending queue: oldest first (nearest expiry first); any other status: newest first.
    const base = status === 'pending'
      ? await this.paymentsRepo.findPendingWithdrawals(limit)
      : (await this.paymentsRepo.getAll(1, limit, 'withdrawal', status)).data;

    // `base` rows are already-mapped PaymentEntity (camelCase). Attach the
    // requester's identity (name/mobile) — do NOT re-run enrichWithUser,
    // which maps raw DB rows again and would null out userId/createdAt.
    const userIds = Array.from(new Set(base.map((p) => p.userId).filter(Boolean)));
    let userMap = new Map<string, { name: string | null; mobile: string | null }>();
    if (userIds.length) {
      const { data: users } = await supabase.from('users').select('id, name, mobile').in('id', userIds);
      userMap = new Map((users || []).map((u: any) => [u.id, { name: u.name, mobile: u.mobile }]));
    }

    // Current wallet snapshot per user (deduped).
    const wallets = new Map<string, Promise<any>>();
    for (const p of base) {
      if (p.userId && !wallets.has(p.userId)) {
        wallets.set(p.userId, this.paymentsRepo.getWallet(p.userId).catch(() => ({ balance: 0, pendingWithdrawal: 0, available: 0 })));
      }
    }

    return Promise.all(base.map(async (p: any) => {
      const user = userMap.get(p.userId);
      const wallet = p.userId ? await wallets.get(p.userId) : { balance: 0, pendingWithdrawal: 0, available: 0 };
      return {
        ...p,
        userName: user?.name || null,
        userMobile: user?.mobile || null,
        walletBalance: wallet.balance,
        pendingWithdrawal: wallet.pendingWithdrawal,
        availableBalance: wallet.available,
        // Rejected/expired decisions may carry a reason.
        rejectionReason: p.rejectionReason ?? p.adminNotes ?? null,
      };
    }));
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

  async getAllPayments({ page, limit, type, status, dateFrom, dateTo, search, methods }: {
    page: number;
    limit: number;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    /** Comma-separated payment methods (upi,bank_transfer,qr,paytm,phonepe,cash,points,admin). */
    methods?: string;
  }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from('payments').select('*', { count: 'exact' });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);
    if (methods) {
      const list = methods.split(',').map((m) => m.trim()).filter(Boolean);
      if (list.length) query = query.in('method', list);
    }
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
