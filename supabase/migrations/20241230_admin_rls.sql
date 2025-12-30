-- ============================================
-- ADMIN RLS POLICIES
-- ============================================
-- This migration adds policies to allow admins to manage
-- system exercises and programs.

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. EXERCISES
CREATE POLICY "Admins can insert system exercises"
ON public.exercises FOR INSERT
TO authenticated
WITH CHECK (is_admin() AND is_system = TRUE);

CREATE POLICY "Admins can update system exercises"
ON public.exercises FOR UPDATE
TO authenticated
USING (is_admin() AND is_system = TRUE);

CREATE POLICY "Admins can delete system exercises"
ON public.exercises FOR DELETE
TO authenticated
USING (is_admin() AND is_system = TRUE);

-- 2. WORKOUT PROGRAMS
CREATE POLICY "Admins can insert system programs"
ON public.workout_programs FOR INSERT
TO authenticated
WITH CHECK (is_admin() AND is_system = TRUE);

CREATE POLICY "Admins can update system programs"
ON public.workout_programs FOR UPDATE
TO authenticated
USING (is_admin() AND is_system = TRUE);

CREATE POLICY "Admins can delete system programs"
ON public.workout_programs FOR DELETE
TO authenticated
USING (is_admin() AND is_system = TRUE);

-- 3. PROGRAM DAYS (Inherits access via program, but simplify for admins)
CREATE POLICY "Admins can manage program days"
ON public.program_days FOR ALL
TO authenticated
USING (is_admin());

-- 4. PROGRAM EXERCISES
CREATE POLICY "Admins can manage program exercises"
ON public.program_exercises FOR ALL
TO authenticated
USING (is_admin());
