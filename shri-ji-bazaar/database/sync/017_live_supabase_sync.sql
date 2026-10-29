-- ============================================================
-- 017 — ONE PASTE: fix the live Supabase DB so the betting flow works
-- Project: htfrpyaiagwszywoqqbb
-- Run: Supabase Dashboard -> SQL Editor -> New query -> paste ALL -> Run
--
-- Supersedes 016 (which fails with 42P01 "relation public.wagers does not
-- exist" because it ALTERs a table that does not exist on this project).
--
-- Verified against the live DB on 2026-10-30:
--   * public.wagers EXISTS, but its columns are the OLD ones:
--       id, user_id, game_id, round_id, wager_type_id, play_type, selection,
--       points_staked, potential_payout, status, result_status, result_text,
--       points_won, points_refunded, idempotency_key, placed_at, settled_at,
--       created_at, updated_at
--     -> NO palti column (the backend writes it on every bet -> insert fails)
--     -> wager_type_id is NOT NULL, but the backend sends '' for "no type"
--     -> play_type CHECK only allows single/jodi/panel/double (no crossing/palti)
--   * public.wager_types EXISTS with a DIFFERENT shape than the old seed:
--       id, game_id, name, slug, description, payout_multiplier,
--       min_points, max_points, status, created_at, updated_at
--     -> it has NO code/play_type/is_palti_capable columns, so 016's seed
--        INSERT cannot run. Bets look up wager_types by slug, so we seed
--        per-game rows instead.
--   * MISSING tables the backend needs: settlements, settlement_items
--   * MISSING columns: point_wallets.total_earned/total_spent,
--     point_transactions.balance_after, payments.txn_id/utr_number/
--     screenshot_url/bank_*/rejection_reason/approved_by/processed_at
--   * MISSING functions: deduct_wallet_points, credit_wallet_points
--     -> every bet currently fails with "Insufficient points balance",
--        because the RPC errors out on a missing function.
--
-- Idempotent + additive. No data loss, no row deletes.
-- Run it as a single statement batch (the dashboard runs the whole paste).
-- ============================================================

-- ----------------------------------------------------------
-- 0. Guard: every section below is skipped if its object is absent,
--    so a partial/legacy live DB cannot abort the whole script.
-- ----------------------------------------------------------

-- ----------------------------------------------------------
-- 1. wagers + wager_types: create them when absent, then normalise.
--    (Some live projects predate the 012/013 schemas — wagers may be
--     missing outright, which is exactly what 42P01 reported.)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wager_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID,
  code TEXT,
  name TEXT,
  slug TEXT,
  description TEXT,
  payout_multiplier DECIMAL(5,2) NOT NULL DEFAULT 9.0,
  min_stake INTEGER NOT NULL DEFAULT 10,
  max_stake INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.wagers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  wager_type_id UUID,
  play_type TEXT NOT NULL CHECK (play_type IN ('single', 'jodi', 'panel', 'double', 'crossing', 'palti')),
  selection TEXT NOT NULL,
  points_staked INTEGER NOT NULL CHECK (points_staked > 0),
  potential_payout INTEGER NOT NULL CHECK (potential_payout > 0),
  palti BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'won', 'lost', 'void', 'cancelled')),
  result_status TEXT NOT NULL DEFAULT 'pending' CHECK (result_status IN ('pending', 'won', 'lost', 'void')),
  result_text TEXT,
  points_won INTEGER NOT NULL DEFAULT 0,
  points_refunded INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT UNIQUE,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wagers_user_id ON public.wagers(user_id);
CREATE INDEX IF NOT EXISTS idx_wagers_game_id ON public.wagers(game_id);
CREATE INDEX IF NOT EXISTS idx_wagers_round_id ON public.wagers(round_id);
CREATE INDEX IF NOT EXISTS idx_wagers_status ON public.wagers(status);

-- Normalise whatever shape the table ended up in:
DO $$
DECLARE r RECORD;
BEGIN
  -- missing columns (e.g. palti on a pre-013 table)
  IF to_regclass('public.wagers') IS NOT NULL THEN
    ALTER TABLE public.wagers ADD COLUMN IF NOT EXISTS palti BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE public.wagers ALTER COLUMN wager_type_id DROP NOT NULL;
    -- widen play_type to the six current play types
    FOR r IN SELECT c.oid, c.conname
             FROM pg_constraint c
             JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
             WHERE c.conrelid = 'public.wagers'::regclass
               AND a.attname = 'play_type'
               AND c.contype = 'c'
    LOOP
      EXECUTE 'ALTER TABLE public.wagers DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE c.conrelid = 'public.wagers'::regclass
        AND a.attname = 'play_type' AND c.contype = 'c'
    ) THEN
      ALTER TABLE public.wagers
        ADD CONSTRAINT wagers_play_type_check
        CHECK (play_type IN ('single', 'jodi', 'panel', 'double', 'crossing', 'palti'));
    END IF;
  END IF;
END $$;

-- ----------------------------------------------------------
-- 2. point_wallets: earned/spent bookkeeping
-- ----------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.point_wallets') IS NOT NULL THEN
    ALTER TABLE public.point_wallets ADD COLUMN IF NOT EXISTS total_earned INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE public.point_wallets ADD COLUMN IF NOT EXISTS total_spent  INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ----------------------------------------------------------
-- 3. point_transactions: ledger bookkeeping columns + widen type/reference_type
--    Live reality (verified): type CHECK allows only credit|debit, but the
--    backend writes 'refund' (payments.repository.ts), 'referral'
--    (referrals.service.ts) and 'deposit'/'withdrawal' (payments.service.ts)
--    -> those inserts currently FAIL with 23514.
--    reference_type CHECK on live allows only 'play'; the backend writes
--    'wager', 'point_transaction', 'referral', ... -> also widened.
-- ----------------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  IF to_regclass('public.point_transactions') IS NOT NULL THEN
    ALTER TABLE public.point_transactions ADD COLUMN IF NOT EXISTS balance_before INTEGER;
    ALTER TABLE public.point_transactions ADD COLUMN IF NOT EXISTS balance_after  INTEGER;
    ALTER TABLE public.point_transactions ALTER COLUMN reference_type TYPE TEXT;
    -- Drop every CHECK on type and reference_type (names differ per install).
    FOR r IN SELECT c.oid, c.conname
             FROM pg_constraint c
             JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
             WHERE c.conrelid = 'public.point_transactions'::regclass
               AND a.attname IN ('type', 'reference_type')
               AND c.contype = 'c'
    LOOP
      EXECUTE 'ALTER TABLE public.point_transactions DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
  END IF;
END $$;

-- ----------------------------------------------------------
-- 4. payments: the columns the backend writes
-- ----------------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  IF to_regclass('public.payments') IS NOT NULL THEN
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS txn_id              TEXT;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS utr_number          TEXT;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS screenshot_url      TEXT;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS bank_name           TEXT;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS account_number      TEXT;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS ifsc_code           TEXT;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS account_holder_name TEXT;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS rejection_reason    TEXT;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS approved_by         UUID;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS processed_at        TIMESTAMPTZ;
    ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS result_status       TEXT;
    -- txn_id must be unique for the idempotency guard; add it separately so a
    -- pre-existing duplicate cannot fail the whole batch.
    BEGIN
      ALTER TABLE public.payments ADD CONSTRAINT payments_txn_id_key UNIQUE (txn_id);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'payments.txn_id unique index skipped: %', SQLERRM;
    END;
    -- allow 'qr' on method (QR-code UPI withdrawals)
    FOR r IN SELECT c.oid, c.conname
             FROM pg_constraint c
             JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
             WHERE c.conrelid = 'public.payments'::regclass
               AND a.attname = 'method'
               AND c.contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE public.payments DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_method_check
      CHECK (method IN ('upi', 'bank_transfer', 'paytm', 'phonepe', 'cash', 'points', 'admin', 'imps', 'qr'));
  END IF;
END $$;

-- ----------------------------------------------------------
-- 5. settlements + settlement_items (backend settles every round)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  result TEXT NOT NULL,
  total_wagers INTEGER NOT NULL DEFAULT 0,
  total_staked INTEGER NOT NULL DEFAULT 0,
  total_payout INTEGER NOT NULL DEFAULT 0,
  total_refund INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  processed_by UUID,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (round_id)
);
CREATE INDEX IF NOT EXISTS idx_settlements_round ON public.settlements(round_id);
CREATE INDEX IF NOT EXISTS idx_settlements_game ON public.settlements(game_id);

CREATE TABLE IF NOT EXISTS public.settlement_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID NOT NULL REFERENCES public.settlements(id) ON DELETE CASCADE,
  wager_id UUID NOT NULL REFERENCES public.wagers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points_staked INTEGER NOT NULL,
  points_won INTEGER NOT NULL,
  points_refunded INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_settlement_items_settlement ON public.settlement_items(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_wager ON public.settlement_items(wager_id);

-- ----------------------------------------------------------
-- 6. wager_types: seed the six play types, adapted to the table's shape.
--    Two shapes exist in the wild:
--      (a) live-style: game_id NOT NULL, name/slug/payout_multiplier/min_points/
--          max_points/status   -> one row per (game, play type)
--      (b) canonical 012: code/name/digits_required/payout_multiplier/
--          min_stake/max_stake/is_active/sort_order, no game_id
--    The seed detects which columns exist and writes what fits, so it works
--    on either shape and never aborts the batch.
-- ----------------------------------------------------------
DO $$
DECLARE
  g RECORD;
  t RECORD;
  v_count INTEGER;
  v_exists BOOLEAN;
  v_has_game_id BOOLEAN;
  v_has_slug BOOLEAN;
  v_has_code BOOLEAN;
  v_has_status BOOLEAN;
  v_has_min_points BOOLEAN;
  v_has_min_stake BOOLEAN;
BEGIN
  IF to_regclass('public.wager_types') IS NULL THEN
    RAISE NOTICE 'wager_types missing — skipping seed';
    RETURN;
  END IF;

  SELECT
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wager_types' AND column_name='game_id'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wager_types' AND column_name='slug'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wager_types' AND column_name='code'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wager_types' AND column_name='status'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wager_types' AND column_name='min_points'),
    EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='wager_types' AND column_name='min_stake')
  INTO v_has_game_id, v_has_slug, v_has_code, v_has_status, v_has_min_points, v_has_min_stake;

  FOR t IN
    SELECT * FROM (VALUES
      -- multipliers mirror PLAY_TYPE_MULTIPLIERS in
      -- backend/src/modules/wagers/services/wager-settlement.ts
      ('single',   'Single',   'Pick one of 0-9',                                   9,  10, 5000, 1),
      ('jodi',     'Jodi',     'Pick a two-digit number 00-99',                    90, 10, 5000, 2),
      ('panel',    'Panel',    'Pick a 3-digit panel 000-999',                    150, 10, 5000, 3),
      ('double',   'Double',   'Pick a two-digit double 00-99',                    18, 10, 5000, 4),
      ('crossing', 'Crossing', 'Pick 0-9 with crossing options (4-6 / 5-7 etc.)',  9, 10, 5000, 5),
      ('palti',    'Palti',    'Copy-paste number with/without palti (reversal)', 90, 10, 5000, 6)
    ) AS v(slug, name, description, payout_multiplier, min_points, max_points, sort_order)
  LOOP
    FOR g IN SELECT id, name FROM public.games WHERE COALESCE(status,'active') = 'active' LOOP
      -- Does this (game, play type) already exist? Dynamic SQL because the
      -- slug/code columns differ between table shapes and Postgres resolves
      -- column references at parse time, before any CASE can skip them.
      v_exists := false;
      IF v_has_game_id THEN
        IF v_has_slug AND v_has_code THEN
          EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.wager_types wt WHERE wt.game_id = $1 AND (wt.slug = $2 OR wt.code = $2))'
            INTO v_exists USING g.id, t.slug;
        ELSIF v_has_slug THEN
          EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.wager_types wt WHERE wt.game_id = $1 AND wt.slug = $2)'
            INTO v_exists USING g.id, t.slug;
        ELSIF v_has_code THEN
          EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.wager_types wt WHERE wt.game_id = $1 AND wt.code = $2)'
            INTO v_exists USING g.id, t.slug;
        END IF;
      ELSE
        -- global (non game-scoped) table
        IF v_has_slug AND v_has_code THEN
          EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.wager_types wt WHERE wt.slug = $1 OR wt.code = $1)'
            INTO v_exists USING t.slug;
        ELSIF v_has_slug THEN
          EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.wager_types wt WHERE wt.slug = $1)'
            INTO v_exists USING t.slug;
        ELSIF v_has_code THEN
          EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.wager_types wt WHERE wt.code = $1)'
            INTO v_exists USING t.slug;
        END IF;
      END IF;

      IF NOT v_exists THEN
        BEGIN
          IF v_has_game_id AND v_has_slug AND v_has_status AND v_has_min_points THEN
            INSERT INTO public.wager_types
              (game_id, name, slug, description, payout_multiplier, min_points, max_points, status)
            VALUES
              (g.id, t.name, t.slug, t.description, t.payout_multiplier, t.min_points, t.max_points, 'active');
          ELSIF v_has_game_id AND v_has_code AND v_has_min_stake THEN
            INSERT INTO public.wager_types
              (game_id, name, code, description, payout_multiplier, min_stake, max_stake, is_active, sort_order)
            VALUES
              (g.id, t.name, t.slug, t.description, t.payout_multiplier, t.min_points, t.max_points, true, t.sort_order);
          ELSIF v_has_code AND v_has_min_stake THEN
            INSERT INTO public.wager_types
              (name, code, description, digits_required, payout_multiplier, min_stake, max_stake, is_active, sort_order)
            VALUES
              (t.name, t.slug, t.description, 1, t.payout_multiplier, t.min_points, t.max_points, true, t.sort_order);
          ELSIF v_has_slug THEN
            INSERT INTO public.wager_types
              (name, slug, description, payout_multiplier, min_points, max_points)
            VALUES
              (t.name, t.slug, t.description, t.payout_multiplier, t.min_points, t.max_points);
          END IF;
        EXCEPTION WHEN others THEN
          RAISE NOTICE 'wager_types insert skipped for %/%: %', g.name, t.slug, SQLERRM;
        END;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ----------------------------------------------------------
-- 7. wallet RPCs: deduct / credit.
--    Every bet calls deduct_wallet_points; without it the RPC errors and the
--    backend reports "Insufficient points balance" for everyone.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.deduct_wallet_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS public.point_wallets AS $$
DECLARE
  v_wallet public.point_wallets;
BEGIN
  SELECT * INTO v_wallet FROM public.point_wallets
  WHERE user_id = p_user_id ORDER BY created_at LIMIT 1 FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.point_wallets (user_id) VALUES (p_user_id) RETURNING * INTO v_wallet;
  END IF;

  IF COALESCE(v_wallet.balance, 0) < p_amount THEN
    RAISE EXCEPTION 'Insufficient points. Balance: %, Required: %',
      COALESCE(v_wallet.balance, 0), p_amount
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.point_wallets
  SET balance = COALESCE(balance, 0) - p_amount,
      total_spent = COALESCE(total_spent, 0) + p_amount,
      updated_at = now()
  WHERE id = v_wallet.id
  RETURNING * INTO v_wallet;

  BEGIN
    INSERT INTO public.point_transactions
      (user_id, type, amount, description, reference_id, reference_type, balance_before, balance_after)
    VALUES
      (p_user_id, 'debit', -p_amount, COALESCE(p_description, 'Wallet debit'), p_reference_id, p_reference_type,
       v_wallet.balance + p_amount, v_wallet.balance);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN v_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.credit_wallet_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL
)
RETURNS public.point_wallets AS $$
DECLARE
  v_wallet public.point_wallets;
BEGIN
  SELECT * INTO v_wallet FROM public.point_wallets
  WHERE user_id = p_user_id ORDER BY created_at LIMIT 1 FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.point_wallets (user_id, balance, total_earned)
    VALUES (p_user_id, p_amount, p_amount)
    RETURNING * INTO v_wallet;
  ELSE
    UPDATE public.point_wallets
    SET balance = COALESCE(balance, 0) + p_amount,
        total_earned = COALESCE(total_earned, 0) + p_amount,
        updated_at = now()
    WHERE id = v_wallet.id
    RETURNING * INTO v_wallet;
  END IF;

  BEGIN
    INSERT INTO public.point_transactions
      (user_id, type, amount, description, reference_id, reference_type, balance_before, balance_after)
    VALUES
      (p_user_id, 'credit', p_amount, COALESCE(p_description, 'Wallet credit'), p_reference_id, p_reference_type,
       v_wallet.balance - p_amount, v_wallet.balance);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN v_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
DECLARE v_who TEXT;
BEGIN
  -- The roles exist on Supabase; guard so the script never aborts elsewhere.
  FOREACH v_who IN ARRAY ARRAY['authenticated','service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = v_who) THEN
      IF to_regprocedure('public.deduct_wallet_points(uuid,integer,text,uuid,text)') IS NOT NULL THEN
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.deduct_wallet_points(UUID, INTEGER, TEXT, UUID, TEXT) TO ' || v_who;
      END IF;
      IF to_regprocedure('public.credit_wallet_points(uuid,integer,text,uuid,text)') IS NOT NULL THEN
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.credit_wallet_points(UUID, INTEGER, TEXT, UUID, TEXT) TO ' || v_who;
      END IF;
    END IF;
  END LOOP;
END $$;

-- ----------------------------------------------------------
-- 8. RLS + grants on the new tables (match the rest of the live DB)
-- ----------------------------------------------------------
DO $$
DECLARE v_who TEXT;
BEGIN
  IF to_regclass('public.settlements') IS NOT NULL THEN
    ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.settlement_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS settlements_user_read ON public.settlements;
    CREATE POLICY settlements_user_read ON public.settlements
      FOR SELECT TO authenticated USING (true);
    DROP POLICY IF EXISTS settlement_items_user_read ON public.settlement_items;
    CREATE POLICY settlement_items_user_read ON public.settlement_items
      FOR SELECT TO authenticated USING (true);
  END IF;

  FOREACH v_who IN ARRAY ARRAY['authenticated','service_role'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = v_who) THEN
      IF to_regclass('public.settlements') IS NOT NULL THEN
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.settlements TO ' || v_who;
      END IF;
      IF to_regclass('public.settlement_items') IS NOT NULL THEN
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.settlement_items TO ' || v_who;
      END IF;
    END IF;
  END LOOP;
END $$;

-- Done. Verify afterwards:
--   * place a bet on mobile — it should deduct points and create a wager row
--   * admin declares a result — the round settles, winners get credited
--   * mobile Add Money (UPI/scanner) credits the wallet
--   * admin Revert on a completed deposit cuts it back
