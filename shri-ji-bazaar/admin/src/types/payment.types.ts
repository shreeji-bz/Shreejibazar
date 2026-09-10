export type PaymentType = 'deposit' | 'withdrawal';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'completed';

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
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
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
