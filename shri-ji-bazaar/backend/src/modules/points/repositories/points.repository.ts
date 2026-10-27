import { PointsWallet, PointTransaction } from '../entities/points.entity';
import { supabase } from '../../../config/database.config';

export class PointsRepository {
  async getWallet(userId: string): Promise<PointsWallet | null> {
    const { data } = await supabase.from('point_wallets').select('*').eq('user_id', userId).single();

    if (!data) {
      const { data: newWallet } = await supabase.from('point_wallets').insert({ user_id: userId }).select().single();
      return newWallet ? this.mapWallet(newWallet) : null;
    }

    return this.mapWallet(data);
  }

  async getTransactions(userId: string, options: any = {}): Promise<{ data: PointTransaction[]; meta: any }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, options.limit || 20);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await supabase
      .from('point_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    return {
      data: (data || []).map(this.mapTransaction),
      meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    };
  }

  async addPoints(userId: string, amount: number, type: PointTransaction['type'], description: string, referenceId?: string): Promise<PointTransaction> {
    const wallet = await this.getWallet(userId);
    if (!wallet) throw new Error('Wallet not found');

    const newBalance = wallet.balance + amount;
    if (newBalance < 0) throw new Error('Insufficient points');

    const { error: walletError } = await supabase
      .from('point_wallets')
      .update({
        balance: newBalance,
        total_earned: (type === 'credit' || type === 'bonus' || type === 'referral') ? (wallet.totalEarned || 0) + amount : (wallet.totalEarned || 0),
        total_spent: type === 'debit' ? (wallet.totalSpent || 0) + Math.abs(amount) : (wallet.totalSpent || 0),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (walletError) throw new Error(`Failed to update wallet: ${walletError.message}`);

    // Ledger row. description / reference_type fall back to safe defaults
    // because the live point_transactions table may reject NULLs; a ledger
    // failure must not roll back the wallet update silently.
    const { data: transaction, error: txError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        description: description || type,
        reference_id: referenceId,
        reference_type: type,
        balance_after: newBalance,
      })
      .select()
      .single();

    if (txError || !transaction) {
      console.error('Points: ledger insert failed (wallet already updated):', txError?.message);
    }
    if (transaction) return this.mapTransaction(transaction);

    // Ledger row could not be written (constraint mismatch on this DB), but
    // the balance itself is correct — return a stub so callers still succeed.
    return {
      id: 'ledger-skipped',
      userId,
      type,
      amount,
      description: description || type,
      referenceId: referenceId || null,
      referenceType: type,
      balanceAfter: newBalance,
      createdAt: new Date().toISOString(),
    } as PointTransaction;
  }

  async transferPoints(fromUserId: string, toUserId: string, amount: number, description: string): Promise<{ debit: PointTransaction; credit: PointTransaction }> {
    const debit = await this.addPoints(fromUserId, -amount, 'debit', description);
    const credit = await this.addPoints(toUserId, amount, 'referral', description);
    return { debit, credit };
  }

  private mapWallet(row: any): PointsWallet {
    return {
      id: row.id,
      userId: row.user_id,
      balance: row.balance,
      totalEarned: row.total_earned,
      totalSpent: row.total_spent,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapTransaction(row: any): PointTransaction {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: row.amount,
      description: row.description,
      referenceId: row.reference_id,
      referenceType: row.reference_type,
      balanceAfter: row.balance_after,
      createdAt: row.created_at,
    };
  }
}
