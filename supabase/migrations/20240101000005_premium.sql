-- Add premium status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Add workout time planning to daily_logs
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS plan_workout_1_time TEXT;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS plan_workout_2_time TEXT;

-- VIP Codes table
CREATE TABLE IF NOT EXISTS vip_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    claimed_by UUID REFERENCES auth.users(id),
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed VIP codes
INSERT INTO vip_codes (code) VALUES
    ('PANN-BEN-75'),
    ('VIP-2024-GO'),
    ('SPARTAN-VIP'),
    ('EARLY-BIRD'),
    ('FOUNDER-75')
ON CONFLICT (code) DO NOTHING;

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_vip_codes_code ON vip_codes(code);

-- Add comments
COMMENT ON COLUMN profiles.is_premium IS 'Premium access flag';
COMMENT ON COLUMN daily_logs.plan_workout_1_time IS 'Planned time for workout 1 (HH:MM format)';
COMMENT ON COLUMN daily_logs.plan_workout_2_time IS 'Planned time for workout 2 (HH:MM format)';
