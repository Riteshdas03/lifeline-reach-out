-- Fix hospital registration RLS policy - allow authenticated users to insert their own hospitals
DROP POLICY IF EXISTS "Authenticated users can insert hospitals" ON public.hospitals;

CREATE POLICY "Authenticated users can insert hospitals" 
ON public.hospitals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create camp_organisers table for health camp organiser registrations
CREATE TABLE public.camp_organisers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    camp_id uuid REFERENCES public.camps(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    organisation_name text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(user_id, camp_id) -- Prevent duplicate registrations
);

-- Enable RLS on camp_organisers
ALTER TABLE public.camp_organisers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for camp_organisers
CREATE POLICY "Users can insert their own organiser registrations" 
ON public.camp_organisers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own organiser registrations" 
ON public.camp_organisers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own organiser registrations" 
ON public.camp_organisers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_camp_organisers_updated_at
BEFORE UPDATE ON public.camp_organisers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fix donors table RLS - ensure authenticated users can insert their own donor records
DROP POLICY IF EXISTS "Authenticated users can register as donors" ON public.donors;

CREATE POLICY "Authenticated users can register as donors" 
ON public.donors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Fix camps table RLS - ensure authenticated users can insert their own camps
DROP POLICY IF EXISTS "Authenticated users can insert camps" ON public.camps;

CREATE POLICY "Authenticated users can insert camps" 
ON public.camps 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);