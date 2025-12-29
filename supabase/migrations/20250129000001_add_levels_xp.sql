-- Add difficulty level and XP tracking to profiles
-- Migration: Add levels & unified XP system

-- Add difficulty_level column with default 'hard' to preserve existing users' experience
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'hard' 
CHECK (difficulty_level IN ('easy', 'medium', 'hard'));

-- Add total_xp column for gamification
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- Create index for faster XP-based queries (leaderboards, rank calculations)
CREATE INDEX IF NOT EXISTS idx_profiles_total_xp ON public.profiles(total_xp DESC);

-- Comment the new columns
COMMENT ON COLUMN public.profiles.difficulty_level IS 'User selected difficulty: easy (GNISTAN), medium (GLÖDEN), hard (PANNBEN)';
COMMENT ON COLUMN public.profiles.total_xp IS 'Total accumulated experience points for rank progression';
