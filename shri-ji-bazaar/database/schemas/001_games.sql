-- Games table for Shri Ji Bazaar
CREATE TABLE IF NOT EXISTS public.games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  image TEXT DEFAULT 'default-game.png',
  opening_time TIME NOT NULL,
  result_time TIME NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'upcoming')),
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_sort_order ON public.games(sort_order);
CREATE INDEX IF NOT EXISTS idx_games_active ON public.games(active);
