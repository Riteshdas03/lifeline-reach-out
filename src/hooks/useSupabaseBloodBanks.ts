import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type BloodBank = Tables<'blood_banks'>;
type Donor = Tables<'donors'>;

interface UseBloodBanksParams {
  userLat?: number;
  userLng?: number;
  radius?: number;
  bloodGroup?: string;
}

export const useSupabaseBloodBanks = (params: UseBloodBanksParams = {}) => {
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBloodBanks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('blood_banks').select('*');
      
      const { data, error: fetchError } = await query.order('name');
      
      if (fetchError) throw fetchError;
      
      if (data) {
        let filteredData = data;
        
        // Filter by blood group if specified
        if (params.bloodGroup) {
          filteredData = data.filter(bank => 
            bank.blood_groups.includes(params.bloodGroup!)
          );
        }
        
        // If user location is provided, sort by distance and apply radius filter
        if (params.userLat && params.userLng) {
          filteredData = filteredData
            .map(bank => ({
              ...bank,
              distance: calculateDistance(
                params.userLat!,
                params.userLng!,
                bank.latitude,
                bank.longitude
              )
            }))
            .filter(bank => {
              if (params.radius) {
                return bank.distance <= params.radius;
              }
              return true;
            })
            .sort((a, b) => a.distance - b.distance);
        }
        
        setBloodBanks(filteredData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blood banks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodBanks();
  }, [params.bloodGroup, params.userLat, params.userLng, params.radius]);

  return {
    bloodBanks,
    loading,
    error,
    refetch: fetchBloodBanks
  };
};

export const useSupabaseDonors = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDonors = async (bloodGroup?: string, userLat?: number, userLng?: number, radius: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('donors').select('*').eq('sos_enabled', true);
      
      if (bloodGroup) {
        query = query.eq('blood_group', bloodGroup);
      }
      
      const { data, error: fetchError } = await query.order('name');
      
      if (fetchError) throw fetchError;
      
      if (data) {
        let filteredData = data;
        
        // If user location is provided, filter by radius and sort by distance
        if (userLat && userLng) {
          filteredData = data
            .map(donor => ({
              ...donor,
              distance: calculateDistance(userLat, userLng, donor.latitude, donor.longitude)
            }))
            .filter(donor => donor.distance <= radius)
            .sort((a, b) => a.distance - b.distance);
        }
        
        setDonors(filteredData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  };

  const registerDonor = async (donorData: Omit<Donor, 'id' | 'created_at' | 'updated_at' | 'last_donation_date' | 'user_id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authentication required to register as donor');
      }

      const { data, error: insertError } = await supabase
        .from('donors')
        .insert([{ ...donorData, user_id: user.id }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register donor');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    donors,
    loading,
    error,
    fetchDonors,
    registerDonor
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