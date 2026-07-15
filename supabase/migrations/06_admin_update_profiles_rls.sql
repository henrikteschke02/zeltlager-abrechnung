-- 1. Policy: Admins dürfen alle Profile aktualisieren (Update)
DROP POLICY IF EXISTS "Admins dürfen Profile aktualisieren" ON public.profiles;
CREATE POLICY "Admins dürfen Profile aktualisieren" ON public.profiles
FOR UPDATE
TO authenticated
USING ( public.is_admin() );

-- 2. Policy: Admins dürfen Profile löschen (Delete)
-- (Wird benötigt für den 'Ablehnen'-Button)
DROP POLICY IF EXISTS "Admins dürfen Profile löschen" ON public.profiles;
CREATE POLICY "Admins dürfen Profile löschen" ON public.profiles
FOR DELETE
TO authenticated
USING ( public.is_admin() );
