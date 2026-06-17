-- Add missing sent_at column to contracts table
ALTER TABLE public.contracts ADD COLUMN sent_at TIMESTAMPTZ;
