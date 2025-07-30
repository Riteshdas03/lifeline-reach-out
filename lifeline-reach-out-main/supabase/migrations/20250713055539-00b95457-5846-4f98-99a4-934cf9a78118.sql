-- Enable PostGIS extension for location-based queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create ENUM types for better data integrity
CREATE TYPE hospital_type AS ENUM ('government', 'private', 'ngo');
CREATE TYPE hospital_status AS ENUM ('open', 'full', 'available');
CREATE TYPE camp_type AS ENUM ('vaccine', 'medicine', 'eye', 'dental', 'general', 'cardiology', 'diabetes');

-- Create hospitals table
CREATE TABLE public.hospitals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type hospital_type NOT NULL,
    status hospital_status NOT NULL DEFAULT 'available',
    latitude FLOAT NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude FLOAT NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    contact TEXT NOT NULL,
    address TEXT,
    services TEXT[], -- Array of available services
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blood_banks table
CREATE TABLE public.blood_banks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    blood_groups TEXT[] NOT NULL DEFAULT '{}', -- Array of available blood groups
    latitude FLOAT NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude FLOAT NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    contact TEXT NOT NULL,
    address TEXT,
    operating_hours TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donors table  
CREATE TABLE public.donors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    latitude FLOAT NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude FLOAT NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    phone TEXT NOT NULL,
    sos_enabled BOOLEAN NOT NULL DEFAULT false,
    last_donation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create camps table
CREATE TABLE public.camps (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type camp_type NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    latitude FLOAT NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude FLOAT NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    contact TEXT NOT NULL,
    address TEXT,
    organizer TEXT,
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    services TEXT[], -- Array of services offered
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance on location-based queries
CREATE INDEX idx_hospitals_location ON public.hospitals (latitude, longitude);
CREATE INDEX idx_hospitals_status ON public.hospitals (status);
CREATE INDEX idx_hospitals_type ON public.hospitals (type);

CREATE INDEX idx_blood_banks_location ON public.blood_banks (latitude, longitude);
CREATE INDEX idx_blood_banks_blood_groups ON public.blood_banks USING GIN(blood_groups);

CREATE INDEX idx_donors_location ON public.donors (latitude, longitude);
CREATE INDEX idx_donors_blood_group ON public.donors (blood_group);
CREATE INDEX idx_donors_sos ON public.donors (sos_enabled);

CREATE INDEX idx_camps_location ON public.camps (latitude, longitude);
CREATE INDEX idx_camps_date ON public.camps (date);
CREATE INDEX idx_camps_type ON public.camps (type);

-- Enable Row Level Security on all tables
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public can view hospitals" 
ON public.hospitals 
FOR SELECT 
USING (true);

CREATE POLICY "Public can view blood banks" 
ON public.blood_banks 
FOR SELECT 
USING (true);

CREATE POLICY "Public can view donors" 
ON public.donors 
FOR SELECT 
USING (true);

CREATE POLICY "Public can view camps" 
ON public.camps 
FOR SELECT 
USING (true);

-- Create RLS policies for public insert on donors only
CREATE POLICY "Public can register as donors" 
ON public.donors 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hospitals_updated_at
    BEFORE UPDATE ON public.hospitals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_banks_updated_at
    BEFORE UPDATE ON public.blood_banks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donors_updated_at
    BEFORE UPDATE ON public.donors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_camps_updated_at
    BEFORE UPDATE ON public.camps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate distance between two points (in kilometers)
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 FLOAT,
    lon1 FLOAT,
    lat2 FLOAT,
    lon2 FLOAT
)
RETURNS FLOAT AS $$
BEGIN
    RETURN (
        6371 * acos(
            cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
            sin(radians(lat1)) * sin(radians(lat2))
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Insert sample data for testing

-- Sample hospitals
INSERT INTO public.hospitals (name, type, status, latitude, longitude, contact, address, services) VALUES
('City General Hospital', 'government', 'open', 28.6139, 77.2090, '+91-11-23456789', 'Delhi, India', ARRAY['Emergency', 'Surgery', 'ICU', 'Cardiology']),
('Apollo Hospital', 'private', 'available', 28.6129, 77.2295, '+91-11-23456790', 'Sarita Vihar, Delhi', ARRAY['Emergency', 'Surgery', 'ICU', 'Cardiology', 'Neurology']),
('Max Healthcare', 'private', 'full', 28.5355, 77.3910, '+91-11-23456791', 'Gurgaon, Haryana', ARRAY['Emergency', 'Surgery', 'ICU']),
('Community Health Center', 'ngo', 'open', 28.7041, 77.1025, '+91-11-23456792', 'Rohini, Delhi', ARRAY['General Medicine', 'Pediatrics', 'OPD']),
('AIIMS Hospital', 'government', 'available', 28.5672, 77.2100, '+91-11-26588500', 'Ansari Nagar, Delhi', ARRAY['Emergency', 'Surgery', 'ICU', 'Cardiology', 'Neurology', 'Oncology']);

-- Sample blood banks
INSERT INTO public.blood_banks (name, blood_groups, latitude, longitude, contact, address, operating_hours) VALUES
('Red Cross Blood Bank', ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 28.6139, 77.2090, '+91-11-23456793', 'Red Cross Bhawan, Delhi', '24/7'),
('Rotary Blood Bank', ARRAY['A+', 'B+', 'O+', 'AB+'], 28.6329, 77.2195, '+91-11-23456794', 'Connaught Place, Delhi', '9 AM - 6 PM'),
('Lions Blood Bank', ARRAY['A+', 'A-', 'B+', 'O+', 'O-'], 28.5355, 77.3910, '+91-11-23456795', 'Sector 14, Gurgaon', '8 AM - 8 PM'),
('Community Blood Center', ARRAY['B+', 'B-', 'AB+', 'O+'], 28.7041, 77.1025, '+91-11-23456796', 'Pitampura, Delhi', '10 AM - 5 PM');

-- Sample donors
INSERT INTO public.donors (name, blood_group, latitude, longitude, phone, sos_enabled, last_donation_date) VALUES
('Rahul Sharma', 'A+', 28.6139, 77.2090, '+91-9876543210', true, '2024-10-15'),
('Priya Singh', 'O-', 28.6329, 77.2195, '+91-9876543211', true, '2024-11-20'),
('Amit Kumar', 'B+', 28.5355, 77.3910, '+91-9876543212', false, '2024-09-10'),
('Sunita Devi', 'AB+', 28.7041, 77.1025, '+91-9876543213', true, '2024-12-01'),
('Vikash Gupta', 'O+', 28.5672, 77.2100, '+91-9876543214', true, '2024-11-05');

-- Sample camps
INSERT INTO public.camps (name, type, date, start_time, end_time, latitude, longitude, contact, address, organizer, capacity, services) VALUES
('Free Eye Checkup Camp', 'eye', '2025-01-20', '09:00', '17:00', 28.6139, 77.2090, '+91-11-23456797', 'Community Center, Lajpat Nagar', 'Delhi Eye Foundation', 200, ARRAY['Eye Examination', 'Free Glasses', 'Cataract Surgery Consultation']),
('COVID Vaccination Drive', 'vaccine', '2025-01-18', '10:00', '16:00', 28.6329, 77.2195, '+91-11-23456798', 'School Ground, CP', 'Health Ministry', 500, ARRAY['COVID Vaccine', 'Health Checkup']),
('Free Medicine Distribution', 'medicine', '2025-01-25', '08:00', '14:00', 28.5355, 77.3910, '+91-11-23456799', 'Gurgaon Community Hall', 'Rotary Club Gurgaon', 300, ARRAY['General Medicines', 'Diabetes Care', 'BP Medicines']),
('Dental Care Camp', 'dental', '2025-02-01', '09:00', '15:00', 28.7041, 77.1025, '+91-11-23456800', 'Rohini Sector 10', 'Smile Foundation', 150, ARRAY['Dental Checkup', 'Cleaning', 'Basic Treatment']),
('Heart Health Screening', 'cardiology', '2025-02-05', '08:00', '12:00', 28.5672, 77.2100, '+91-11-23456801', 'AIIMS Campus', 'Cardiology Society', 100, ARRAY['ECG', 'BP Monitoring', 'Cholesterol Test']);