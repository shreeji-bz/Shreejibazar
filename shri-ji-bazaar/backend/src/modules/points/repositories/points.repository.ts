/**
 * Shri Ji Bazaar - Points Repository (Supabase)
 */

import { supabase } from '../../../config/database.config';
import { IPointsRepository, GetTransactionsOptions, GetTransactionsResult, PointReference } from '../interfaces/points.interface';

export class PointsRepository implements IPointsRepository {
  async getWallet(userId: string): Promise<any> {
    const { data: wallet } = await supabase
      .from('point_wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (wallet) {
      return {
        id: wallet.id,
        userId: wallet.user_id,
        balance: wallet.balance,
        createdAt: wallet.created_at,
        updatedAt: wallet.updated_at,
      };
    }

    // Create wallet if it does not exist
    const { data: newWallet, error } = await supabase
      .from('point_wallets')
      .insert({ user_id: userId, balance: 0 })
      .select('*')
      .single();

    if (error || !newWallet) {
      throw new Error(error?.message || 'Failed to create point wallet');
    }

    return {
      id: newWallet.id,
      userId: newWallet.user_id,
      balance: newWallet.balance,
      createdAt: newWallet.created_at,
      updatedAt: newWallet.updated_at,
    };
  }

  async getTransactions(options: GetTransactionsOptions): Promise<GetTransactionsResult> {
    let query = supabase
      .from('point_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', options.userId);

    if (options.type) {
      query = query.eq('type', options.type);
    }

    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const transactions: any[] = (data || []).map((tx) => ({
      id: tx.id,
      userId: tx.user_id,
      type: tx.type,
      amount: tx.amount,
      balanceBefore: tx.balance_before,
      balanceAfter: tx.balance_after,
      referenceId: tx.reference_id,
      referenceType: tx.reference_type,
      description: tx.description,
      createdAt: tx.created_at,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: transactions,
      meta: { total, page, limit, totalPages },
    };
  }

  async creditPoints(
    userId: string,
    amount: number,
    description: string,
    reference: PointReference
  ): Promise<any> {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    const wallet = await this.getWallet(userId);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;

    const { error: updateError } = await supabase
      .from('point_wallets')
      .update({ balance: balanceAfter, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { data: tx, error: insertError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'credit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_id: reference.referenceId || null,
        reference_type: reference.referenceType || null,
        description,
      })
      .select('*')
      .single();

    if (insertError || !tx) {
      // Attempt to revert wallet update
      await supabase
        .from('point_wallets')
        .update({ balance: balanceBefore, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      throw new Error(insertError?.message || 'Failed to record credit transaction');
    }

    return this.mapTransaction(tx);
  }

  async debitPoints(
    userId: string,
    amount: number,
    description: string,
    reference: PointReference
  ): Promise<any> {
    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }

    const wallet = await this.getWallet(userId);
    const balanceBefore = wallet.balance;

    if (balanceBefore < amount) {
      throw new Error('Insufficient balance');
    }

    const balanceAfter = balanceBefore - amount;

    const { error: updateError } = await supabase
      .from('point_wallets')
      .update({ balance: balanceAfter, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { data: tx, error: insertError } = await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type: 'debit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_id: reference.referenceId || null,
        reference_type: reference.referenceType || null,
        description,
      })
      .select('*')
      .single();

    if (insertError || !tx) {
      // Attempt to revert wallet update
      await supabase
        .from('point_wallets')
        .update({ balance: balanceBefore, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      throw new Error(insertError?.message || 'Failed to record debit transaction');
    }

    return this.mapTransaction(tx);
  }

  async adjustPoints(
    userId: string,
    amount: number,
    description: string
  ): Promise<any> {
    if (amount === 0) {
      throw new Error('Adjustment amount cannot be zero');
    }

    if (amount > 0) {
      return this.creditPoints(userId, amount, description, {
        referenceType: 'admin_adjustment',
      });
    }

    return this.debitPoints(userId, Math.abs(amount), description, {
      referenceType: 'admin_adjustment',
    });
  }

  private mapTransaction(tx: any): any {
    return {
      id: tx.id,
      userId: tx.user_id,
      type: tx.type,
      amount: tx.amount,
      balanceBefore: tx.balance_before,
      balanceAfter: tx.balance_after,
      referenceId: tx.reference_id,
      referenceType: tx.reference_type,
      description: tx.description,
      createdAt: tx.created_at,
    };
  }
}
