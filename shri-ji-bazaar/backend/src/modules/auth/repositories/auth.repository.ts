import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../../config/app.config';
import { supabase } from '../../../config/database.config';
import { UserEntity } from '../entities/user.entity';
import { AuthResponse, RefreshTokenPayload } from '../interfaces/auth.interface';

export class AuthRepository {
  async findByMobile(mobile: string): Promise<(UserEntity & { passwordHash: string }) | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('mobile', mobile)
      .single();

    if (error || !data) return null;
    return this.mapRow(data);
  }

  async findByEmail(email: string): Promise<(UserEntity & { passwordHash: string }) | null> {
    if (!email) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return this.mapRow(data);
  }

  async findById(id: string): Promise<(UserEntity & { passwordHash: string }) | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapRow(data);
  }

  async findByReferralCode(referralCode: string): Promise<UserEntity | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('referral_code', referralCode)
      .single();

    if (error || !data) return null;
    return this.mapRow(data);
  }

  async create(data: Partial<UserEntity> & { passwordHash: string; referralCode: string }): Promise<UserEntity> {
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        password_hash: data.passwordHash,
        referral_code: data.referralCode,
        referred_by: data.referredBy || null,
        status: data.status || 'active',
      })
      .select()
      .single();

    if (error || !user) {
      console.error('Supabase insert error:', error);
      throw new Error(error?.message || 'Failed to create user');
    }
    return this.mapRow(user);
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await supabase.from('refresh_tokens').insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
      is_revoked: false,
    });
  }

  async findRefreshToken(token: string): Promise<{ userId: string; id: string; expiresAt: Date; isRevoked: boolean } | null> {
    const { data, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) return null;
    return {
      userId: data.user_id,
      id: data.id,
      expiresAt: new Date(data.expires_at),
      isRevoked: data.is_revoked,
    };
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await supabase.from('refresh_tokens').update({ is_revoked: true }).eq('id', tokenId);
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await supabase.from('refresh_tokens').update({ is_revoked: true }).eq('user_id', userId);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', userId);
  }

  async initializeWallet(userId: string, initialBalance: number): Promise<void> {
    await supabase.from('point_wallets').insert({
      user_id: userId,
      balance: initialBalance,
    });
  }

  async setResetCode(userId: string, code: string, expiresAt: Date): Promise<void> {
    await supabase
      .from('users')
      .update({ password_reset_code: code, password_reset_expires_at: expiresAt.toISOString() })
      .eq('id', userId);
  }

  async findValidResetCode(userId: string, code: string): Promise<any> {
    const { data, error } = await supabase
      .from('users')
      .select('id, password_reset_code, password_reset_expires_at')
      .eq('id', userId)
      .eq('password_reset_code', code)
      .gte('password_reset_expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data;
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await supabase
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', userId);
  }

  async clearResetCode(userId: string): Promise<void> {
    await supabase
      .from('users')
      .update({ password_reset_code: null, password_reset_expires_at: null })
      .eq('id', userId);
  }

  async creditPoints(userId: string, amount: number, type: string, description: string): Promise<void> {
    const walletResult = await supabase
      .from('point_wallets')
      .select('balance, total_earned, total_spent')
      .eq('user_id', userId)
      .maybeSingle();

    const existing = walletResult.data;
    const currentBalance = existing?.balance ?? 0;
    const currentEarned = existing?.total_earned ?? 0;
    const currentSpent = existing?.total_spent ?? 0;
    const isCredit = type === 'credit' || type === 'bonus' || type === 'referral' || type === 'signup_bonus';
    const newBalance = currentBalance + amount;
    const newEarned = isCredit ? currentEarned + amount : currentEarned;
    const newSpent = type === 'debit' ? currentSpent + Math.abs(amount) : currentSpent;

    if (existing) {
      await supabase
        .from('point_wallets')
        .update({ balance: newBalance, total_earned: newEarned, total_spent: newSpent, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('point_wallets')
        .insert({ user_id: userId, balance: newBalance, total_earned: newEarned, total_spent: newSpent });
    }

    await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        description,
        balance_after: newBalance,
      });
  }

  async getSetting(key: string): Promise<string | null> {
    const { data } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
    return data?.value ?? null;
  }

  private mapRow(row: any): UserEntity & { passwordHash: string } {
    return {
      id: row.id,
      name: row.name,
      mobile: row.mobile,
      email: row.email,
      avatar: row.avatar,
      referralCode: row.referral_code,
      referredBy: row.referred_by,
      status: row.status,
      lastLogin: row.last_login ? new Date(row.last_login) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      passwordHash: row.password_hash,
    };
  }
}
