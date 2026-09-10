import api from '../services/api';
import type { Wager, PaginatedWagersResponse, WagerFilters, WagerDetail, VoidWagerRequest } from '../types/wager.types';

export const wagerService = {
  async getWagers(filters: Partial<WagerFilters>): Promise<PaginatedWagersResponse> {
    const params = new URLSearchParams();
    if (filters.gameId) params.set('gameId', filters.gameId);
    if (filters.status) params.set('status', filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    const query = params.toString();
    const url = query ? `/v1/admin/wagers?${query}` : '/v1/admin/wagers';
    const res = await api.get(url);
    return res.data;
  },

  async getWagerById(id: string): Promise<WagerDetail> {
    const res = await api.get(`/v1/admin/wagers/${id}`);
    return res.data;
  },

  async voidWager(id: string, reason: string): Promise<WagerDetail> {
    const res = await api.post(`/v1/admin/wagers/${id}/void`, { reason });
    return res.data;
  },
};
