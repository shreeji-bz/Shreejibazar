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

    await supabase
      .from('point_wallets')
      .update({
        balance: newBalance,
        total_earned: (type === 'credit' || type === 'bonus' || type === 'referral') ? wallet.totalEarned + amount : wallet.totalEarned,
        total_spent: type === 'debit' ? wallet.totalSpent + Math.abs(amount) : wallet.totalSpent,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    const { data: transaction } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        description,
        reference_id: referenceId,
        balance_after: newBalance,
      })
      .select()
      .single();

    return this.mapTransaction(transaction);
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
