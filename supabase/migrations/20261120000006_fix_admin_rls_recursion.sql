-- Fix infinite recursion in RLS policies that query profiles table.
--
-- Root cause: every admin policy contained:
--   auth.uid() in (select id from public.profiles where is_admin = true)
-- That subquery hits profiles, which re-evaluates profiles RLS, which runs
-- the subquery again → infinite recursion.
--
-- Fix: a SECURITY DEFINER function that queries profiles without RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  )
$$;

-- Drop the recursive profiles policy (redundant — profiles are already publicly
-- readable via "Public profiles are viewable by everyone" using (true)).
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

-- Rebuild confession admin policies using the safe function.
DROP POLICY IF EXISTS "Admins can update any confession" ON public.confessions;
CREATE POLICY "Admins can update any confession" ON public.confessions
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete any confession" ON public.confessions;
CREATE POLICY "Admins can delete any confession" ON public.confessions
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read all confessions" ON public.confessions;
CREATE POLICY "Admins can read all confessions" ON public.confessions
  FOR SELECT USING (public.is_admin() OR is_approved = true);
