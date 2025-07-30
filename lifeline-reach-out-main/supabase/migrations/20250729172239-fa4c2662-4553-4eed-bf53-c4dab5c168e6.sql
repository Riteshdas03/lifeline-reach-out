-- Add user_id to hospitals table for RLS
ALTER TABLE public.hospitals 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add user_id to camps table for RLS  
ALTER TABLE public.camps
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add user_id to donors table for RLS
ALTER TABLE public.donors
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create emergency_alerts table for emergency widget
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'emergency',
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  emergency_contacts TEXT[],
  nearest_hospitals TEXT[],
  message TEXT
);

-- Create emergency_contacts table for user emergency contacts
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospitals
DROP POLICY IF EXISTS "Public can view hospitals" ON public.hospitals;
CREATE POLICY "Public can view hospitals" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert hospitals" ON public.hospitals 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own hospitals" ON public.hospitals 
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for camps
DROP POLICY IF EXISTS "Public can view camps" ON public.camps;
CREATE POLICY "Public can view camps" ON public.camps FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert camps" ON public.camps 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own camps" ON public.camps 
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for donors
DROP POLICY IF EXISTS "Public can view donors" ON public.donors;
DROP POLICY IF EXISTS "Public can register as donors" ON public.donors;
CREATE POLICY "Public can view donors" ON public.donors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can register as donors" ON public.donors 
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own donor info" ON public.donors 
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for emergency_alerts
CREATE POLICY "Users can view their own emergency alerts" ON public.emergency_alerts 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own emergency alerts" ON public.emergency_alerts 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view their own emergency contacts" ON public.emergency_contacts 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own emergency contacts" ON public.emergency_contacts 
FOR ALL USING (auth.uid() = user_id);

-- Improved location-based hospital search function
CREATE OR REPLACE FUNCTION public.get_nearby_hospitals_enhanced(
  lat DOUBLE PRECISION, 
  lng DOUBLE PRECISION, 
  radius DOUBLE PRECISION DEFAULT 20.0,
  search_query TEXT DEFAULT NULL,
  hospital_type TEXT DEFAULT NULL
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
$$;

-- Function to send emergency alert
CREATE OR REPLACE FUNCTION public.send_emergency_alert(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  alert_message TEXT DEFAULT 'Emergency assistance needed'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_emergency_alerts_updated_at
  BEFORE UPDATE ON public.emergency_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();