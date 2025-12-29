-- Add bonus_completed tracking to daily_logs
-- Migration: Add bonus workout limit feature

-- Add bonus_completed column to track if user has already registered a bonus workout today
ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS bonus_completed BOOLEAN DEFAULT FALSE;

-- Comment the new column
COMMENT ON COLUMN public.daily_logs.bonus_completed IS 'Whether the user has registered their daily bonus workout (max 1 per day)';
