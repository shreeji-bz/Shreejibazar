-- ============================================================
-- Shri Ji Bazaar — Fix: Add missing password_hash column
-- Run this in Supabase SQL Editor if the column is missing
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';
