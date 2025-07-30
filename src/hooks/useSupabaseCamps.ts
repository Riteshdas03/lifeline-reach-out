import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Camp = Tables<'camps'>;

interface UseCampsParams {
  userLat?: number;
  userLng?: number;
  radius?: number;
  type?: string;
}

export const useSupabaseCamps = (params: UseCampsParams = {}) => {
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCamps = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('camps')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0]); // Only future camps
      
      // Apply type filter
      if (params.type && params.type !== 'all') {
        query = query.eq('type', params.type as any);
      }
      
      const { data, error: fetchError } = await query.order('date', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      if (data) {
        let filteredData = data;
        
        // If user location is provided, sort by distance and apply radius filter
        if (params.userLat && params.userLng) {
          filteredData = data
            .map(camp => ({
              ...camp,
              distance: calculateDistance(
                params.userLat!,
                params.userLng!,
                camp.latitude,
                camp.longitude
              )
            }))
            .filter(camp => {
              if (params.radius) {
                return camp.distance <= params.radius;
              }
              return true;
            })
            .sort((a, b) => a.distance - b.distance);
        }
        
        setCamps(filteredData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch camps');
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingCamps = async (userLat?: number, userLng?: number, hours: number = 24) => {
    setLoading(true);
    setError(null);
    
    try {
      const tomorrow = new Date();
      tomorrow.setHours(tomorrow.getHours() + hours);
      
      const { data, error: fetchError } = await supabase
        .from('camps')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .lte('date', tomorrow.toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      if (data && userLat && userLng) {
        // Add distance and sort by proximity
        const campsWithDistance = data.map(camp => ({
          ...camp,
          distance: calculateDistance(userLat, userLng, camp.latitude, camp.longitude)
        }));
        
        return campsWithDistance.sort((a, b) => a.distance - b.distance);
      }
      
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming camps');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, [params.type, params.userLat, params.userLng, params.radius]);

  return {
    camps,
    loading,
    error,
    refetch: fetchCamps,
    getUpcomingCamps
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