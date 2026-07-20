-- Add image_name column to grill_items
ALTER TABLE public.grill_items ADD COLUMN IF NOT EXISTS image_name TEXT;
