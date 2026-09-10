import api from '../services/api';
import type { Payment, PaginatedPaymentsResponse, PaymentFilters } from '../types/payment.types';

export const paymentService = {
  async getPayments(filters: Partial<PaymentFilters>): Promise<PaginatedPaymentsResponse> {
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    const query = params.toString();
    const url = query ? `/v1/admin/payments?${query}` : '/v1/admin/payments';
    const res = await api.get(url);
    return res.data;
  },

  async getPaymentById(id: string): Promise<Payment> {
    const res = await api.get(`/v1/admin/payments/${id}`);
    return res.data;
  },

  async approvePayment(id: string, adminNote?: string): Promise<Payment> {
    const res = await api.post(`/v1/admin/payments/${id}/approve`, { adminNote });
    return res.data;
  },

  async rejectPayment(id: string, adminNote?: string): Promise<Payment> {
    const res = await api.post(`/v1/admin/payments/${id}/reject`, { adminNote });
    return res.data;
  },
};
