
import { ApiHospital, ApiBloodBank, ApiDonor, ApiCamp, NearbySearchRequest, BloodBankSearchRequest, LocationResolveRequest, LocationResolveResponse } from '@/types/api';

// Configuration for real backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class RealApiService {
  private static async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Hospital APIs
  static async getHospitals(): Promise<ApiHospital[]> {
    return this.makeRequest<ApiHospital[]>('/hospitals');
  }

  static async getNearbyHospitals(request: NearbySearchRequest): Promise<ApiHospital[]> {
    return this.makeRequest<ApiHospital[]>('/hospitals/nearby', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Blood Bank APIs
  static async getBloodBanks(): Promise<ApiBloodBank[]> {
    return this.makeRequest<ApiBloodBank[]>('/blood-banks');
  }

  static async searchBloodBanks(request: BloodBankSearchRequest): Promise<ApiBloodBank[]> {
    return this.makeRequest<ApiBloodBank[]>('/blood-banks/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Donor APIs
  static async registerDonor(donor: Omit<ApiDonor, '_id'>): Promise<ApiDonor> {
    return this.makeRequest<ApiDonor>('/donors/register', {
      method: 'POST',
      body: JSON.stringify(donor),
    });
  }

  static async getDonors(): Promise<ApiDonor[]> {
    return this.makeRequest<ApiDonor[]>('/donors');
  }

  // Camp APIs
  static async getCamps(): Promise<ApiCamp[]> {
    return this.makeRequest<ApiCamp[]>('/camps');
  }

  // Emergency API
  static async getEmergencyHospital(lat: number, lng: number): Promise<ApiHospital | null> {
    return this.makeRequest<ApiHospital | null>(`/emergency?lat=${lat}&lng=${lng}`);
  }

  // Location Resolve API
  static async resolveLocation(request: LocationResolveRequest): Promise<LocationResolveResponse> {
    return this.makeRequest<LocationResolveResponse>('/location/resolve', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export { RealApiService };
