export interface IAdminRepository {
  findByEmail(email: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  updateLastLogin(id: string): Promise<void>;
  logAudit(data: any): Promise<void>;
  getAuditLogs(options?: any): Promise<any>;
}
