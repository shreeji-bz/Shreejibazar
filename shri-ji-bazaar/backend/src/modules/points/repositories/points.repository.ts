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

  async addPoints(userId: string, amount: number, type: 'credit' | 'debit', description: string, referenceId?: string): Promise<PointTransaction> {
    const wallet = await this.getWallet(userId);
    if (!wallet) throw new Error('Wallet not found');

    const balanceBefore = wallet.balance || 0;
    const newBalance = balanceBefore + amount;
    if (newBalance < 0) throw new Error('Insufficient points');
    // Live point_transactions.type only accepts 'credit' | 'debit'.
    const txType: 'credit' | 'debit' = amount < 0 ? 'debit' : 'credit';

    // Live point_wallets only has `balance` (no total_earned/total_spent).
    const { error: walletError } = await supabase
      .from('point_wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    if (walletError) throw new Error('Failed to update wallet: ' + walletError.message);

    const { data: transaction, error: txError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: txType,
        amount,
        description,
        reference_id: referenceId,
        balance_before: balanceBefore,
        balance_after: newBalance,
      })
      .select()
      .single();
    if (txError || !transaction) throw new Error('Failed to record transaction');

    return this.mapTransaction(transaction);
  }

  async transferPoints(fromUserId: string, toUserId: string, amount: number, description: string): Promise<{ debit: PointTransaction; credit: PointTransaction }> {
    const debit = await this.addPoints(fromUserId, -amount, 'debit', description);
    const credit = await this.addPoints(toUserId, amount, 'credit', description);
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
      balanceBefore: row.balance_before,
      balanceAfter: row.balance_after,
      createdAt: row.created_at,
    };
  }
}
