export interface PointsWallet {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit' | 'bonus' | 'referral' | 'refund';
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  balanceAfter: number;
  createdAt: string;
}
