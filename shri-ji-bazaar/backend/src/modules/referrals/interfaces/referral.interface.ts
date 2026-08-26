export interface IReferralRepository {
  findAll(options?: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
  complete(referralId: string): Promise<void>;
  getStats(referrerId?: string): Promise<any>;
}
