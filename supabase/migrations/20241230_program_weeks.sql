-- ============================================
-- ADD WEEK_NUMBER TO PROGRAM_DAYS
-- ============================================
-- This migration adds week_number to support week-based program design
-- where admins can design Week 1, then copy it to other weeks.

-- Add week_number column
ALTER TABLE public.program_days
ADD COLUMN IF NOT EXISTS week_number INTEGER NOT NULL DEFAULT 1;

-- Drop the old unique constraint (program_id, day_number)
-- and create a new one that includes week_number
ALTER TABLE public.program_days
DROP CONSTRAINT IF EXISTS program_days_program_id_day_number_key;

ALTER TABLE public.program_days
ADD CONSTRAINT program_days_program_id_week_day_key 
UNIQUE (program_id, week_number, day_number);

-- Update existing seed data to belong to week 1
UPDATE public.program_days SET week_number = 1 WHERE week_number IS NULL OR week_number = 0;

-- Create index for efficient week-based queries
CREATE INDEX IF NOT EXISTS idx_program_days_week 
ON public.program_days(program_id, week_number, day_number);
