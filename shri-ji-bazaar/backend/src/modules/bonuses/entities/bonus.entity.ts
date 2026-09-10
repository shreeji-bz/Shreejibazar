export interface BonusEntity {
  id: string;
  name: string;
  description: string;
  bonusType: 'welcome' | 'daily' | 'referral' | 'special' | 'event';
  pointsAmount: number;
  minDeposit: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  maxClaims?: number;
  createdAt: string;
  updatedAt: string;
}
