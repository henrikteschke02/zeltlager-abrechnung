-- 1. Füge is_approved zur profiles-Tabelle hinzu
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- 2. Setze alle bereits existierenden Profile auf approved, damit niemand ausgesperrt wird
UPDATE public.profiles 
SET is_approved = true;

-- 3. Restriktive RLS Policies für die kritischen Tabellen
-- (RESTRICTIVE Policies werden mit bestehenden PERMISSIVE Policies UND-verknüpft)

-- Für Consumptions (Konsum-Einträge)
DROP POLICY IF EXISTS "Nur freigeschaltete Nutzer dürfen Konsum lesen und schreiben" ON public.consumptions;
CREATE POLICY "Nur freigeschaltete Nutzer dürfen Konsum lesen und schreiben" ON public.consumptions
AS RESTRICTIVE TO authenticated
USING ( 
  -- Admins dürfen immer, ansonsten muss das eigene Profil is_approved = true sein
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR 
  (SELECT is_approved FROM public.profiles WHERE id = auth.uid()) = true 
);

-- Für News (Schwarzes Brett)
DROP POLICY IF EXISTS "Nur freigeschaltete Nutzer dürfen News lesen und schreiben" ON public.news;
CREATE POLICY "Nur freigeschaltete Nutzer dürfen News lesen und schreiben" ON public.news
AS RESTRICTIVE TO authenticated
USING ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR 
  (SELECT is_approved FROM public.profiles WHERE id = auth.uid()) = true 
);

-- Für Löschanfragen
DROP POLICY IF EXISTS "Nur freigeschaltete Nutzer dürfen Löschanfragen bearbeiten" ON public.news_delete_requests;
CREATE POLICY "Nur freigeschaltete Nutzer dürfen Löschanfragen bearbeiten" ON public.news_delete_requests
AS RESTRICTIVE TO authenticated
USING ( 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' OR 
  (SELECT is_approved FROM public.profiles WHERE id = auth.uid()) = true 
);
