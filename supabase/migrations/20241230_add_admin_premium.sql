-- ============================================
-- ADD IS_ADMIN COLUMN TO PROFILES
-- ============================================
-- This migration adds admin functionality for managing
-- workout exercises and programs.

-- Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add is_premium column if it doesn't exist (needed for workout log feature)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- ============================================
-- Set yourself as admin (update with your user ID)
-- ============================================
-- Uncomment and run this after migration to set yourself as admin:
-- UPDATE public.profiles SET is_admin = TRUE WHERE id = 'YOUR-USER-ID-HERE';
