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

  async awardPoints(userId: string, amount: number, type: 'activity' | 'bonus' | 'referral' | 'manual', description: string, referenceId?: string) {
    const transactionType = type === 'activity' ? 'credit' : type === 'bonus' ? 'bonus' : type === 'referral' ? 'referral' : 'credit';
    return this.pointsRepo.addPoints(userId, amount, transactionType, description, referenceId);
  }

  async deductPoints(userId: string, amount: number, description: string, referenceId?: string) {
    return this.pointsRepo.addPoints(userId, -amount, 'debit', description, referenceId);
  }

  async getLeaderboard(limit = 100) {
    const { data } = await supabase
      .from('point_wallets')
      .select('user_id, balance, total_earned')
      .order('balance', { ascending: false })
      .limit(limit);

    return (data || []).map((row: any) => ({
      userId: row.user_id,
      name: row.users?.name || 'Anonymous',
      balance: row.balance,
      totalEarned: row.total_earned,
    }));
  }
}
