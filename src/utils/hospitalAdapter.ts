import { Tables } from '@/integrations/supabase/types';
import { Hospital } from '@/types/hospital';

type SupabaseHospital = Tables<'hospitals'>;

// Adapter to convert Supabase hospital data to component Hospital type
export const adaptSupabaseHospital = (supabaseHospital: SupabaseHospital): Hospital => {
  return {
    id: parseInt(supabaseHospital.id) || 0,
    name: supabaseHospital.name,
    type: supabaseHospital.type,
    lat: supabaseHospital.latitude,
    lng: supabaseHospital.longitude,
    status: supabaseHospital.status as 'open' | 'available' | 'full',
    phone: supabaseHospital.contact,
    address: supabaseHospital.address || '',
    facilities: supabaseHospital.services || []
  };
};

// Adapter to convert array of Supabase hospitals
export const adaptSupabaseHospitals = (supabaseHospitals: SupabaseHospital[]): Hospital[] => {
  return supabaseHospitals.map(adaptSupabaseHospital);
};