import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../../config/app.config';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthResponse, RefreshTokenPayload } from '../interfaces/auth.interface';
import { UserEntity } from '../entities/user.entity';
import { AppError } from '../../../common/utils/error.util';
import { validateMobile } from '../../../common/utils/validators.util';

export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async register(data: {
    name: string;
    mobile: string;
    email?: string;
    password: string;
    referralCode?: string;
  }): Promise<AuthResponse> {
    const existingUser = await this.authRepository.findByMobile(data.mobile);
    if (existingUser) {
      throw new AppError(409, 'MOBILE_EXISTS', 'Mobile number already registered');
    }

    if (data.email) {
      const existingEmail = await this.authRepository.findByEmail(data.email);
      if (existingEmail) {
        throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered');
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const userReferralCode = this.generateReferralCode(data.name);
    let referredBy: string | undefined;

    if (data.referralCode) {
      const referrer = await this.authRepository.findByReferralCode(data.referralCode);
      if (!referrer) {
        throw new AppError(400, 'INVALID_REFERRAL', 'Invalid referral code');
      }
      referredBy = referrer.id;
    }

    const user = await this.authRepository.create({
      name: data.name,
      mobile: data.mobile,
      email: data.email,
      passwordHash,
      referralCode: userReferralCode,
      referredBy,
      status: 'active',
    });

    // Initialize wallet with base welcome balance
    await this.authRepository.initializeWallet(user.id, 100);

    // Apply signup bonus if configured in settings
    await this.applySignupBonus(user.id);

    const tokens = this.generateTokens(user.id, user.referralCode);
    await this.authRepository.createRefreshToken(user.id, tokens.refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email || '',
        referralCode: user.referralCode,
      },
    };
  }

  async login(mobile: string, password: string): Promise<AuthResponse> {
    const user = await this.authRepository.findByMobile(mobile);
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid mobile number or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid mobile number or password');
    }

    if (user.status !== 'active') {
      throw new AppError(403, 'ACCOUNT_SUSPENDED', 'Your account has been suspended');
    }

    await this.authRepository.updateLastLogin(user.id);
    await this.authRepository.revokeAllRefreshTokens(user.id);

    const tokens = this.generateTokens(user.id, user.referralCode);
    await this.authRepository.createRefreshToken(
      user.id,
      tokens.refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email || '',
        referralCode: user.referralCode,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.secret) as RefreshTokenPayload;

      const tokenRecord = await this.authRepository.findRefreshToken(refreshToken);
      if (!tokenRecord || tokenRecord.isRevoked || new Date(tokenRecord.expiresAt) < new Date()) {
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
      }

      const user = await this.authRepository.findById(payload.userId);
      if (!user) {
        throw new AppError(401, 'USER_NOT_FOUND', 'User not found');
      }

      await this.authRepository.revokeRefreshToken(tokenRecord.id);

      const tokens = this.generateTokens(user.id, user.referralCode);
      await this.authRepository.createRefreshToken(
        user.id,
        tokens.refreshToken,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          name: user.name,
          mobile: user.mobile,
          email: user.email || '',
          referralCode: user.referralCode,
        },
      };
    } catch (error) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.authRepository.revokeAllRefreshTokens(userId);
  }

  async validateUser(userId: string): Promise<UserEntity | null> {
    return this.authRepository.findById(userId);
  }

  async forgotPassword(mobile: string): Promise<{ message: string }> {
    const user = await this.authRepository.findByMobile(mobile);
    if (!user) {
      // Don't reveal whether user exists
      return { message: 'If an account exists with this mobile number, a reset code has been sent' };
    }

    const resetCode = this.generateResetCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.authRepository.setResetCode(user.id, resetCode, expiresAt);

    return { message: 'If an account exists with this mobile number, a reset code has been sent' };
  }

  async resetPassword(mobile: string, resetCode: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.authRepository.findByMobile(mobile);
    if (!user) {
      throw new AppError(400, 'INVALID_REQUEST', 'Invalid mobile number or reset code');
    }

    const resetRecord = await this.authRepository.findValidResetCode(user.id, resetCode);
    if (!resetRecord) {
      throw new AppError(400, 'INVALID_RESET_CODE', 'Invalid or expired reset code');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.authRepository.updatePassword(user.id, passwordHash);
    await this.authRepository.clearResetCode(user.id);

    // Revoke all existing refresh tokens for security
    await this.authRepository.revokeAllRefreshTokens(user.id);

    return { message: 'Password reset successfully. Please log in with your new password.' };
  }

  private generateTokens(userId: string, referralCode: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId, referralCode, type: 'access' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as any
    );

    const refreshToken = jwt.sign(
      { userId, tokenId: uuidv4(), type: 'refresh' },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn } as any
    );

    return { accessToken, refreshToken };
  }

  private generateReferralCode(name: string): string {
    const prefix = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
  }

  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  private async applySignupBonus(userId: string): Promise<void> {
    const raw = await this.authRepository.getSetting('signup_bonus_points');
    const amount = raw ? parseInt(raw, 10) : 0;
    if (!amount || amount <= 0) return;

    await this.authRepository.creditPoints(userId, amount, 'signup_bonus', `Welcome bonus: ${amount} points`);
  }
}
