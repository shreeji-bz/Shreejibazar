import { UsersRepository } from '../repositories/users.repository';
import bcrypt from 'bcryptjs';
import { AppError } from '../../../common/utils/error.util';

export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async getAll(options?: any) {
    return this.usersRepository.findAll(options);
  }

  async getById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async update(id: string, data: any) {
    return this.usersRepository.update(id, data);
  }

  async updateStatus(id: string, status: string) {
    return this.usersRepository.updateStatus(id, status);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    const passwordHash = user.password_hash;
    if (!passwordHash) {
      throw new AppError(400, 'NO_PASSWORD', 'No password set for this account');
    }

    const isValid = await bcrypt.compare(currentPassword, passwordHash);
    if (!isValid) {
      throw new AppError(401, 'INVALID_PASSWORD', 'Current password is incorrect');
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.usersRepository.updatePassword(userId, hashed);
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    const passwordHash = user.password_hash;
    if (!passwordHash) {
      throw new AppError(400, 'NO_PASSWORD', 'Cannot delete account without a password');
    }

    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid) {
      throw new AppError(401, 'INVALID_PASSWORD', 'Password is incorrect');
    }

    // Soft delete by setting status to inactive
    await this.usersRepository.update(userId, { status: 'inactive', updated_at: new Date().toISOString() });
  }
}
