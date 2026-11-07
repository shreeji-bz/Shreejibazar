export type PaymentType = 'deposit' | 'withdrawal';
// A withdrawal's lifecycle: pending -> approved | rejected | expired.
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'expired';

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  type: PaymentType;
  amount: number;
  method: string;
  status: PaymentStatus;
  referenceId: string;
  pointsBefore: number;
  pointsAfter: number;
  pointsDeducted: number;
  notes?: string;
  adminNote?: string;
  /** The queue endpoint returns the mapped entity, which keys this as adminNotes. */
  adminNotes?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt?: string;
  // --- Withdrawal details (admin requests module) ---
  rejectionReason?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  accountHolderName?: string | null;
  /** User's CURRENT wallet (GET /admin/payments/withdrawals only). */
  walletBalance?: number;
  pendingWithdrawal?: number;
  availableBalance?: number;
}

export interface PaymentFilters {
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface PaginatedPaymentsResponse {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProcessPaymentRequest {
  adminNote?: string;
}
