-- Demo points data will be generated per user on registration
-- This seed creates the default welcome bonus
INSERT INTO public.bonuses (name, description, bonus_type, points_amount, is_active, valid_until)
VALUES ('Welcome Bonus', 'Welcome bonus for new users', 'welcome', 100, true, now() + INTERVAL '90 days')
ON CONFLICT DO NOTHING;
