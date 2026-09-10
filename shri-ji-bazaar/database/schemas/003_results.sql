-- Results table
CREATE TABLE IF NOT EXISTS public.results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  result TEXT NOT NULL,
  declared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_results_round_id ON public.results(round_id);
CREATE INDEX IF NOT EXISTS idx_results_game_id ON public.results(game_id);
CREATE INDEX IF NOT EXISTS idx_results_declared_at ON public.results(declared_at DESC);
