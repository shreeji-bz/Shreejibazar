import { PointsRepository } from '../repositories/points.repository';
import { supabase } from '../../../config/database.config';

export class PointsService {
  constructor(private pointsRepo: PointsRepository) {}

  async getWallet(userId: string) {
    return this.pointsRepo.getWallet(userId);
  }

  async getTransactions(userId: string, options: any) {
    return this.pointsRepo.getTransactions(userId, options);
  }

  // Live point_transactions.type only allows 'credit' | 'debit'. Any legacy
  // type (referral/bonus/manual) is stored as a credit; the reason goes in description.
  async awardPoints(userId: string, amount: number, type: string, description: string, referenceId?: string) {
    const txType: 'credit' | 'debit' = type === 'debit' || amount < 0 ? 'debit' : 'credit';
    return this.pointsRepo.addPoints(userId, amount, txType, description, referenceId);
  }

  async deductPoints(userId: string, amount: number, description: string, referenceId?: string) {
    return this.pointsRepo.addPoints(userId, -amount, 'debit', description, referenceId);
  }

  async listAllWallets() {
    // Live point_wallets has only `balance` (no total_earned/total_spent).
    const { data } = await supabase.from('point_wallets').select('user_id, balance').order('balance', { ascending: false });
    return (data || []).map((row: any) => ({
      user_id: row.user_id,
      balance: row.balance ?? 0,
    }));
  }

  async adjustPoints(args: { userId: string; amount: number; direction?: 'credit' | 'debit'; reason?: string }) {
    const { userId, amount, reason } = args;
    const direction = args.direction === 'debit' ? 'debit' : 'credit';
    if (!userId || !amount) throw new Error('userId and amount are required');
    const description = reason || `Manual ${direction} by admin`;
    return direction === 'credit'
      ? this.awardPoints(userId, amount, 'manual', description)
      : this.deductPoints(userId, amount, description);
  }

  async getLeaderboard(limit = 100) {
    const { data } = await supabase
      .from('point_wallets')
      .select('user_id, balance')
      .order('balance', { ascending: false })
      .limit(limit);

    return (data || []).map((row: any) => ({
      userId: row.user_id,
      balance: row.balance,
    }));
  }
}
