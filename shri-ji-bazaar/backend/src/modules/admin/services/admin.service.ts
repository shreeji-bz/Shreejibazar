import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AdminRepository } from '../repositories/admin.repository';
import { config } from '../../../config/app.config';

export class AdminService {
  constructor(private adminRepository: AdminRepository) {}

  async login(email: string, password: string) {
    const admin = await this.adminRepository.findByEmail(email);
    if (!admin) throw new Error('Invalid credentials');
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) throw new Error('Invalid credentials');
    await this.adminRepository.updateLastLogin(admin.id);
    const token = jwt.sign({ adminId: admin.id, email: admin.email, role: admin.role }, config.jwt.secret, { expiresIn: '8h' });
    return { token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } };
  }

  async logAudit(data: any) {
    await this.adminRepository.logAudit(data);
  }

  async getAuditLogs(options?: any) {
    return this.adminRepository.getAuditLogs(options);
  }
}
