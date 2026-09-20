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
    const res = await get<Payment>(`/v1/admin/payments/${id}`);
    return res;
  },

  async approvePayment(id: string, adminNote?: string): Promise<Payment> {
    const res = await post<Payment>(`/v1/admin/payments/${id}/approve`, { adminNote });
    return res;
  },

  async rejectPayment(id: string, adminNote?: string): Promise<Payment> {
    const res = await post<Payment>(`/v1/admin/payments/${id}/reject`, { adminNote });
    return res;
  },
};
