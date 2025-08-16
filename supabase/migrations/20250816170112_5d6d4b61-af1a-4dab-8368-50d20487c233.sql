-- Security Fix Phase 1: Secure Donor Data Access
-- Remove public read access from donors table and implement role-based access

-- Drop the current public read policy for donors
DROP POLICY IF EXISTS "Public can view donors" ON public.donors;

-- Create a more secure policy that only allows donors to view their own data
CREATE POLICY "Users can view their own donor profile" 
ON public.donors 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a policy for emergency blood bank access (requires authentication)
CREATE POLICY "Authenticated users can search donors for emergency" 
ON public.donors 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  sos_enabled = true
);

-- Security Fix Phase 2: Harden Database Functions
-- Update existing functions to use secure search_path

-- Fix get_nearby_hospitals function
CREATE OR REPLACE FUNCTION public.get_nearby_hospitals(lat double precision, lng double precision, radius double precision DEFAULT 5.0)
 RETURNS TABLE(id uuid, name text, contact text, address text, latitude double precision, longitude double precision, type hospital_type, status hospital_status, services text[], distance_km double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
    -- Calculate distance using Haversine formula (in kilometers)
    (6371 * acos(cos(radians(lat)) * cos(radians(h.latitude)) * cos(radians(h.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(h.latitude))))::double precision as distance_km
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
$function$;

-- Fix get_nearby_hospitals_enhanced function  
CREATE OR REPLACE FUNCTION public.get_nearby_hospitals_enhanced(lat double precision, lng double precision, radius double precision DEFAULT 20.0, search_query text DEFAULT NULL::text, hospital_type text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, name text, contact text, address text, latitude double precision, longitude double precision, type hospital_type, status hospital_status, services text[], distance_km double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
    -- Distance filter using bounding box for performance
    h.latitude BETWEEN lat - (radius / 111.0) AND lat + (radius / 111.0)
    AND h.longitude BETWEEN lng - (radius / (111.0 * cos(radians(lat)))) AND lng + (radius / (111.0 * cos(radians(lat))))
    -- Precise distance calculation
    AND (6371 * acos(cos(radians(lat)) * cos(radians(h.latitude)) * cos(radians(h.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(h.latitude)))) <= radius
    -- Text search filter
    AND (search_query IS NULL OR h.name ILIKE '%' || search_query || '%' OR h.address ILIKE '%' || search_query || '%')
    -- Type filter
    AND (hospital_type IS NULL OR h.type::TEXT = hospital_type)
  ORDER BY distance_km ASC
  LIMIT 50;
END;
$function$;

-- Fix send_emergency_alert function
CREATE OR REPLACE FUNCTION public.send_emergency_alert(user_lat double precision, user_lng double precision, alert_message text DEFAULT 'Emergency assistance needed'::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  alert_id UUID;
  nearest_hospitals JSON;
  user_contacts JSON;
  result JSON;
BEGIN
  -- Get nearest hospitals (within 10km for emergency)
  SELECT json_agg(json_build_object(
    'id', h.id,
    'name', h.name,
    'contact', h.contact,
    'distance_km', h.distance_km
  )) INTO nearest_hospitals
  FROM public.get_nearby_hospitals_enhanced(user_lat, user_lng, 10.0) h
  WHERE h.status IN ('open', 'available')
  LIMIT 5;

  -- Get user's emergency contacts
  SELECT json_agg(json_build_object(
    'name', ec.name,
    'phone', ec.phone,
    'relationship', ec.relationship
  )) INTO user_contacts
  FROM public.emergency_contacts ec
  WHERE ec.user_id = auth.uid();

  -- Insert emergency alert record
  INSERT INTO public.emergency_alerts (
    user_id,
    latitude,
    longitude,
    alert_type,
    message,
    nearest_hospitals,
    emergency_contacts
  ) VALUES (
    auth.uid(),
    user_lat,
    user_lng,
    'emergency',
    alert_message,
    ARRAY(SELECT jsonb_array_elements_text(nearest_hospitals::jsonb)),
    ARRAY(SELECT jsonb_array_elements_text(user_contacts::jsonb))
  ) RETURNING id INTO alert_id;

  -- Build result
  result := json_build_object(
    'alert_id', alert_id,
    'nearest_hospitals', COALESCE(nearest_hospitals, '[]'::json),
    'emergency_contacts', COALESCE(user_contacts, '[]'::json),
    'status', 'success'
  );

  RETURN result;
END;
$function$;