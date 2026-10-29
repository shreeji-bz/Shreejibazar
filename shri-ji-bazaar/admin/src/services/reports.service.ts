import { get } from './api';
import type { PaginatedPaymentsResponse, Payment } from '../types/payment.types';

export interface AddFundReportParams {
  method?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface JantriReportRow {
  date: string;
  game: string;
  gameName: string;
  count: number;
}

export const reportsService = {
  async getAddFundReport(params: AddFundReportParams = {}): Promise<PaginatedPaymentsResponse> {
    const query: Record<string, string> = { type: 'deposit' };
    if (params.method && params.method !== 'all') query.methods = params.method;
    if (params.from) query.from = params.from;
    if (params.to) query.to = params.to;
    if (params.page) query.page = String(params.page);
    if (params.limit) query.limit = String(params.limit);
    return get<PaginatedPaymentsResponse>('/v1/admin/payments', query);
  },

  async getJantriReport(from: string, to: string): Promise<JantriReportRow[]> {
    const query: Record<string, string> = {};
    if (from) query.from = from;
    if (to) query.to = to;
    const res = await get<{ success: boolean; data: JantriReportRow[] }>('/v1/admin/results/report', query);
    return res?.data ?? [];
  },

  async getWithdrawals(methods: string, status?: string, page = 1, limit = 100): Promise<PaginatedPaymentsResponse> {
    const query: Record<string, string> = {
      type: 'withdrawal',
      methods,
      page: String(page),
      limit: String(limit),
    };
    if (status && status !== 'all') query.status = status;
    return get<PaginatedPaymentsResponse>('/v1/admin/payments', query);
  },
};

export type { Payment, PaginatedPaymentsResponse };
