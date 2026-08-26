/**
 * Shri Ji Bazaar - Points Entities
 */

export interface PointWallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  referenceType?: string;
  description: string;
  createdAt: string;
}
