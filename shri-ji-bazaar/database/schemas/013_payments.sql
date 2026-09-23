-- =====================================================
-- PAYMENTS MODULE
-- Users can deposit money via UPI/IMPS and request withdrawals.
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. PAYMENTS TABLE
-- =====================================================
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,

  -- Payment identification
  txn_id text unique not null,
  provider text not null default 'manual', -- manual | razorpay | paytm | phonepe
  method text not null default 'upi', -- upi | imps | card | netbanking

  -- Amounts in paise (integer) to avoid float issues
  amount integer not null check (amount > 0),

  -- Type of transaction
  type text not null check (type in ('deposit', 'withdrawal', 'refund')),

  -- Status tracking
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'completed', 'rejected', 'failed')
  ),

  -- Deposit details
  utr_number text, -- UPI transaction reference number
  screenshot_url text, -- URL to payment screenshot in Supabase Storage

  -- Withdrawal details
  bank_name text,
  account_number text,
  ifsc_code text,
  account_holder_name text,

  -- Metadata
  rejection_reason text,
  admin_notes text,
  approved_by uuid references public.users(id),
  processed_at timestamp with time zone,

  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_txn_id on public.payments(txn_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_type on public.payments(type);
create index if not exists idx_payments_created_at on public.payments(created_at desc);

-- Trigger for updated_at
create trigger payments_updated_at
  before update on public.payments
  for each row
  execute function public.handle_updated_at();

-- =====================================================
-- 2. USER PAYMENT SETTINGS
-- Stores saved payment methods per user
-- =====================================================
create table if not exists public.user_payment_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,

  -- Saved UPI details
  upi_id text,
  upi_verified boolean default false,

  -- Saved bank details (encrypted in production)
  bank_name text,
  account_number text,
  ifsc_code text,
  account_holder_name text,
  bank_verified boolean default false,

  -- Default payment method
  default_method text check (default_method in ('upi', 'bank')),

  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint user_payment_settings_user_id_key unique (user_id)
);

create index if not exists idx_user_payment_settings_user_id on public.user_payment_settings(user_id);

create trigger user_payment_settings_updated_at
  before update on public.user_payment_settings
  for each row
  execute function public.handle_updated_at();

-- =====================================================
-- 3. PAYMENT NOTIFICATIONS (optional audit log)
-- =====================================================
create table if not exists public.payment_notifications (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references public.payments(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  type text not null check (type in ('deposit_request', 'withdrawal_request', 'deposit_approved', 'withdrawal_approved', 'deposit_rejected', 'withdrawal_rejected')),
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_payment_notifications_user_id on public.payment_notifications(user_id);
create index if not exists idx_payment_notifications_payment_id on public.payment_notifications(payment_id);
create index if not exists idx_payment_notifications_created_at on public.payment_notifications(created_at desc);
