export interface PointsWallet {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

// Live DB point_transactions.type CHECK only allows 'credit' | 'debit'.
export interface PointTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  balanceBefore?: number;
  balanceAfter: number;
  createdAt: string;
}
