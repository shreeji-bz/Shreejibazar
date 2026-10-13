-- Add reward_points column to referrals if it doesn't exist
-- This column tracks how many points the referrer earns per completed referral
ALTER TABLE referrals ADD COLUMN IF NOT EXISTS reward_points INTEGER NOT NULL DEFAULT 0;

-- Update existing referrals to have reward_points = 0 if NULL
UPDATE referrals SET reward_points = 0 WHERE reward_points IS NULL;
