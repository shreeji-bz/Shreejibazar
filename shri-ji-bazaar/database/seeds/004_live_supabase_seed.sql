-- ============================================================
-- LIVE SUPABASE SEED (project: htfrpyaiagwszywoqqbb)
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- Fills the live `games` + `rounds` tables that the admin
-- panel and mobile app read from. RLS blocks the REST API,
-- so this SQL is the only clean way to insert.
-- Safe to re-run: ON CONFLICT (slug) DO NOTHING + no-dupe rounds.
-- Times in IST, matching the market schedule.
-- ============================================================

INSERT INTO public.games (name, slug, description, image, opening_time, closing_time, result_time, status, is_popular, sort_order) VALUES
  ('Delhi Bazar',   'delhi-bazar',   'Delhi Bazar - Play and win big!',   '', '06:00', '03:00', '03:35', 'active', true,  1),
  ('Shree Ganesh',  'shri-ganesh',   'Shree Ganesh - Blessed results',     '', '06:00', '04:30', '05:00', 'active', true,  2),
  ('Faridabad',     'faridabad',     'Faridabad - Test your luck',        '', '06:00', '05:50', '06:20', 'active', true,  3),
  ('Ghaziabad',     'ghaziabad',     'Ghaziabad - Win amazing prizes',    '', '06:00', '09:05', '09:35', 'active', false, 4),
  ('Nepal Day',     'nepal-day',     'Nepal Day game results',            '', '07:00', '01:05', '01:05', 'active', true,  10),
  ('Nepal Night',   'nepal-night',   'Nepal Night game results',          '', '07:00', '09:05', '09:35', 'active', true, 11),
  ('Gali',          'gali',          'Gali - The classic game',           '', '06:00', '11:35', '12:05', 'active', true,  5)
ON CONFLICT (slug) DO NOTHING;

-- One round per game for today + next 29 days. Round window = opening
-- time, 30 min long; result declared at the game's result_time.
--
-- NOTE: the live `rounds` table has a CHECK constraint that does NOT allow
-- status='pending' (that value only exists in the local schema). Use 'open'
-- here. If you later upgrade the live schema to allow 'pending', the backend
-- round repo (rounds.repository.ts create()) will also need to match.
DO $$
DECLARE
  g RECORD;
  off INTEGER;
  d DATE := CURRENT_DATE;
BEGIN
  FOR g IN SELECT id, opening_time, result_time FROM public.games
            WHERE status = 'active' LOOP
    FOR off IN 0..29 LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.rounds
        WHERE game_id = g.id
          AND start_time = ((d + off)::timestamp + g.opening_time::time)
      ) THEN
        INSERT INTO public.rounds (game_id, round_number, start_time, end_time, status)
        VALUES (
          g.id,
          ((EXTRACT(EPOCH FROM ((d + off)::timestamp + g.opening_time::time))::bigint % 100000)::text),
          (d + off)::timestamp + g.opening_time::time,
          (d + off)::timestamp + g.opening_time::time + INTERVAL '30 minutes',
          'open'
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- Verify:
-- SELECT count(*) AS games FROM public.games;  -- expect 7
-- SELECT count(*) AS rounds FROM public.rounds; -- expect ~210
