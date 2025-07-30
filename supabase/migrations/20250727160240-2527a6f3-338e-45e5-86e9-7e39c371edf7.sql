-- Create function for finding nearby hospitals using PostGIS
CREATE OR REPLACE FUNCTION get_nearby_hospitals(lat double precision, lng double precision, radius double precision DEFAULT 5.0)
RETURNS TABLE (
  id UUID,
  name TEXT,
  contact TEXT,
  address TEXT,
  latitude double precision,
  longitude double precision,
  type hospital_type,
  status hospital_status,
  services TEXT[],
  distance_km double precision
)
SECURITY DEFINER SET search_path = ''
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
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_nearby_hospitals(double precision, double precision, double precision) TO anon;
GRANT EXECUTE ON FUNCTION get_nearby_hospitals(double precision, double precision, double precision) TO authenticated;