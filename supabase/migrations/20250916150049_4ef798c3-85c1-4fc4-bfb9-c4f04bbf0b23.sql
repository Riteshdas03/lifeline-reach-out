-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop and recreate the function with proper PostGIS support
DROP FUNCTION IF EXISTS public.get_nearby_hospitals_with_search(double precision, double precision, integer, text);

CREATE OR REPLACE FUNCTION public.get_nearby_hospitals_with_search(
  lat double precision,
  lng double precision,
  radius_m integer DEFAULT 10000,
  search_term text DEFAULT NULL::text
)
RETURNS TABLE(
  id uuid,
  name text,
  type hospital_type,
  status hospital_status,
  latitude double precision,
  longitude double precision,
  address text,
  contact text,
  services text[],
  distance_m double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    h.type,
    h.status,
    h.latitude,
    h.longitude,
    h.address,
    h.contact,
    h.services,
    ST_Distance(
      ST_MakePoint(h.longitude, h.latitude)::geography,
      ST_MakePoint(lng, lat)::geography
    ) as distance_m
  FROM public.hospitals h
  WHERE 
    h.latitude IS NOT NULL 
    AND h.longitude IS NOT NULL
    AND ST_DWithin(
      ST_MakePoint(h.longitude, h.latitude)::geography,
      ST_MakePoint(lng, lat)::geography,
      radius_m
    )
    AND (
      search_term IS NULL 
      OR h.name ILIKE '%' || search_term || '%'
      OR h.address ILIKE '%' || search_term || '%'
    )
  ORDER BY distance_m ASC
  LIMIT 50;
END;
$function$;