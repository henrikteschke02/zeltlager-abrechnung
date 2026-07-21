-- Migration: Fix RLS for Leaderboard, News Creation, and ensure members column exists

-- 1. Ensure members column exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS members text;

-- 2. Consumptions: Allow everyone to read consumptions (Leaderboard visibility)
DROP POLICY IF EXISTS "Jeder darf Konsum sehen" ON public.consumptions;
CREATE POLICY "Jeder darf Konsum sehen" 
ON public.consumptions
FOR SELECT 
TO authenticated 
USING (true);

-- 3. News: Allow everyone to create news
DROP POLICY IF EXISTS "Nur Admins knnen News erstellen" ON public.news;
DROP POLICY IF EXISTS "Jeder kann News erstellen" ON public.news;

CREATE POLICY "Jeder kann News erstellen" 
ON public.news 
FOR INSERT 
TO authenticated 
WITH CHECK (
  author_id = auth.uid()
);
