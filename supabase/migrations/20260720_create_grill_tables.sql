-- Create Grill Items Table
CREATE TABLE IF NOT EXISTS public.grill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.grill_items ENABLE ROW LEVEL SECURITY;

-- Grill Items Policies
CREATE POLICY "Grill items are viewable by everyone" ON public.grill_items
    FOR SELECT USING (true);

CREATE POLICY "Grill items are editable by admins" ON public.grill_items
    FOR ALL USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Create Grill Orders Table
CREATE TABLE IF NOT EXISTS public.grill_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    grill_item_id UUID REFERENCES public.grill_items(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.grill_orders ENABLE ROW LEVEL SECURITY;

-- Grill Orders Policies
CREATE POLICY "Users can view their own grill orders" ON public.grill_orders
    FOR SELECT USING (
        auth.uid() = user_id OR 
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Users can insert their own grill orders" ON public.grill_orders
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND 
        (SELECT is_approved FROM public.profiles WHERE id = auth.uid()) = true
    );

CREATE POLICY "Users can delete their own grill orders within 3 minutes" ON public.grill_orders
    FOR DELETE USING (
        (auth.uid() = user_id AND created_at > (now() - interval '3 minutes')) OR
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );
