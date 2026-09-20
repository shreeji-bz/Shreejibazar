import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get, post } from '../services/api';
import type { Wager, WagerFilters, PaginatedWagersResponse, WagerDetail, VoidWagerRequest } from '../types/wager.types';

interface WagerState {
  list: Wager[];
  selected: WagerDetail | null;
  loading: boolean;
  error: string | null;
  filters: WagerFilters;
  pagination: { total: number; page: number; totalPages: number };
}

const initialState: WagerState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  filters: { page: 1, limit: 20 },
  pagination: { total: 0, page: 1, totalPages: 0 },
};

export const fetchWagers = createAsyncThunk<
  PaginatedWagersResponse,
  WagerFilters,
  { state: { wager: WagerState } }
>('wager/fetchWagers', async (filters) => {
  const params: Record<string, string> = {};
  if (filters.gameId) params.gameId = filters.gameId;
  if (filters.status) params.status = filters.status;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.search) params.search = filters.search;
  params.page = String(filters.page);
  params.limit = String(filters.limit);
  const data = await get<PaginatedWagersResponse>('/v1/admin/wagers', params);
  return data;
});

export const fetchWagerById = createAsyncThunk<
  WagerDetail,
  string,
  { state: { wager: WagerState } }
>('wager/fetchWagerById', async (id) => {
  const data = await get<WagerDetail>(`/v1/admin/wagers/${id}`);
  return data;
});

export const voidWager = createAsyncThunk<
  WagerDetail,
  { id: string; reason: string },
  { state: { wager: WagerState } }
>('wager/voidWager', async ({ id, reason }) => {
  const data = await post<WagerDetail>(`/v1/admin/wagers/${id}/void`, { reason } as VoidWagerRequest);
  return data;
});

const wagerSlice = createSlice({
  name: 'wager',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<WagerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelected: (state) => { state.selected = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWagers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWagers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchWagers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch wagers';
      })
      .addCase(fetchWagerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWagerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchWagerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch wager details';
      })
      .addCase(voidWager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(voidWager.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
        state.list = state.list.map((w) =>
          w.id === action.payload.id ? { ...w, status: 'void' as const } : w
        );
      })
      .addCase(voidWager.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to void wager';
      });
  },
});

export const { setFilters, clearSelected, clearError } = wagerSlice.actions;
export default wagerSlice.reducer;
