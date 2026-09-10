-- Bonuses table
CREATE TABLE IF NOT EXISTS public.bonuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  bonus_type TEXT NOT NULL CHECK (bonus_type IN ('welcome', 'daily', 'referral', 'special', 'event')),
  points_amount INTEGER NOT NULL,
  min_deposit INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  max_claims INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User bonuses (claimed)
CREATE TABLE IF NOT EXISTS public.user_bonuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_id UUID NOT NULL REFERENCES public.bonuses(id) ON DELETE CASCADE,
  points_awarded INTEGER NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, bonus_id)
);

CREATE INDEX IF NOT EXISTS idx_bonuses_active ON public.bonuses(is_active);
CREATE INDEX IF NOT EXISTS idx_user_bonuses_user_id ON public.user_bonuses(user_id);
