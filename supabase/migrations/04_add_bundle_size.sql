-- Migration: Add bundle_size to beverages

ALTER TABLE public.beverages
ADD COLUMN IF NOT EXISTS bundle_size INTEGER DEFAULT NULL;
