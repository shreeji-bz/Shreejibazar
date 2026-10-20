-- ============================================================
-- Shri Ji Bazaar — full schema + seeds for the self-hosted Supabase
-- (Dokploy: 201.18.210.107, Kong API on http://<sslip>/)
--
-- Apply ONCE via Studio SQL Editor (Dashboard -> SQL Editor -> New query).
-- Idempotent: IF NOT EXISTS / ON CONFLICT / DO blocks tolerate re-runs.
--
-- Column names verified against the backend repositories
-- (src/modules/*/repositories/*.ts) — DO NOT rename.
-- ============================================================

create extension if not exists "uuid-ossp";

-- Trigger helper (required by several updated_at triggers)
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- USERS / ADMINS / REFRESH TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  avatar TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  password_hash TEXT NOT NULL DEFAULT '',
  password_reset_code TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin',
  status TEXT NOT NULL DEFAULT 'active',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ============================================================
-- GAMES / ROUNDS / RESULTS
-- ============================================================

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  opening_time TEXT NOT NULL,
  closing_time TEXT NOT NULL,
  result_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  result_time TIMESTAMPTZ,
  result TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'closed', 'result_declared', 'settled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rounds_game ON rounds(game_id);
CREATE INDEX IF NOT EXISTS idx_rounds_status ON rounds(status);
CREATE INDEX IF NOT EXISTS idx_rounds_start ON rounds(start_time);

CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  result TEXT NOT NULL,
  declared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_results_round ON results(round_id);
CREATE INDEX IF NOT EXISTS idx_results_game ON results(game_id);

-- ============================================================
-- POINTS
-- ============================================================

CREATE TABLE IF NOT EXISTS point_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  reference_id TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id),
  round_id UUID REFERENCES rounds(id),
  selection TEXT,
  points_staked INTEGER NOT NULL DEFAULT 0,
  points_won INTEGER NOT NULL DEFAULT 0,
  outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending', 'won', 'lost', 'void')),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);

-- ============================================================
-- BONUSES
-- ============================================================

CREATE TABLE IF NOT EXISTS bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  bonus_type TEXT NOT NULL DEFAULT 'welcome',
  points_amount INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bonus_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bonus_id UUID NOT NULL REFERENCES bonuses(id) ON DELETE CASCADE,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, bonus_id)
);

-- ============================================================
-- REFERRALS / NOTIFICATIONS / BANNERS
-- ============================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  reward_points INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'info',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUPPORT
-- ============================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID,
  body TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID,
  user_id UUID,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SETTINGS (key-value; system/status reads maintenance_mode,
-- maintenance_message, latest_version, force_update here)
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'string',
  description TEXT,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WAGERING
-- ============================================================

CREATE TABLE IF NOT EXISTS wager_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  digits_required INTEGER NOT NULL,
  payout_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  min_stake INTEGER NOT NULL DEFAULT 10,
  max_stake INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wagers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  wager_type_id UUID NOT NULL REFERENCES wager_types(id),
  play_type TEXT NOT NULL CHECK (play_type IN ('single', 'jodi', 'panel', 'double')),
  selection TEXT NOT NULL,
  points_staked INTEGER NOT NULL CHECK (points_staked > 0),
  potential_payout INTEGER NOT NULL CHECK (potential_payout > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'won', 'lost', 'void', 'cancelled')),
  result_status TEXT NOT NULL DEFAULT 'pending' CHECK (result_status IN ('pending', 'won', 'lost', 'void')),
  result_text TEXT,
  points_won INTEGER NOT NULL DEFAULT 0,
  points_refunded INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT UNIQUE,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_wagers_user ON wagers(user_id);
CREATE INDEX IF NOT EXISTS idx_wagers_round ON wagers(round_id);
CREATE INDEX IF NOT EXISTS idx_wagers_game ON wagers(game_id);

-- ============================================================
-- SETTLEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  result TEXT NOT NULL,
  total_wagers INTEGER NOT NULL DEFAULT 0,
  total_staked INTEGER NOT NULL DEFAULT 0,
  total_payout INTEGER NOT NULL DEFAULT 0,
  total_refund INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (round_id)
);

CREATE TABLE IF NOT EXISTS settlement_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
  wager_id UUID NOT NULL REFERENCES wagers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_staked INTEGER NOT NULL,
  points_won INTEGER NOT NULL,
  points_refunded INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_settlement_items_settlement ON settlement_items(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_wager ON settlement_items(wager_id);

-- ============================================================
-- PAYMENTS (superset: base + 012 + 013 columns; backend writes
-- all of these in payments.repository.ts)
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  processed_by UUID,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bonus', 'referral', 'admin_credit', 'admin_debit', 'refund', 'settlement')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT CHECK (method IN ('upi', 'bank_transfer', 'paytm', 'phonepe', 'cash', 'points', 'admin', 'imps')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'completed', 'failed', 'cancelled')),
  reference_id TEXT,
  reference_type TEXT,
  notes TEXT,
  admin_notes TEXT,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  txn_id TEXT UNIQUE,
  provider TEXT NOT NULL DEFAULT 'manual',
  utr_number TEXT,
  screenshot_url TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  account_holder_name TEXT,
  rejection_reason TEXT,
  approved_by UUID,
  processed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS user_payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  account_holder_name TEXT,
  default_method TEXT CHECK (default_method IN ('upi', 'bank')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit_request', 'withdrawal_request', 'deposit_approved', 'withdrawal_approved', 'deposit_rejected', 'withdrawal_rejected')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RLS: hard-lock the data layer.
-- The app's anon/publishable keys MUST NOT read or write any
-- business table — all access is server-side via the service-role
-- key, which bypasses RLS. Enabling RLS with zero policies
-- gives exactly that.
-- ============================================================

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY array[
    'users','admins','refresh_tokens','games','rounds','results',
    'point_wallets','point_transactions','activities','bonuses',
    'bonus_claims','referrals','notifications','banners','support_tickets',
    'support_messages','audit_logs','settings','wager_types','wagers',
    'settlements','settlement_items','payments','user_payment_settings',
    'payment_notifications'
  ]
  LOOP
    EXECUTE format('alter table public.%I enable row level security', t);
  END LOOP;
END $$;

-- ============================================================
-- SEED: games
-- ============================================================

INSERT INTO public.games (id, name, slug, display_name, description, image, opening_time, closing_time, result_time, status, is_popular, sort_order, active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Delhi Bazar', 'delhi-bazar', 'Delhi Bazar', 'Popular Delhi Bazar game with daily results', 'delhi-bazar.png', '15:00:00', '15:30:00', '15:30:00', 'active', true, 1, true),
  ('b2c3d4e5-f6a7-8901-bcde-fa2345678901', 'Shri Ganesh', 'shri-ganesh', 'Shri Ganesh', 'Shri Ganesh game - blessed results daily', 'shri-ganesh.png', '16:35:00', '17:05:00', '17:05:00', 'active', true, 2, true),
  ('c3d4e5f6-a7b8-9012-cdef-ab3456789012', 'Faridabad', 'faridabad', 'Faridabad', 'Faridabad game results', 'faridabad.png', '17:55:00', '18:25:00', '18:25:00', 'active', true, 3, true),
  ('d4e5f6a7-b8c9-0123-defa-bc4567890123', 'Ghaziyabad', 'ghaziyabad', 'Ghaziyabad', 'Ghaziyabad game results', 'ghaziyabad.png', '21:30:00', '22:00:00', '22:00:00', 'active', true, 4, true),
  ('e5f6a7b8-c9d0-1234-efab-cd5678901234', 'Gali', 'gali', 'Gali', 'Gali game results', 'gali.png', '23:35:00', '00:05:00', '00:05:00', 'active', true, 5, true),
  ('f6a7b8c9-d0e1-2345-fabc-de6789012345', 'Disawar', 'disawar', 'Disawar', 'Disawar game results', 'disawar.png', '16:30:00', '17:00:00', '17:00:00', 'active', true, 6, true),
  ('a7b8c9d0-e1f2-3456-abcd-ef7890123456', 'Kashi Morning', 'kashi-morning', 'Kashi Morning', 'Morning Kashi game results', 'kashi-morning.png', '10:00:00', '10:30:00', '10:30:00', 'active', true, 7, true),
  ('b8c9d0e1-f2a3-4567-bcde-fa8901234567', 'Kashi Day', 'kashi-day', 'Kashi Day', 'Day Kashi game results', 'kashi-day.png', '12:40:00', '13:10:00', '13:10:00', 'active', true, 8, true),
  ('c9d0e1f2-a3b4-5678-cdef-ab9012345678', 'Kashi Night', 'kashi-night', 'Kashi Night', 'Night Kashi game results', 'kashi-night.png', '21:13:00', '21:43:00', '21:43:00', 'active', true, 9, true),
  ('d1e2f3a4-b5c6-7788-99aa-bb0011223344', 'Nepal Day', 'nepal-day', 'Nepal Day', 'Nepal Day game results', 'nepal-day.png', '07:00:00', '01:05:00', '01:05:00', 'active', true, 10, true),
  ('d1e2f3a4-b5c6-7788-99aa-bb0011223345', 'Nepal Night', 'nepal-night', 'Nepal Night', 'Nepal Night game results', 'nepal-night.png', '07:00:00', '09:05:00', '09:05:00', 'active', true, 11, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: wager types
-- ============================================================

INSERT INTO public.wager_types (code, name, description, digits_required, payout_multiplier, min_stake, sort_order) VALUES
  ('single', 'Single', 'Pick one digit (0-9)', 1, 9.0, 10, 1),
  ('jodi', 'Jodi', 'Pick a pair of digits (00-99)', 2, 90.0, 10, 2),
  ('panel', 'Panel', 'Pick 3 digits in any order', 3, 150.0, 10, 3),
  ('double', 'Double', 'Pick 2 digits, first digit can repeat', 2, 18.0, 10, 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  payout_multiplier = EXCLUDED.payout_multiplier,
  min_stake = EXCLUDED.min_stake,
  sort_order = EXCLUDED.sort_order;

-- ============================================================
-- SEED: demo rounds (today + next 29 days, one per game per day)
-- ============================================================

DO $$
DECLARE
  g RECORD;
  off INTEGER;
  d DATE := CURRENT_DATE;
BEGIN
  FOR g IN SELECT id, opening_time, result_time FROM public.games WHERE active = true LOOP
    FOR off IN 0..29 LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.rounds
        WHERE game_id = g.id
          AND start_time = ((d + off)::timestamp + g.opening_time::time)
      ) THEN
        INSERT INTO public.rounds (game_id, round_number, start_time, end_time, result_time, status)
        VALUES (
          g.id,
          ((EXTRACT(EPOCH FROM ((d + off)::timestamp + g.opening_time::time))::bigint % 100000)::text),
          (d + off)::timestamp + g.opening_time::time,
          (d + off)::timestamp + g.opening_time::time + INTERVAL '30 minutes',
          (d + off)::timestamp + g.result_time::time,
          'pending'
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- SEED: welcome bonus
-- ============================================================

INSERT INTO public.bonuses (name, description, bonus_type, points_amount, is_active, valid_until)
VALUES ('Welcome Bonus', 'Welcome bonus for new users', 'welcome', 100, true, now() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: default settings
-- ============================================================

INSERT INTO public.settings (key, value, type) VALUES
  ('app_name', 'Shri Ji Bazaar', 'string'),
  ('app_version', '1.0.0', 'string'),
  ('latest_version', '1.0.0', 'string'),
  ('min_play_points', '10', 'number'),
  ('referral_bonus_points', '100', 'number'),
  ('signup_bonus_points', '50', 'number'),
  ('maintenance_mode', 'false', 'boolean'),
  ('force_update', 'false', 'boolean'),
  ('allow_registration', 'true', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- SEED: admin + test user (real bcrypt hashes, rounds=10,
-- generated with bcryptjs — verify: admin123 / 12345678)
-- ============================================================

INSERT INTO public.admins (name, email, password_hash, role, status)
VALUES ('Super Admin', 'admin@shrijibazaar.com', '$2b$10$7InkCo2V.bMioE.dF6BjaO2/kh7K.erVNe8oO3F5xcwWqQ8I8ILRu', 'super_admin', 'active')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO public.users (name, mobile, referral_code, password_hash, status)
VALUES ('Test User', '7247242931', 'TESTU1000', '$2b$10$Y0bk/VZoIJfwjoW5LVxy9.qKQRo6OCTco3EUS5pK/7AkoRxPgJRVK', 'active')
ON CONFLICT (mobile) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO public.point_wallets (user_id, balance)
SELECT u.id, 100 FROM public.users u
WHERE u.mobile = '7247242931'
ON CONFLICT (user_id) DO NOTHING;
