-- ============================================================
-- Shri Ji Bazaar — Wagering System Seed Data
-- ============================================================

-- Wager types are already seeded in 012_wagering_system.sql
-- This file adds additional demo data (optional)

-- ============================================================
-- DEMO WAGER TYPES (ensure they exist)
-- ============================================================
INSERT INTO public.wager_types (code, name, description, digits_required, payout_multiplier, min_stake, sort_order)
VALUES
  ('single', 'Single', 'Pick one digit (0-9)', 1, 9.0, 10, 1),
  ('jodi', 'Jodi', 'Pick a pair of digits (00-99)', 2, 90.0, 10, 2),
  ('panel', 'Panel', 'Pick 3 digits in any order', 3, 150.0, 10, 3),
  ('double', 'Double', 'Pick 2 digits, first digit can repeat', 2, 18.0, 10, 4)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  payout_multiplier = EXCLUDED.payout_multiplier,
  min_stake = EXCLUDED.min_stake,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
