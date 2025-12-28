-- Fix Squad RLS to allow discovery
-- Previous policy "Squad members can view their squads" prevented non-members from joining

-- 1. Drop existing restrictive policy if possible (or we can just add the new one as OR)
DROP POLICY IF EXISTS "Squad members can view their squads" ON public.squads;

-- 2. Allow all authenticated users to view squads (needed for join-by-code)
CREATE POLICY "Allow authenticated to view squads"
ON public.squads FOR SELECT
TO authenticated
USING (true);
