-- Create routes table for storing navigation routes
CREATE TABLE public.routes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  start_lat double precision NOT NULL,
  start_lng double precision NOT NULL,
  end_lat double precision NOT NULL,
  end_lng double precision NOT NULL,
  vehicle_type text NOT NULL DEFAULT 'driving',
  polyline text,
  distance_km double precision,
  eta_minutes integer,
  status text NOT NULL DEFAULT 'created',
  destination_name text,
  destination_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create tracking table for real-time location updates
CREATE TABLE public.tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  speed double precision,
  heading double precision,
  remaining_distance_km double precision,
  remaining_eta_minutes integer,
  current_step_index integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on routes table
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tracking table  
ALTER TABLE public.tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for routes table
CREATE POLICY "Users can create their own routes" 
ON public.routes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own routes" 
ON public.routes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes" 
ON public.routes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes" 
ON public.routes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for tracking table
CREATE POLICY "Users can create their own tracking data" 
ON public.tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tracking data" 
ON public.tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking data" 
ON public.tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_routes_user_id ON public.routes(user_id);
CREATE INDEX idx_routes_status ON public.routes(status);
CREATE INDEX idx_tracking_route_id ON public.tracking(route_id);
CREATE INDEX idx_tracking_user_id ON public.tracking(user_id);
CREATE INDEX idx_tracking_updated_at ON public.tracking(updated_at DESC);

-- Create function to get route with latest tracking
CREATE OR REPLACE FUNCTION public.get_route_with_tracking(route_uuid uuid)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  route_data JSON;
  latest_tracking JSON;
BEGIN
  -- Get route data
  SELECT json_build_object(
    'id', r.id,
    'start_lat', r.start_lat,
    'start_lng', r.start_lng,
    'end_lat', r.end_lat,
    'end_lng', r.end_lng,
    'vehicle_type', r.vehicle_type,
    'polyline', r.polyline,
    'distance_km', r.distance_km,
    'eta_minutes', r.eta_minutes,
    'status', r.status,
    'destination_name', r.destination_name,
    'destination_address', r.destination_address,
    'created_at', r.created_at
  ) INTO route_data
  FROM public.routes r
  WHERE r.id = route_uuid AND r.user_id = auth.uid();

  -- Get latest tracking data
  SELECT json_build_object(
    'lat', t.lat,
    'lng', t.lng,
    'speed', t.speed,
    'heading', t.heading,
    'remaining_distance_km', t.remaining_distance_km,
    'remaining_eta_minutes', t.remaining_eta_minutes,
    'current_step_index', t.current_step_index,
    'status', t.status,
    'updated_at', t.updated_at
  ) INTO latest_tracking
  FROM public.tracking t
  WHERE t.route_id = route_uuid AND t.user_id = auth.uid()
  ORDER BY t.updated_at DESC
  LIMIT 1;

  RETURN json_build_object(
    'route', route_data,
    'tracking', latest_tracking
  );
END;
$$;

-- Create function to update tracking with recalculation
CREATE OR REPLACE FUNCTION public.update_tracking_location(
  route_uuid uuid,
  new_lat double precision,
  new_lng double precision,
  new_speed double precision DEFAULT NULL,
  new_heading double precision DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  tracking_id uuid;
  result JSON;
BEGIN
  -- Insert new tracking record
  INSERT INTO public.tracking (
    route_id,
    user_id,
    lat,
    lng,
    speed,
    heading,
    status
  ) VALUES (
    route_uuid,
    auth.uid(),
    new_lat,
    new_lng,
    new_speed,
    new_heading,
    'active'
  ) RETURNING id INTO tracking_id;

  -- Return the created tracking record
  SELECT json_build_object(
    'id', t.id,
    'lat', t.lat,
    'lng', t.lng,
    'speed', t.speed,
    'heading', t.heading,
    'status', t.status,
    'updated_at', t.updated_at
  ) INTO result
  FROM public.tracking t
  WHERE t.id = tracking_id;

  RETURN result;
END;
$$;

-- Create trigger to update routes updated_at
CREATE OR REPLACE FUNCTION public.update_routes_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_routes_updated_at
BEFORE UPDATE ON public.routes
FOR EACH ROW
EXECUTE FUNCTION public.update_routes_updated_at_column();

-- Create trigger to update tracking updated_at
CREATE OR REPLACE FUNCTION public.update_tracking_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tracking_updated_at
BEFORE UPDATE ON public.tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_tracking_updated_at_column();