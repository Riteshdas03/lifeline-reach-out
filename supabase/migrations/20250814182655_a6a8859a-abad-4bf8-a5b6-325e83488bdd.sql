-- Fix RLS security issue: Enable Row Level Security on spatial_ref_sys table
-- This table contains spatial reference system data and should have RLS enabled for security

ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy to allow public read access to spatial reference data
-- This is safe as spatial_ref_sys contains non-sensitive geographic reference data
CREATE POLICY "Allow public read access to spatial reference systems" 
ON public.spatial_ref_sys 
FOR SELECT 
USING (true);