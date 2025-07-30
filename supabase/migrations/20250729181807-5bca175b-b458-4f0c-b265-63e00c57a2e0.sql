-- Fix RLS policy for organisers table
-- First, create the organisers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.organisers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organisation_name TEXT NOT NULL,
  organisation_type TEXT,
  location TEXT,
  contact_email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organisers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.organisers;
DROP POLICY IF EXISTS "Users can view their own organiser data" ON public.organisers;
DROP POLICY IF EXISTS "Users can update their own organiser data" ON public.organisers;

-- Create proper RLS policies
CREATE POLICY "Allow insert for authenticated users"
ON public.organisers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own organiser data"
ON public.organisers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own organiser data"
ON public.organisers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organisers_updated_at
  BEFORE UPDATE ON public.organisers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();