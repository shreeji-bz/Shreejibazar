-- Enable RLS on key tables
ALTER TABLE public.points_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Points wallet policies
CREATE POLICY "Users view own wallet" ON public.points_wallet FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own wallet via service" ON public.points_wallet FOR UPDATE USING (auth.uid() = user_id);

-- Point transactions policies
CREATE POLICY "Users view own transactions" ON public.point_transactions FOR SELECT USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users view own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Support policies
CREATE POLICY "Users view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view ticket messages" ON public.support_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);

-- User bonuses policies
CREATE POLICY "Users view own bonuses" ON public.user_bonuses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users claim bonuses" ON public.user_bonuses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
