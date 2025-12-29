-- Add is_hard_workout tracking to daily_logs
-- For Level 2 (GLÖDEN): Track if daily activity was a "Tufft Pass" (45 min high intensity)

-- Add is_hard_workout column
ALTER TABLE public.daily_logs
ADD COLUMN IF NOT EXISTS is_hard_workout BOOLEAN DEFAULT FALSE;

-- Comment the new column
COMMENT ON COLUMN public.daily_logs.is_hard_workout IS 'Whether the daily workout was marked as a "Tufft Pass" (hard/intense 45min workout for Level 2)';
