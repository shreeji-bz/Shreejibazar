export interface ReferralEntity {
  id: string;
  referrerId: string;
  referredId: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'expired';
  rewardPoints: number;
  createdAt: string;
  completedAt?: string;
}
