-- Migration: News Delete Requests & Öffnung der News für alle Camper

-- 1. News-Tabelle so anpassen, dass alle Camper News erstellen dürfen
DROP POLICY IF EXISTS "Nur Admins können News erstellen" ON public.news;
DROP POLICY IF EXISTS "Jeder eingeloggte Nutzer kann News erstellen" ON public.news;

CREATE POLICY "Jeder eingeloggte Nutzer kann News erstellen" 
ON public.news 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = author_id -- Nutzer können nur unter ihrer eigenen ID posten
);


-- 2. Lösch-Policy der News-Tabelle aktualisieren: Ersteller ODER Admin
DROP POLICY IF EXISTS "Nur Admins können News löschen" ON public.news;
DROP POLICY IF EXISTS "Ersteller und Admins können News löschen" ON public.news;

CREATE POLICY "Ersteller und Admins können News löschen" 
ON public.news 
FOR DELETE 
TO authenticated 
USING (
  author_id = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- 3. Neue Tabelle für Löschanfragen erstellen
CREATE TABLE IF NOT EXISTS public.news_delete_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    -- Wir erlauben nur eine Anfrage pro User pro News
    UNIQUE(news_id, requester_id)
);

ALTER TABLE public.news_delete_requests ENABLE ROW LEVEL SECURITY;

-- 4. RLS für Löschanfragen

-- Lesen: Wer darf eine Anfrage sehen?
-- Der Requester selbst, der Ersteller der News, oder ein Admin.
DROP POLICY IF EXISTS "Löschanfragen lesen" ON public.news_delete_requests;

CREATE POLICY "Löschanfragen lesen" 
ON public.news_delete_requests
FOR SELECT
TO authenticated
USING (
  requester_id = auth.uid() OR
  (SELECT author_id FROM public.news WHERE id = news_id) = auth.uid() OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Erstellen: Jeder User darf eine Anfrage für eine fremde News stellen
DROP POLICY IF EXISTS "Löschanfragen erstellen" ON public.news_delete_requests;

CREATE POLICY "Löschanfragen erstellen" 
ON public.news_delete_requests
FOR INSERT
TO authenticated
WITH CHECK (
  requester_id = auth.uid()
);

-- Löschen (Ablehnen/Abbrechen):
-- Der Requester (um die Anfrage zurückzuziehen), der Ersteller (um sie abzulehnen), oder Admin
DROP POLICY IF EXISTS "Löschanfragen löschen" ON public.news_delete_requests;

CREATE POLICY "Löschanfragen löschen" 
ON public.news_delete_requests
FOR DELETE
TO authenticated
USING (
  requester_id = auth.uid() OR
  (SELECT author_id FROM public.news WHERE id = news_id) = auth.uid() OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
