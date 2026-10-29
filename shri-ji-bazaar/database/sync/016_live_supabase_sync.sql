-- ============================================================
-- 016 — ONE PASTE: sync the live Supabase DB with the backend code
-- Project: htfrpyaiagwszywoqqbb
-- Run: Supabase Dashboard -> SQL Editor -> New query -> paste ALL -> Run
--
-- Why: the live DB was never updated after several backend features.
-- Until this runs, these flows FAIL on the live DB (verified by probing):
--   * Every BET:  wagers.palti column + deduct/credit_wallet_points RPCs missing
--   * Deposits (scanner/UPI "Add Money"): payments.txn_id/utr_number/
--     screenshot_url/bank_* columns missing -> the insert itself fails
--   * Wallet bookkeeping: point_wallets.total_earned/total_spent missing
--   * QR withdrawals: 'qr' not in the method CHECK constraint
--
-- Idempotent + additive. No data loss, no hard deletes.
-- ============================================================

-- ----------------------------------------------------------
-- 1. wagers: palti column + 6 play types + nullable wager_type_id
--    (from 014, which never ran on live)
-- ----------------------------------------------------------
ALTER TABLE public.wagers ADD COLUMN IF NOT EXISTS palti BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.wagers DROP CONSTRAINT IF EXISTS wagers_play_type_check;
ALTER TABLE public.wagers
  ADD CONSTRAINT wagers_play_type_check
  CHECK (play_type IN ('single', 'jodi', 'panel', 'double', 'crossing', 'palti'));

ALTER TABLE public.wagers ALTER COLUMN wager_type_id DROP NOT NULL;

-- Seed the six play types (payout multipliers) if not present.
DO $$
BEGIN
  IF to_regclass('public.wager_types') IS NOT NULL THEN
    INSERT INTO public.wager_types (code, name, description, play_type, payout_multiplier, min_stake, max_stake, is_palti_capable)
    VALUES
      ('single',   'Single',   'Pick one of 0-9',                                        'single',   9.0, 10, 5000, false),
      ('jodi',     'Jodi',     'Pick a two-digit number 00-99',                          'jodi',     9.0, 10, 5000, false),
      ('panel',    'Panel',    'Pick a 3-digit panel 000-999',                          'panel',    9.0, 10, 5000, false),
      ('double',   'Double',   'Pick a two-digit double 00-99',                         'double',   9.0, 10, 5000, false),
      ('crossing', 'Crossing', 'Pick 0-9 with crossing options (4-6 / 5-7 etc.)',       'crossing', 9.0, 10, 5000, true),
      ('palti',    'Palti',    'Copy-paste number with/without palti (reversal)',        'palti',    9.0, 10, 5000, true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ----------------------------------------------------------
-- 2. point_wallets: earned/spent bookkeeping (from 014)
-- ----------------------------------------------------------
ALTER TABLE public.point_wallets ADD COLUMN IF NOT EXISTS total_earned INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.point_wallets ADD COLUMN IF NOT EXISTS total_spent  INTEGER NOT NULL DEFAULT 0;

-- ----------------------------------------------------------
-- 3. point_transactions: ledger bookkeeping columns (from 014)
-- ----------------------------------------------------------
ALTER TABLE public.point_transactions ADD COLUMN IF NOT EXISTS balance_before INTEGER;
ALTER TABLE public.point_transactions ADD COLUMN IF NOT EXISTS balance_after  INTEGER;
ALTER TABLE public.point_transactions ALTER COLUMN reference_type TYPE TEXT;

-- The live reference_type CHECK is too narrow for the values the backend
-- writes ('play', 'wager', 'wager_win', 'wager_refund', 'deposit', ...).
-- Drop it so ledger rows (deposit add / revert / withdrawal) insert cleanly.
ALTER TABLE public.point_transactions DROP CONSTRAINT IF EXISTS point_transactions_reference_type_check;

-- ----------------------------------------------------------
-- 4. payments: superset columns the backend already writes
--    (adds: txn id, UTR, screenshot, bank details, audit fields)
-- ----------------------------------------------------------
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS txn_id              TEXT UNIQUE;
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

-- ----------------------------------------------------------
-- 5. payments.method: allow 'qr' (QR-code UPI withdrawals)
--    Replaces whatever method CHECK constraint currently exists.
-- ----------------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT c.oid, c.conname
           FROM pg_constraint c
           JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
           WHERE c.conrelid = 'public.payments'::regclass
             AND a.attname = 'method'
             AND c.contype = 'c'
  LOOP
    EXECUTE 'ALTER TABLE public.payments DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_method_check
  CHECK (method IN ('upi', 'bank_transfer', 'paytm', 'phonepe', 'cash', 'points', 'admin', 'imps', 'qr'));

-- ----------------------------------------------------------
-- 6. wallet RPCs: deduct / credit (from 014 — required for bets)
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

-- Done. Verify afterwards:
--   * mobile Add Money (UPI/scanner) credits the wallet
--   * admin Revert on a completed deposit cuts it back
--   * bets place (no more "Insufficient points" / palti errors)
