import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Hospital = Tables<'hospitals'>;

interface UseHospitalsParams {
  userLat?: number;
  userLng?: number;
  radius?: number;
  type?: string;
  status?: string;
}

export const useSupabaseHospitals = (params: UseHospitalsParams = {}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('hospitals').select('*');
      
      // Apply filters
      if (params.type && params.type !== 'all') {
        query = query.eq('type', params.type as any);
      }
      
      if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status as any);
      }
      
      const { data, error: fetchError } = await query.order('name');
      
      if (fetchError) throw fetchError;
      
      if (data) {
        let sortedData = data;
        
        // If user location is provided, sort by distance
        if (params.userLat && params.userLng) {
          sortedData = data
            .map(hospital => ({
              ...hospital,
              distance: calculateDistance(
                params.userLat!,
                params.userLng!,
                hospital.latitude,
                hospital.longitude
              )
            }))
            .filter(hospital => {
              // Apply radius filter if specified
              if (params.radius) {
                return hospital.distance <= params.radius;
              }
              return true;
            })
            .sort((a, b) => a.distance - b.distance);
        }
        
        setHospitals(sortedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  const getNearestEmergencyHospital = async (userLat: number, userLng: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('hospitals')
        .select('*')
        .eq('status', 'open')
        .order('name');
      
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        // Find the nearest open hospital
        const hospitalsWithDistance = data.map(hospital => ({
          ...hospital,
          distance: calculateDistance(userLat, userLng, hospital.latitude, hospital.longitude)
        }));
        
        const nearest = hospitalsWithDistance.reduce((prev, current) => 
          prev.distance < current.distance ? prev : current
        );
        
        return nearest;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emergency hospital');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [params.type, params.status, params.userLat, params.userLng, params.radius]);

  return {
    hospitals,
    loading,
    error,
    refetch: fetchHospitals,
    getNearestEmergencyHospital
  };
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};