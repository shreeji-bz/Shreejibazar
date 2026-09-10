-- ============================================================
-- Shri Ji Bazaar — Wagering System Schema
-- ============================================================

-- ============================================================
-- WAGER TYPES (Single, Jodi, Panel, Double)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wager_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  digits_required INTEGER NOT NULL,
  payout_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  min_stake INTEGER NOT NULL DEFAULT 10,
  max_stake INTEGER,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO public.wager_types (code, name, description, digits_required, payout_multiplier, min_stake, sort_order) VALUES
  ('single', 'Single', 'Pick one digit (0-9)', 1, 9.0, 10, 1),
  ('jodi', 'Jodi', 'Pick a pair of digits (00-99)', 2, 90.0, 10, 2),
  ('panel', 'Panel', 'Pick 3 digits in any order', 3, 150.0, 10, 3),
  ('double', 'Double', 'Pick 2 digits, first digit can repeat', 2, 18.0, 10, 4)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- WAGERS (User Bets)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wagers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  wager_type_id UUID NOT NULL REFERENCES public.wager_types(id),
  play_type TEXT NOT NULL CHECK (play_type IN ('single', 'jodi', 'panel', 'double')),
  selection TEXT NOT NULL,
  points_staked INTEGER NOT NULL CHECK (points_staked > 0),
  potential_payout INTEGER NOT NULL CHECK (potential_payout > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'won', 'lost', 'void', 'cancelled')),
  result_status TEXT DEFAULT 'pending' CHECK (result_status IN ('pending', 'won', 'lost', 'void')),
  result_text TEXT,
  points_won INTEGER DEFAULT 0,
  points_refunded INTEGER DEFAULT 0,
  idempotency_key TEXT UNIQUE,
  placed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  settled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wagers_user_id ON public.wagers(user_id);
CREATE INDEX IF NOT EXISTS idx_wagers_game_id ON public.wagers(game_id);
CREATE INDEX IF NOT EXISTS idx_wagers_round_id ON public.wagers(round_id);
CREATE INDEX IF NOT EXISTS idx_wagers_status ON public.wagers(status);
CREATE INDEX IF NOT EXISTS idx_wagers_result_status ON public.wagers(result_status);
CREATE INDEX IF NOT EXISTS idx_wagers_placed_at ON public.wagers(placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_wagers_idempotency ON public.wagers(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- ============================================================
-- PAYMENT TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  processed_by UUID REFERENCES admins(id),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bonus', 'referral', 'admin_credit', 'admin_debit', 'refund', 'settlement')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT CHECK (method IN ('upi', 'bank_transfer', 'paytm', 'phonepe', 'cash', 'points', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed', 'cancelled')),
  reference_id TEXT,
  reference_type TEXT,
  notes TEXT,
  admin_notes TEXT,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_type ON public.payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- ============================================================
-- SETTLEMENT RECORDS (result-driven payouts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  result TEXT NOT NULL,
  total_wagers INTEGER DEFAULT 0,
  total_staked INTEGER DEFAULT 0,
  total_payout INTEGER DEFAULT 0,
  total_refund INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_by UUID REFERENCES admins(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settlements_round_id ON public.settlements(round_id);
CREATE INDEX IF NOT EXISTS idx_settlements_game_id ON public.settlements(game_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON public.settlements(status);

-- ============================================================
-- SETTLEMENT ITEMS (per-wager payout details)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settlement_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  settlement_id UUID NOT NULL REFERENCES public.settlements(id) ON DELETE CASCADE,
  wager_id UUID NOT NULL REFERENCES public.wagers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points_staked INTEGER NOT NULL,
  points_won INTEGER NOT NULL,
  points_refunded INTEGER NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settlement_items_settlement_id ON public.settlement_items(settlement_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_wager_id ON public.settlement_items(wager_id);
CREATE INDEX IF NOT EXISTS idx_settlement_items_user_id ON public.settlement_items(user_id);

-- ============================================================
-- POINTS WALLET (updated for currency)
-- ============================================================
ALTER TABLE public.points_wallet ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.point_transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE public.point_transactions ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.wagers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlement_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wager_types ENABLE ROW LEVEL SECURITY;

-- Wagers: Users see their own; admins see all
CREATE POLICY "wagers_select_own" ON public.wagers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wagers_select_admin" ON public.wagers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "wagers_insert_own" ON public.wagers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments: Users see their own; admins see all
CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "payments_select_admin" ON public.payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "payments_update_admin" ON public.payments FOR UPDATE USING (auth.role() = 'authenticated');

-- Settlements: Read-only for users, admin write
CREATE POLICY "settlements_select_own" ON public.settlements FOR SELECT USING (auth.role() = 'authenticated');

-- Settlement items: Users see their own
CREATE POLICY "settlement_items_select_own" ON public.settlement_items FOR SELECT USING (auth.uid() = user_id);

-- Wager types: Public read
CREATE POLICY "wager_types_select_public" ON public.wager_types FOR SELECT USING (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Deduct points from wallet when placing wager
CREATE OR REPLACE FUNCTION deduct_wallet_points(p_user_id UUID, p_amount INTEGER)
RETURNS public.points_wallet AS $$
DECLARE
  v_wallet public.points_wallet;
BEGIN
  SELECT * INTO v_wallet FROM public.points_wallet WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  IF v_wallet.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient points. Balance: %, Required: %', v_wallet.balance, p_amount;
  END IF;
  UPDATE public.points_wallet
  SET balance = balance - p_amount, total_spent = total_spent + p_amount, updated_at = now()
  WHERE user_id = p_user_id;
  RETURN v_wallet;
END;
$$ LANGUAGE plpgsql;

-- Credit points to wallet (for winnings, deposits, etc.)
CREATE OR REPLACE FUNCTION credit_wallet_points(p_user_id UUID, p_amount INTEGER)
RETURNS public.points_wallet AS $$
DECLARE
  v_wallet public.points_wallet;
BEGIN
  SELECT * INTO v_wallet FROM public.points_wallet WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.points_wallet (user_id, balance, total_earned) VALUES (p_user_id, p_amount, p_amount) RETURNING * INTO v_wallet;
  ELSE
    UPDATE public.points_wallet
    SET balance = balance + p_amount, total_earned = total_earned + p_amount, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  RETURN v_wallet;
END;
$$ LANGUAGE plpgsql;

-- Calculate potential payout based on play type and stake
CREATE OR REPLACE FUNCTION calculate_potential_payout(p_play_type TEXT, p_stake INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_multiplier DECIMAL(5,2);
BEGIN
  SELECT payout_multiplier INTO v_multiplier FROM public.wager_types WHERE code = p_play_type AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid play type: %', p_play_type;
  END IF;
  RETURN ROUND(p_stake::DECIMAL * v_multiplier);
END;
$$ LANGUAGE plpgsql;
