
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '@/services/apiService';
import { ApiHospital, ApiBloodBank, ApiDonor, ApiCamp, NearbySearchRequest, BloodBankSearchRequest, LocationResolveRequest } from '@/types/api';

// Hospital hooks
export const useHospitals = () => {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: ApiService.getHospitals,
  });
};

export const useNearbyHospitals = (request: NearbySearchRequest | null) => {
  return useQuery({
    queryKey: ['hospitals', 'nearby', request],
    queryFn: () => request ? ApiService.getNearbyHospitals(request) : Promise.resolve([]),
    enabled: !!request,
  });
};

// Blood Bank hooks
export const useBloodBanks = () => {
  return useQuery({
    queryKey: ['bloodBanks'],
    queryFn: ApiService.getBloodBanks,
  });
};

export const useBloodBankSearch = (request: BloodBankSearchRequest | null) => {
  return useQuery({
    queryKey: ['bloodBanks', 'search', request],
    queryFn: () => request ? ApiService.searchBloodBanks(request) : Promise.resolve([]),
    enabled: !!request,
  });
};

// Donor hooks
export const useDonors = () => {
  return useQuery({
    queryKey: ['donors'],
    queryFn: ApiService.getDonors,
  });
};

export const useRegisterDonor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (donor: Omit<ApiDonor, '_id'>) => ApiService.registerDonor(donor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donors'] });
    },
  });
};

// Camp hooks
export const useCamps = () => {
  return useQuery({
    queryKey: ['camps'],
    queryFn: ApiService.getCamps,
  });
};

// Emergency hook
export const useEmergencyHospital = (lat: number | null, lng: number | null) => {
  return useQuery({
    queryKey: ['emergency', lat, lng],
    queryFn: () => lat && lng ? ApiService.getEmergencyHospital(lat, lng) : Promise.resolve(null),
    enabled: !!(lat && lng),
  });
};

// Location resolve hook
export const useLocationResolve = (request: LocationResolveRequest | null) => {
  return useQuery({
    queryKey: ['location', 'resolve', request],
    queryFn: () => request ? ApiService.resolveLocation(request) : Promise.resolve({ hospitals: [], bloodBanks: [] }),
    enabled: !!request,
  });
};
