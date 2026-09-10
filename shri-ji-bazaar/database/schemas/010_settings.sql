-- App settings (key-value store)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  type TEXT DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings
INSERT INTO public.settings (key, value, type, description) VALUES
  ('app_name', 'Shri Ji Bazaar', 'string', 'Application name'),
  ('app_version', '1.0.0', 'string', 'Application version'),
  ('points_per_activity', '10', 'number', 'Points awarded per activity'),
  ('referral_reward', '50', 'number', 'Points for successful referral'),
  ('min_withdrawal_points', '1000', 'number', 'Minimum points for withdrawal'),
  ('points_to_rupee_rate', '0.01', 'number', 'Points to INR conversion rate'),
  ('maintenance_mode', 'false', 'boolean', 'Maintenance mode flag')
ON CONFLICT (key) DO NOTHING;
