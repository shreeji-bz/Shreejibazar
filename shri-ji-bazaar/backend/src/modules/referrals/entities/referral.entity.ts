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
