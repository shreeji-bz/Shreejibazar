-- ============================================================
-- Shri Ji Bazaar — Games Seed
-- Run this in Supabase SQL Editor after the main schema
-- ============================================================

INSERT INTO games (name, slug, description, image, opening_time, closing_time, result_time, status, is_popular, sort_order) VALUES
  ('Delhi Bazar',   'delhi-bazar',   'Delhi Bazar - Play and win big!',               '', '00:00', '14:30', '15:00', 'active', true,  1),
  ('Shri Ganesh',   'shri-ganesh',   'Shri Ganesh - Fortune favors the bold',        '', '00:00', '16:00', '16:35', 'active', true,  2),
  ('Faridabad',     'faridabad',     'Faridabad - Test your luck',                    '', '00:00', '17:30', '17:55', 'active', true,  3),
  ('Ghaziabad',     'ghaziabad',     'Ghaziabad - Win amazing prizes',               '', '00:00', '21:00', '21:30', 'active', false, 4),
  ('Gali',          'gali',          'Gali - The classic game',                       '', '00:00', '11:00', '11:35', 'active', true,  5),
  ('Disawar',       'disawar',       'Disawar - Fortune awaits',                      '', '00:00', '16:00', '16:30', 'active', true,  6),
  ('Kashi Morning', 'kashi-morning', 'Kashi Morning - Start your day with a win',     '', '00:00', '09:30', '10:00', 'active', false, 7),
  ('Kashi Day',     'kashi-day',     'Kashi Day - Daytime excitement',                '', '00:00', '12:00', '12:40', 'active', false, 8),
  ('Kashi Night',   'kashi-night',   'Kashi Night - Night gaming fun',               '', '00:00', '20:30', '21:13', 'active', false, 9)
ON CONFLICT (slug) DO NOTHING;
