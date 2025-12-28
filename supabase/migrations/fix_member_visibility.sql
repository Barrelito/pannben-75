-- FIX: Allow users to see each other (Profiles & Squad Members)
-- Updated to be idempotent (DROP IF EXISTS before CREATE)

-- 1. PROFILES
-- Drop restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
-- Drop target policy if it already exists (to fix error 42710)
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;

CREATE POLICY "Public profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 2. SQUAD MEMBERS
-- Drop restrictive policy if it exists
DROP POLICY IF EXISTS "Squad members can view squad membership" ON public.squad_members;
-- Drop target policy if it already exists
DROP POLICY IF EXISTS "View squad members" ON public.squad_members;

CREATE POLICY "View squad members"
ON public.squad_members FOR SELECT
TO authenticated
USING (true);
