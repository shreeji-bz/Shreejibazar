-- =====================================================
-- MIGRATION 014: Add QR and UPI support to payments
-- =====================================================

-- Add qr to method enum
alter table public.payments
  drop constraint if exists payments_method_check;

alter table public.payments
  add constraint payments_method_check
  check (method in ('upi', 'bank_transfer', 'paytm', 'phonepe', 'cash', 'points', 'admin', 'imps', 'qr'));

-- Add UPI and QR fields
alter table public.payments
  add column if not exists upi_id text,
  add column if not exists qr_image_url text;

-- Index for method-based queries
create index if not exists idx_payments_method on public.payments(method);
