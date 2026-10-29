-- ============================================================
-- 013: Extend wagering for the Jodi/Crossing/Copy-Paste (Palti) game UI.
-- Safe to re-run (idempotent).
-- ============================================================

-- 1) Allow the two new play types on wagers.
ALTER TABLE public.wagers DROP CONSTRAINT IF EXISTS wagers_play_type_check;
ALTER TABLE public.wagers
  ADD CONSTRAINT wagers_play_type_check
  CHECK (play_type IN ('single', 'jodi', 'panel', 'double', 'crossing', 'palti'));

-- 2) Copy-paste "Palti" flag: with-palti also covers the reversal of the number.
ALTER TABLE public.wagers ADD COLUMN IF NOT EXISTS palti BOOLEAN NOT NULL DEFAULT false;

-- 3) Register the new play types so payout multipliers come from data.
INSERT INTO public.wager_types (code, name, description, digits_required, payout_multiplier, min_stake, sort_order, is_active)
VALUES
  ('crossing', 'Crossing', 'Crossing digit entry (digits appear anywhere in result)', 2, 9.0, 10, 5, true),
  ('palti', 'Palti', 'Copy-paste number with/without palti (reversal)', 2, 90.0, 10, 6, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  payout_multiplier = EXCLUDED.payout_multiplier,
  is_active = true,
  updated_at = now();
