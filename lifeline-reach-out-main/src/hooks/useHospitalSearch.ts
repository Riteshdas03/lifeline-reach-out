import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Hospital {
  id: string;
  name: string;
  address: string | null;
  contact: string;
  latitude: number;
  longitude: number;
  type: 'government' | 'private' | 'ngo';
  status: 'open' | 'available' | 'full';
  services: string[] | null;
  distance?: number;
}

interface UseHospitalSearchParams {
  searchQuery?: string;
  userLat?: number;
  userLng?: number;
  radius?: number;
  type?: string;
}

export const useHospitalSearch = (params: UseHospitalSearchParams = {}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchHospitals = async () => {
    const { searchQuery, userLat, userLng, radius, type } = params;
    
    if (!searchQuery || searchQuery.trim().length < 2) {
      // If no search query, use location-based search
      if (userLat && userLng) {
        fetchNearbyHospitals();
      } else {
        fetchAllHospitals();
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('hospitals')
        .select('*');

      // Add text search for hospital name or address
      query = query.or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);

      // Add type filter if specified
      if (type && type !== 'all') {
        query = query.eq('type', type as any);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      let results = data || [];

      // Calculate distances if user location is available
      if (userLat && userLng && results.length > 0) {
        results = results.map((hospital: any) => ({
          ...hospital,
          distance: calculateDistance(userLat, userLng, hospital.latitude, hospital.longitude)
        }));

        // Filter by radius if specified
        if (radius) {
          results = results.filter((hospital: any) => (hospital.distance || 0) <= radius);
        }

        // Sort by distance
        results.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
      }

      setHospitals(results);
    } catch (err: any) {
      setError(err.message || 'Failed to search hospitals');
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyHospitals = async () => {
    const { userLat, userLng, radius = 10, type } = params;

    if (!userLat || !userLng) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.rpc('get_nearby_hospitals', {
        lat: userLat,
        lng: userLng,
        radius: radius
      });

      if (supabaseError) throw supabaseError;

      let results = data || [];

      // Filter by type if specified
      if (type && type !== 'all') {
        results = results.filter((hospital: any) => hospital.type === type);
      }

      setHospitals(results.map((hospital: any) => ({
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        contact: hospital.contact,
        latitude: hospital.latitude,
        longitude: hospital.longitude,
        type: hospital.type,
        status: hospital.status,
        services: hospital.services,
        distance: hospital.distance_km
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch nearby hospitals');
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
        query = query.eq('type', params.type as any);
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

  // Calculate distance between two coordinates (Haversine formula)
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

  useEffect(() => {
    searchHospitals();
  }, [params.searchQuery, params.userLat, params.userLng, params.radius, params.type]);

  return {
    hospitals,
    loading,
    error,
    searchHospitals,
    refetch: searchHospitals
  };
};