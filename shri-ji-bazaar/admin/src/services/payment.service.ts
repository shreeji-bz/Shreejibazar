import { get, post } from './api';
import type { Payment, PaginatedPaymentsResponse, PaymentFilters } from '../types/payment.types';

export const paymentService = {
  async getPayments(filters: Partial<PaymentFilters>): Promise<PaginatedPaymentsResponse> {
    const params: Record<string, string> = {};
    if (filters.type && filters.type !== 'all') params.type = filters.type;
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);
    return get<PaginatedPaymentsResponse>('/v1/admin/payments', params);
  },

  async getPaymentById(id: string): Promise<Payment> {
    const res = await get<{ success: boolean; data: Payment }>(`/v1/admin/payments/${id}`);
    if (!res?.success) throw new Error('Payment not found');
    return res.data;
  },

  async approvePayment(id: string, adminNote?: string): Promise<Payment> {
    const res = await post<{ success: boolean; data: Payment }>(`/v1/admin/payments/${id}/approve`, { adminNote });
    if (!res?.success) throw new Error('Failed to approve payment');
    return res.data;
  },

  async rejectPayment(id: string, adminNote?: string): Promise<Payment> {
    const res = await post<{ success: boolean; data: Payment }>(`/v1/admin/payments/${id}/reject`, { adminNote });
    if (!res?.success) throw new Error('Failed to reject payment');
    return res.data;
  },
};
