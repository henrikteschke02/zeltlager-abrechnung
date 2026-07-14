-- Migration: Create news table for Schwarzes Brett
-- This table stores announcements made by admins.

CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Policy 1: Alle eingeloggten Nutzer können News lesen
CREATE POLICY "Jeder kann News lesen" 
ON public.news 
FOR SELECT 
TO authenticated 
USING (true);

-- Policy 2: Nur Admins können News posten
CREATE POLICY "Nur Admins können News erstellen" 
ON public.news 
FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Policy 3: Nur Admins können News löschen
CREATE POLICY "Nur Admins können News löschen" 
ON public.news 
FOR DELETE 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Optional: Falls Admins auch bearbeiten sollen
CREATE POLICY "Nur Admins können News bearbeiten" 
ON public.news 
FOR UPDATE 
TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
