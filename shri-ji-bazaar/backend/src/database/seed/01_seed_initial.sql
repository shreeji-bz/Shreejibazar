-- ============================================================
-- Shri Ji Bazaar — Seed Data
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Seed an admin account (email: admin@shrijibazaar.com / password: admin123)
-- IMPORTANT: Change these credentials after first login
INSERT INTO admins (name, email, password_hash, role, status)
VALUES (
  'Super Admin',
  'admin@shrijibazaar.com',
  '$2a10$7kF9xQvZ3nL8mP2rT5wXVeO1aBcDeFgHiJkLmNoPqRsTuVwXyZ123', -- bcrypt of 'admin123'
  'super_admin',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Seed default settings
INSERT INTO settings (key, value, type) VALUES
  ('app_name', 'Shri Ji Bazaar', 'string'),
  ('app_version', '1.0.0', 'string'),
  ('min_play_points', '10', 'number'),
  ('referral_bonus_points', '100', 'number'),
  ('signup_bonus_points', '50', 'number'),
  ('maintenance_mode', 'false', 'boolean'),
  ('allow_registration', 'true', 'boolean')
ON CONFLICT (key) DO NOTHING;
