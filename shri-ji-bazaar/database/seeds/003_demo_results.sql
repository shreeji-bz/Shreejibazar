-- Generate demo results for past rounds
INSERT INTO public.results (round_id, game_id, result, declared_at)
SELECT
  r.id,
  r.game_id,
  LPAD(CAST(floor(random() * 100) AS TEXT), 2, '0') AS result,
  r.result_time
FROM public.rounds r
WHERE r.status = 'result_declared'
  AND NOT EXISTS (SELECT 1 FROM public.results WHERE round_id = r.id)
LIMIT 200;
