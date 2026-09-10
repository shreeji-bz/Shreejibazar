-- Demo game seed data for Shri Ji Bazaar

INSERT INTO public.games (id, name, slug, display_name, description, image, opening_time, result_time, status, is_popular, sort_order, active, created_at, updated_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Delhi Bazar', 'delhi-bazar', 'Delhi Bazar', 'Popular Delhi Bazar game with daily results', 'delhi-bazar.png', '15:00:00', '15:30:00', 'active', true, 1, true, now(), now()),
  ('b2c3d4e5-f6a7-8901-bcde-fa2345678901', 'Shri Ganesh', 'shri-ganesh', 'Shri Ganesh', 'Shri Ganesh game - blessed results daily', 'shri-ganesh.png', '16:35:00', '17:05:00', 'active', true, 2, true, now(), now()),
  ('c3d4e5f6-a7b8-9012-cdef-ab3456789012', 'Faridabad', 'faridabad', 'Faridabad', 'Faridabad game results', 'faridabad.png', '17:55:00', '18:25:00', 'active', true, 3, true, now(), now()),
  ('d4e5f6a7-b8c9-0123-defa-bc4567890123', 'Ghaziyabad', 'ghaziyabad', 'Ghaziyabad', 'Ghaziyabad game results', 'ghaziyabad.png', '21:30:00', '22:00:00', 'active', true, 4, true, now(), now()),
  ('e5f6a7b8-c9d0-1234-efab-cd5678901234', 'Gali', 'gali', 'Gali', 'Gali game results', 'gali.png', '23:35:00', '00:05:00', 'active', true, 5, true, now(), now()),
  ('f6a7b8c9-d0e1-2345-fabc-de6789012345', 'Disawar', 'disawar', 'Disawar', 'Disawar game results', 'disawar.png', '16:30:00', '17:00:00', 'active', true, 6, true, now(), now()),
  ('a7b8c9d0-e1f2-3456-abcd-ef7890123456', 'Kashi Morning', 'kashi-morning', 'Kashi Morning', 'Morning Kashi game results', 'kashi-morning.png', '10:00:00', '10:30:00', 'active', true, 7, true, now(), now()),
  ('b8c9d0e1-f2a3-4567-bcde-fa8901234567', 'Kashi Day', 'kashi-day', 'Kashi Day', 'Day Kashi game results', 'kashi-day.png', '12:40:00', '13:10:00', 'active', true, 8, true, now(), now()),
  ('c9d0e1f2-a3b4-5678-cdef-ab9012345678', 'Kashi Night', 'kashi-night', 'Kashi Night', 'Night Kashi game results', 'kashi-night.png', '21:13:00', '21:43:00', 'active', true, 9, true, now(), now())
ON CONFLICT (slug) DO NOTHING;
