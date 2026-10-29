-- ============================================================
-- LIVE SUPABASE SYNC (project: htfrpyaiagwszywoqqbb)
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--
-- Closes the gap between the live database and the backend code:
--   1. wagers: +palti column, 6 play types, nullable wager_type_id
--   2. wager_types: seed all six play types (payout multipliers)
--   3. point_wallets: +total_earned/+total_spent (backend updates them)
--   4. point_transactions: +balance_before, wider reference_type
--   5. rounds: +result_time/+result/+declared_at, open today+tomorrow
--   6. wallet RPCs: deduct_wallet_points / credit_wallet_points
--      (5-arg signatures matching backend wagers.service.ts calls)
--
-- Safe to re-run: every statement is idempotent.
-- ============================================================

-- ----------------------------------------------------------
-- 1. wagers table
-- ----------------------------------------------------------
ALTER TABLE public.wagers ADD COLUMN IF NOT EXISTS palti BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.wagers DROP CONSTRAINT IF EXISTS wagers_play_type_check;
ALTER TABLE public.wagers
  ADD CONSTRAINT wagers_play_type_check
  CHECK (play_type IN ('single', 'jodi', 'panel', 'double', 'crossing', 'palti'));

ALTER TABLE public.wagers ALTER COLUMN wager_type_id DROP NOT NULL;

-- ----------------------------------------------------------
-- 2. wager_types: seed all six play types
-- ----------------------------------------------------------
INSERT INTO public.wager_types (code, name, description, digits_required, payout_multiplier, min_stake, sort_order, is_active)
VALUES
  ('single',   'Single',   'Pick one digit (0-9)',                              1,   9.0, 10, 1, true),
  ('jodi',     'Jodi',     'Pick a pair of digits (00-99)',                     2,  90.0, 10, 2, true),
  ('panel',    'Panel',    'Pick 3 digits in any order',                        3, 150.0, 10, 3, true),
  ('double',   'Double',   'Pick 2 digits, first digit can repeat',             2,  18.0, 10, 4, true),
  ('crossing', 'Crossing', 'Crossing digit entry (digits appear anywhere)',     2,   9.0, 10, 5, true),
  ('palti',    'Palti',    'Copy-paste number with/without palti (reversal)',   2,  90.0, 10, 6, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  payout_multiplier = EXCLUDED.payout_multiplier,
  is_active = true,
  updated_at = now();

-- ----------------------------------------------------------
-- 3. point_wallets: accounting columns the backend reads/writes
-- ----------------------------------------------------------
ALTER TABLE public.point_wallets ADD COLUMN IF NOT EXISTS total_earned INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.point_wallets ADD COLUMN IF NOT EXISTS total_spent  INTEGER NOT NULL DEFAULT 0;

-- ----------------------------------------------------------
-- 4. point_transactions: ledger columns
-- ----------------------------------------------------------
ALTER TABLE public.point_transactions ADD COLUMN IF NOT EXISTS balance_before INTEGER;

-- Widen reference_type so wager/refund/settlement ledger entries fit.
DO $$
DECLARE
  c TEXT;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.point_transactions'::regclass
      AND contype = 'c'
      AND conname LIKE '%reference_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.point_transactions DROP CONSTRAINT %I', c);
  END LOOP;
END $$;

ALTER TABLE public.point_transactions
  ADD CONSTRAINT point_transactions_reference_type_check
  CHECK (reference_type IN (
    'play', 'deposit', 'withdrawal', 'bonus', 'referral', 'admin',
    'wager', 'wager_win', 'wager_refund', 'settlement'
  ));

-- ----------------------------------------------------------
-- 5. rounds: declare-result columns + today/tomorrow open rounds
-- ----------------------------------------------------------
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS result_time TIMESTAMPTZ;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS result TEXT;
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS declared_at TIMESTAMPTZ;

-- Open rounds for today and tomorrow for every active game (same convention
-- as 004_live_supabase_seed: opening_time appended to midnight, UTC).
DO $$
DECLARE
  g RECORD;
  off INTEGER;
BEGIN
  FOR g IN SELECT id, opening_time, result_time FROM public.games WHERE status = 'active' LOOP
    FOR off IN 0..1 LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.rounds
        WHERE game_id = g.id
          AND start_time = ((CURRENT_DATE + off)::timestamp + g.opening_time::time)
      ) THEN
        INSERT INTO public.rounds (game_id, round_number, start_time, end_time, status, result_time)
        VALUES (
          g.id,
          ((EXTRACT(EPOCH FROM ((CURRENT_DATE + off)::timestamp + g.opening_time::time))::bigint % 100000)::text),
          (CURRENT_DATE + off)::timestamp + g.opening_time::time,
          (CURRENT_DATE + off)::timestamp + g.opening_time::time + INTERVAL '30 minutes',
          'open',
          g.result_time
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ----------------------------------------------------------
-- 6. Wallet RPCs (5-arg signatures matching the backend service calls)
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
  WHERE user_id = p_user_id FOR UPDATE;

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
  WHERE user_id = p_user_id
  RETURNING * INTO v_wallet;

  -- Ledger row (best-effort; never fail the bet because of bookkeeping).
  BEGIN
    INSERT INTO public.point_transactions
      (user_id, type, amount, description, reference_id, reference_type, balance_before, balance_after)
    VALUES
      (p_user_id, 'debit', -p_amount, p_description, p_reference_id, p_reference_type,
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
  WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.point_wallets (user_id, balance, total_earned)
    VALUES (p_user_id, p_amount, p_amount)
    RETURNING * INTO v_wallet;
  ELSE
    UPDATE public.point_wallets
    SET balance = COALESCE(balance, 0) + p_amount,
        total_earned = COALESCE(total_earned, 0) + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id
    RETURNING * INTO v_wallet;
  END IF;

  BEGIN
    INSERT INTO public.point_transactions
      (user_id, type, amount, description, reference_id, reference_type, balance_before, balance_after)
    VALUES
      (p_user_id, 'credit', p_amount, p_description, p_reference_id, p_reference_type,
       v_wallet.balance - p_amount, v_wallet.balance);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN v_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.deduct_wallet_points(UUID, INTEGER, TEXT, UUID, TEXT)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.credit_wallet_points(UUID, INTEGER, TEXT, UUID, TEXT)
  TO authenticated, service_role;

-- Done. Re-running the mobile app's register/home/wager flow should now work.
