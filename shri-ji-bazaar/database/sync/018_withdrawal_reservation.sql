-- ============================================================
-- 018 — Admin-approved withdrawals: wallet reservation + atomic settle
-- Project: htfrpyaiagwszywoqqbb
-- Run: Supabase Dashboard -> SQL Editor -> New query -> paste ALL -> Run
--
-- What this adds (idempotent, additive — no data loss):
--   1. point_wallets.pending_withdrawal  — reserved amount for open
--      withdrawal requests. Money stays in `balance`; it is only held,
--      so it can't be spent on bets or requested twice.
--   2. reserve_withdrawal_points(...)  — request time:  pending += amount
--      (guarded by available = balance - pending). No ledger row, no
--      balance change.
--   3. settle_withdrawal_points(...)   — admin APPROVE: ONE transaction
--      moves balance -= amount, pending -= amount, total_spent += amount
--      and writes the debit ledger row. Atomic + guarded (cannot settle
--      more than reserved, cannot go negative).
--   4. release_withdrawal_points(...)  — admin REJECT / system EXPIRY:
--      pending -= amount, balance untouched (money was never spent).
--   5. deduct_wallet_points(...) is REDEFINED (same 5-arg signature, so
--      zero backend changes): wagers now deduct from AVAILABLE =
--      balance - pending, so reserved money truly can't be staked.
--      (Re-created exactly per sync 014, plus the reservation check.)
--   6. settings seeds: min_withdrawal_amount, withdrawal_admin_timeout_hours,
--      withdrawal_pending_notice_delay_ms + the 4 user-facing messages
--      ({amount} is replaced server-side).
--
-- NOTE: until this script is run the backend still works end-to-end but
-- degrades gracefully (no reservation hold; approve/reject fall back to
-- the plain wallet ledger). Run it so the hold is actually enforced.
-- ============================================================

-- ----------------------------------------------------------
-- 1. point_wallets: reservation column
-- ----------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.point_wallets') IS NOT NULL THEN
    ALTER TABLE public.point_wallets
      ADD COLUMN IF NOT EXISTS pending_withdrawal INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ----------------------------------------------------------
-- 2. RESERVE — request a withdrawal hold (no balance change)
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reserve_withdrawal_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_payment_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS public.point_wallets AS $$
DECLARE
  v_wallet public.point_wallets;
BEGIN
  IF COALESCE(p_amount, 0) <= 0 THEN
    RAISE EXCEPTION 'Reserve amount must be positive' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_wallet FROM public.point_wallets
  WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.point_wallets (user_id) VALUES (p_user_id)
    RETURNING * INTO v_wallet;
  END IF;

  -- Available = balance minus what is already reserved.
  IF COALESCE(v_wallet.balance, 0) - COALESCE(v_wallet.pending_withdrawal, 0) < p_amount THEN
    RAISE EXCEPTION 'Insufficient available balance. Available: %, Required: %',
      COALESCE(v_wallet.balance, 0) - COALESCE(v_wallet.pending_withdrawal, 0), p_amount
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.point_wallets
  SET pending_withdrawal = COALESCE(pending_withdrawal, 0) + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_wallet;

  RETURN v_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------
-- 3. SETTLE — admin approved: atomic balance - amount, release
--    the hold, ledger row. Refuses to settle more than reserved
--    (guards against double-approval).
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.settle_withdrawal_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_payment_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS public.point_wallets AS $$
DECLARE
  v_wallet public.point_wallets;
BEGIN
  IF COALESCE(p_amount, 0) <= 0 THEN
    RAISE EXCEPTION 'Settle amount must be positive' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_wallet FROM public.point_wallets
  WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found' USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(v_wallet.balance, 0) < p_amount THEN
    RAISE EXCEPTION 'Insufficient points. Balance: %, Required: %',
      COALESCE(v_wallet.balance, 0), p_amount
      USING ERRCODE = 'P0001';
  END IF;

  IF COALESCE(v_wallet.pending_withdrawal, 0) < p_amount THEN
    -- Nothing (or too little) was reserved for this user — this request can
    -- not be settled. The payment row's guarded status check is the
    -- backstop; this catches any race where the hold was already released.
    RAISE EXCEPTION 'No reserved withdrawal for this amount. Reserved: %, Required: %',
      COALESCE(v_wallet.pending_withdrawal, 0), p_amount
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE public.point_wallets
  SET balance = COALESCE(balance, 0) - p_amount,
      total_spent = COALESCE(total_spent, 0) + p_amount,
      pending_withdrawal = GREATEST(COALESCE(pending_withdrawal, 0) - p_amount, 0),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_wallet;

  -- Ledger row (best-effort; the state move above already happened atomically).
  BEGIN
    INSERT INTO public.point_transactions
      (user_id, type, amount, description, reference_id, reference_type, balance_before, balance_after)
    VALUES
      (p_user_id, 'debit', -p_amount, p_description, p_payment_id, 'withdrawal',
       v_wallet.balance + p_amount, v_wallet.balance);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN v_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------
-- 4. RELEASE — admin rejected / system expired: give the hold back.
--    Balance is untouched; only the reservation is removed.
-- ----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.release_withdrawal_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_payment_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS public.point_wallets AS $$
DECLARE
  v_wallet public.point_wallets;
BEGIN
  IF COALESCE(p_amount, 0) <= 0 THEN
    RAISE EXCEPTION 'Release amount must be positive' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_wallet FROM public.point_wallets
  WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  UPDATE public.point_wallets
  SET pending_withdrawal = GREATEST(COALESCE(pending_withdrawal, 0) - p_amount, 0),
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING * INTO v_wallet;

  RETURN v_wallet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------
-- 5. REDEFINE deduct_wallet_points (same 5-arg signature as sync 014)
--    to be reservation-aware: wagers may only spend AVAILABLE =
--    balance - pending_withdrawal. Everything else identical to 014.
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
    INSERT INTO public.point_wallets (user_id) VALUES (p_user_id)
    RETURNING * INTO v_wallet;
  END IF;

  IF COALESCE(v_wallet.balance, 0) - COALESCE(v_wallet.pending_withdrawal, 0) < p_amount THEN
    RAISE EXCEPTION 'Insufficient available points. Available: %, Required: %',
      COALESCE(v_wallet.balance, 0) - COALESCE(v_wallet.pending_withdrawal, 0), p_amount
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

GRANT EXECUTE ON FUNCTION public.reserve_withdrawal_points(UUID, INTEGER, UUID, TEXT)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.settle_withdrawal_points(UUID, INTEGER, UUID, TEXT)
  TO service_role;  -- settle is admin-triggered only
GRANT EXECUTE ON FUNCTION public.release_withdrawal_points(UUID, INTEGER, UUID, TEXT)
  TO service_role;  -- release is admin/system-triggered only
GRANT EXECUTE ON FUNCTION public.deduct_wallet_points(UUID, INTEGER, TEXT, UUID, TEXT)
  TO authenticated, service_role;

-- ----------------------------------------------------------
-- 6b. payments.status: allow the new terminal state 'expired'.
--     Replaces whatever status CHECK constraint currently exists
--     (same pattern as sync 016's method constraint). The set is a
--     superset of everything the backend ever writes, so existing
--     rows stay valid.
-- ----------------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT c.oid, c.conname
           FROM pg_constraint c
           JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
           WHERE c.conrelid = 'public.payments'::regclass
             AND a.attname = 'status'
             AND c.contype = 'c'
  LOOP
    EXECUTE 'ALTER TABLE public.payments DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed', 'cancelled', 'expired'));

-- ----------------------------------------------------------
-- 6. Settings seed (only missing keys are inserted; existing
--    values are kept, so an admin-tuned min amount is not reset).
-- ----------------------------------------------------------
INSERT INTO public.settings (key, value, type)
VALUES
  ('min_withdrawal_amount', '100', 'number'),
  ('withdrawal_admin_timeout_hours', '24', 'number'),
  ('withdrawal_pending_notice_delay_ms', '3500', 'number'),
  ('msg_withdrawal_pending', 'Your withdrawal request has been sent. It is pending admin approval. Your money is safe in your wallet.', 'string'),
  ('msg_withdrawal_approved', 'Your withdrawal of {amount} has been approved.', 'string'),
  ('msg_withdrawal_rejected', 'Your withdrawal request was not processed. Your {amount} is safe in your wallet.', 'string'),
  ('msg_withdrawal_expired', 'Your withdrawal request could not be processed in time. Your {amount} is safe in your wallet. You can request again.', 'string')
ON CONFLICT (key) DO NOTHING;

-- Done. Verify afterwards:
--   * request a withdrawal in the app — balance unchanged, pending shows in wallet
--   * placing a bet for more than the AVAILABLE balance is rejected
--   * admin approves — balance drops by the amount in one step, hold released
--   * admin rejects / 24h passes — hold released, balance untouched, user notified
