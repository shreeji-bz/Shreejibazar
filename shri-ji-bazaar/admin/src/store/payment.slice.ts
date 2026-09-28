import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get, post } from '../services/api';
import type { Payment, PaymentFilters, PaginatedPaymentsResponse, ProcessPaymentRequest } from '../types/payment.types';

interface PaymentState {
  list: Payment[];
  selected: Payment | null;
  loading: boolean;
  error: string | null;
  filters: PaymentFilters;
  pagination: { total: number; page: number; totalPages: number };
}

const initialState: PaymentState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
  filters: { page: 1, limit: 20 },
  pagination: { total: 0, page: 1, totalPages: 0 },
};

export const fetchPayments = createAsyncThunk<
  PaginatedPaymentsResponse,
  PaymentFilters,
  { state: { payment: PaymentState } }
>('payment/fetchPayments', async (filters) => {
  const params: Record<string, string> = {};
  if (filters.type && filters.type !== 'all') params.type = filters.type;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (filters.search) params.search = filters.search;
  params.page = String(filters.page);
  params.limit = String(filters.limit);
  const data = await get<PaginatedPaymentsResponse>('/v1/admin/payments', params);
  return data;
});

export const fetchPaymentById = createAsyncThunk<
  Payment,
  string,
  { state: { payment: PaymentState } }
>('payment/fetchPaymentById', async (id) => {
  const data = await get<Payment>(`/v1/admin/payments/${id}`);
  return data;
});

export const approvePayment = createAsyncThunk<
  Payment,
  { id: string; adminNote?: string },
  { state: { payment: PaymentState } }
>('payment/approvePayment', async ({ id, adminNote }) => {
  const data = await post<Payment>(`/v1/admin/payments/${id}/approve`, { adminNote } as ProcessPaymentRequest);
  return data;
});

export const rejectPayment = createAsyncThunk<
  Payment,
  { id: string; adminNote?: string },
  { state: { payment: PaymentState } }
>('payment/rejectPayment', async ({ id, adminNote }) => {
  const data = await post<Payment>(`/v1/admin/payments/${id}/reject`, { adminNote } as ProcessPaymentRequest);
  return data;
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<PaymentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelected: (state) => { state.selected = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          totalPages: Math.max(1, Math.ceil((action.payload.total || 0) / (action.payload.limit || 1))),
        };
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payments';
      })
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment details';
      })
      .addCase(approvePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
        state.list = state.list.map((p) =>
          p.id === action.payload.id ? action.payload : p
        );
      })
      .addCase(approvePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to approve payment';
      })
      .addCase(rejectPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
        state.list = state.list.map((p) =>
          p.id === action.payload.id ? action.payload : p
        );
      })
      .addCase(rejectPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reject payment';
      });
  },
});

export const { setFilters, clearSelected, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;
