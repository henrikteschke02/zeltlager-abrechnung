-- Erstelle die Tabelle für Feedback
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS aktivieren
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder authentifizierte Nutzer (Camper/Admin) darf eigenes Feedback erstellen
CREATE POLICY "Users can insert their own feedback" 
ON public.feedback 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins dürfen alles sehen
CREATE POLICY "Admins can view all feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Policy: Admins dürfen Feedback löschen (archivieren)
CREATE POLICY "Admins can delete feedback" 
ON public.feedback 
FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
