-- Fix security issues from linter warnings

-- Enable RLS on blood_banks table (was missing RLS)
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for blood_banks
CREATE POLICY "Public can view blood banks" ON public.blood_banks 
FOR SELECT USING (true);

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.get_nearby_hospitals(
  lat DOUBLE PRECISION, 
  lng DOUBLE PRECISION, 
  radius DOUBLE PRECISION DEFAULT 5.0
)
RETURNS TABLE(
  id UUID, 
  name TEXT, 
  contact TEXT, 
  address TEXT, 
  latitude DOUBLE PRECISION, 
  longitude DOUBLE PRECISION, 
  type hospital_type, 
  status hospital_status, 
  services TEXT[], 
  distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.contact,
    h.address,
    h.latitude,
    h.longitude,
    h.type,
    h.status,
    h.services,
    -- Calculate distance using Haversine formula
    (6371 * acos(cos(radians(lat)) * cos(radians(h.latitude)) * cos(radians(h.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(h.latitude))))::DOUBLE PRECISION as distance_km
  FROM public.hospitals h
  WHERE 
    -- Use bounding box for initial filtering (faster)
    h.latitude BETWEEN lat - (radius / 111.0) AND lat + (radius / 111.0)
    AND h.longitude BETWEEN lng - (radius / (111.0 * cos(radians(lat)))) AND lng + (radius / (111.0 * cos(radians(lat))))
    -- Then apply precise distance calculation
    AND (6371 * acos(cos(radians(lat)) * cos(radians(h.latitude)) * cos(radians(h.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(h.latitude)))) <= radius
  ORDER BY distance_km ASC
  LIMIT 10;
END;
$$;

-- Fix handle_new_user function security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;