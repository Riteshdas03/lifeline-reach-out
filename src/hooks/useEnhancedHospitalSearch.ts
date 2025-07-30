import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedHospital {
  id: string;
  name: string;
  address: string | null;
  contact: string;
  latitude: number;
  longitude: number;
  type: 'government' | 'private' | 'ngo';
  status: 'open' | 'available' | 'full';
  services: string[] | null;
  distance_km?: number;
}

interface UseEnhancedHospitalSearchParams {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  radius?: number;
  type?: string;
}

export const useEnhancedHospitalSearch = (params: UseEnhancedHospitalSearchParams = {}) => {
  const [hospitals, setHospitals] = useState<EnhancedHospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHospitals = async () => {
    const { searchQuery, userLat, userLng, radius = 20, type } = params;
    
    if (!userLat || !userLng) {
      // Fallback to basic text search if no location
      if (searchQuery && searchQuery.trim().length >= 2) {
        await searchByText();
      } else {
        await fetchAllHospitals();
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.rpc('get_nearby_hospitals_enhanced', {
        lat: userLat,
        lng: userLng,
        radius: radius,
        search_query: searchQuery || null,
        hospital_type: type && type !== 'all' ? type : null
      });

      if (supabaseError) throw supabaseError;

      setHospitals(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search hospitals');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const searchByText = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('hospitals')
        .select('*');

      if (params.searchQuery) {
        query = query.or(`name.ilike.%${params.searchQuery}%,address.ilike.%${params.searchQuery}%`);
      }

      if (params.type && params.type !== 'all') {
        query = query.eq('type', params.type as 'government' | 'private' | 'ngo');
      }

      const { data, error: supabaseError } = await query.limit(50);

      if (supabaseError) throw supabaseError;

      setHospitals(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search hospitals');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllHospitals = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('hospitals')
        .select('*')
        .limit(50);

      if (params.type && params.type !== 'all') {
        query = query.eq('type', params.type as 'government' | 'private' | 'ngo');
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setHospitals(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hospitals');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchHospitals();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [params.searchQuery, params.userLat, params.userLng, params.radius, params.type]);

  return {
    hospitals,
    loading,
    error,
    searchHospitals,
    refetch: searchHospitals
  };
};