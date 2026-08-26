export interface ReferralEntity {
  id: string;
  referrerId: string;
  referrerName: string;
  referredUserId: string;
  referredUserName: string;
  points: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface IReferralRepository {
  findAll(options?: ReferralFindAllOptions): Promise<{ data: ReferralEntity[]; meta: { total: number; page: number; limit: number } }>;
  findById(id: string): Promise<ReferralEntity | null>;
  create(referrerId: string, referredUserId: string, points: number): Promise<ReferralEntity>;
  completeReferral(id: string): Promise<void>;
  getByUser(userId: string): Promise<ReferralEntity[]>;
}

export interface ReferralFindAllOptions {
  status?: 'pending' | 'completed' | 'cancelled';
  page?: number;
  limit?: number;
}
