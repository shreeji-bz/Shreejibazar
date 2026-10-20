-- ============================================================
-- NEW GAMES SEED — NEPAL DAY, NEPAL NIGHT
-- Run in your Supabase SQL Editor (or psql) after the schema.
-- Safe to re-run: ON CONFLICT (slug) DO NOTHING.
-- Use fixed UUIDs so the round generator below never
-- duplicates rounds.
-- ============================================================

INSERT INTO public.games (id, name, slug, display_name, description, image, opening_time, closing_time, result_time, status, is_popular, sort_order, active) VALUES
  ('d1e2f3a4-b5c6-7788-99aa-bb0011223344', 'Nepal Day',   'nepal-day',   'Nepal Day',   'Nepal Day game results',   'nepal-day.png',   '07:00:00', '01:05:00', '01:05:00', 'active', true, 10, true),
  ('d1e2f3a4-b5c6-7788-99aa-bb0011223345', 'Nepal Night', 'nepal-night', 'Nepal Night', 'Nepal Night game results', 'nepal-night.png', '07:00:00', '09:05:00', '09:05:00', 'active', true, 11, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ROUNDS for the new games (today + next 29 days, one per day)
-- Matches the generator used for the original 9 games.
-- Times in IST; result declared 30 min after opening.
-- ============================================================

DO $$
DECLARE
  g RECORD;
  off INTEGER;
  d DATE := CURRENT_DATE;
BEGIN
  FOR g IN SELECT id, opening_time, result_time FROM public.games
            WHERE slug IN ('nepal-day', 'nepal-night') AND active = true LOOP
    FOR off IN 0..29 LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.rounds
        WHERE game_id = g.id
          AND start_time = ((d + off)::timestamp + g.opening_time::time)
      ) THEN
        INSERT INTO public.rounds (game_id, round_number, start_time, end_time, result_time, status)
        VALUES (
          g.id,
          ((EXTRACT(EPOCH FROM ((d + off)::timestamp + g.opening_time::time))::bigint % 100000)::text),
          (d + off)::timestamp + g.opening_time::time,
          (d + off)::timestamp + g.opening_time::time + INTERVAL '30 minutes',
          (d + off)::timestamp + g.result_time::time,
          'pending'
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- Verification:
-- SELECT g.name, r.start_time, r.status FROM public.rounds r
-- JOIN public.games g ON g.id = r.game_id
-- WHERE g.slug IN ('nepal-day','nepal-night')
-- ORDER BY r.start_time LIMIT 10;
