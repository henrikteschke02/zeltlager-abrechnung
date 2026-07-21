-- Migration: Create Broetchen Tables

-- Create Broetchen Items Table
CREATE TABLE IF NOT EXISTS public.broetchen_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    preis NUMERIC(10, 2) NOT NULL,
    image_name TEXT DEFAULT 'default.png',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.broetchen_items ENABLE ROW LEVEL SECURITY;

-- Broetchen Items Policies
CREATE POLICY "Broetchen items are viewable by everyone" ON public.broetchen_items
    FOR SELECT USING (true);

CREATE POLICY "Broetchen items are editable by admins" ON public.broetchen_items
    FOR ALL USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Create Broetchen Buchungen (Orders) Table
CREATE TABLE IF NOT EXISTS public.broetchen_buchungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES public.broetchen_items(id) ON DELETE CASCADE NOT NULL,
    menge INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.broetchen_buchungen ENABLE ROW LEVEL SECURITY;

-- Broetchen Buchungen Policies
CREATE POLICY "Users can view their own broetchen buchungen" ON public.broetchen_buchungen
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can insert their own broetchen buchungen" ON public.broetchen_buchungen
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        (
            (SELECT is_approved FROM public.profiles WHERE id = auth.uid()) = true OR
            (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
        )
    );

CREATE POLICY "Users can delete their own broetchen buchungen within 3 minutes" ON public.broetchen_buchungen
    FOR DELETE USING (
        (auth.uid() = user_id AND created_at > (now() - interval '3 minutes')) OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );
