import { get, post } from './api';
import type { PaginatedWagersResponse, WagerFilters, WagerDetail } from '../types/wager.types';

export const wagerService = {
  async getWagers(filters: Partial<WagerFilters>): Promise<PaginatedWagersResponse> {
    const params: Record<string, string> = {};
    if (filters.gameId) params.gameId = filters.gameId;
    if (filters.status) params.status = filters.status;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);
    const res = await get<PaginatedWagersResponse>('/v1/admin/wagers', params);
    return res;
  },

  async getWagerById(id: string): Promise<WagerDetail> {
    const res = await get<WagerDetail>(`/v1/admin/wagers/${id}`);
    return res;
  },

  async voidWager(id: string, reason: string): Promise<WagerDetail> {
    const res = await post<WagerDetail>(`/v1/admin/wagers/${id}/void`, { reason });
    return res;
  },
};
