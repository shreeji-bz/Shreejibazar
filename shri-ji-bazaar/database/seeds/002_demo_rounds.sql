-- Generate demo rounds for next 30 days for each game
DO $$
DECLARE
  game_record RECORD;
  day_offset INTEGER;
  round_num INTEGER;
  base_date DATE := CURRENT_DATE;
BEGIN
  FOR game_record IN SELECT id, opening_time, result_time FROM public.games WHERE active = true LOOP
    FOR day_offset IN 0..29 LOOP
      FOR round_num IN 1..1 LOOP  -- 1 round per day per game
        INSERT INTO public.rounds (
          game_id,
          round_number,
          start_time,
          end_time,
          result_time,
          status
        ) VALUES (
          game_record.id,
          (EXTRACT(EPOCH FROM (base_date + day_offset)::timestamp)::bigint % 10000) + round_num,
          (base_date + day_offset)::timestamp + game_record.opening_time::time,
          (base_date + day_offset)::timestamp + (game_record.opening_time::time + INTERVAL '30 minutes'),
          (base_date + day_offset)::timestamp + game_record.result_time::time,
          CASE
            WHEN (base_date + day_offset) = CURRENT_DATE AND game_record.opening_time::time > CURRENT_TIME THEN 'pending'
            WHEN (base_date + day_offset) < CURRENT_DATE THEN 'result_declared'
            ELSE 'pending'
          END
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
