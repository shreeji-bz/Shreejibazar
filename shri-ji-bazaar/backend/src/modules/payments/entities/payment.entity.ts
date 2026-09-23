export interface PaymentEntity {
  id: string;
  userId: string;
  processedBy: string | null;
  type: 'deposit' | 'withdrawal' | 'bonus' | 'referral' | 'admin_credit' | 'admin_debit' | 'refund' | 'settlement';
  amount: number;
  currency: string;
  method: 'upi' | 'bank_transfer' | 'paytm' | 'phonepe' | 'cash' | 'points' | 'admin' | 'imps';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'cancelled';
  referenceId: string | null;
  referenceType: string | null;
  notes: string | null;
  adminNotes: string | null;
  balanceBefore: number;
  balanceAfter: number;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Deposit/withdrawal fields
  txnId: string | null;
  utrNumber: string | null;
  screenshotUrl: string | null;
  provider: string;
  rejectionReason: string | null;
  // Withdrawal fields
  bankName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  accountHolderName: string | null;
}
