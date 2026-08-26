/**
 * Shri Ji Bazaar - Points Service
 */

import { PointsRepository } from '../repositories/points.repository';
import { PointReference } from '../interfaces/points.interface';

export class PointsService {
  constructor(private pointsRepository: PointsRepository) {}

  async getWallet(userId: string): Promise<{ balance: number }> {
    const wallet = await this.pointsRepository.getWallet(userId);
    return { balance: wallet.balance };
  }

  async getTransactions(options: { userId: string; type?: string; page?: number; limit?: number }): Promise<{
    data: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.pointsRepository.getTransactions({
      userId: options.userId,
      type: options.type as 'credit' | 'debit' | undefined,
      page: options.page,
      limit: options.limit,
    });
  }

  async creditPoints(
    userId: string,
    amount: number,
    description: string,
    reference: PointReference
  ): Promise<any> {
    if (amount <= 0) {
      throw new Error('Credit amount must be a positive number');
    }

    const transaction = await this.pointsRepository.creditPoints(userId, amount, description, reference);
    return transaction;
  }

  async debitPoints(
    userId: string,
    amount: number,
    description: string,
    reference: PointReference
  ): Promise<any> {
    if (amount <= 0) {
      throw new Error('Debit amount must be a positive number');
    }

    // Check balance before debiting
    const { balance } = await this.pointsRepository.getWallet(userId);
    if (balance < amount) {
      throw new Error('Insufficient balance');
    }

    const transaction = await this.pointsRepository.debitPoints(userId, amount, description, reference);
    return transaction;
  }

  async adjustPoints(userId: string, amount: number, description: string): Promise<any> {
    if (amount === 0) {
      throw new Error('Adjustment amount cannot be zero');
    }

    return this.pointsRepository.adjustPoints(userId, amount, description);
  }
}
