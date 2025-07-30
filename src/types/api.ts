
// API Types for MediReach Backend Integration

export interface ApiHospital {
  _id: string;
  name: string;
  type: 'government' | 'private' | 'NGO';
  status: 'open' | 'full' | 'available';
  location: {
    lat: number;
    lng: number;
  };
  contact: string;
  address: string;
  facilities: string[];
}

export interface ApiBloodBank {
  _id: string;
  name: string;
  bloodGroups: string[];
  location: {
    lat: number;
    lng: number;
  };
  contact: string;
  address: string;
}

export interface ApiDonor {
  _id: string;
  name: string;
  bloodGroup: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  sosEnabled: boolean;
}

export interface ApiCamp {
  _id: string;
  name: string;
  type: 'vaccine' | 'medicine' | 'checkup' | 'awareness';
  date: string;
  location: {
    lat: number;
    lng: number;
  };
  contact: string;
  address: string;
}

export interface NearbySearchRequest {
  lat: number;
  lng: number;
  radius: number; // in kilometers
}

export interface BloodBankSearchRequest {
  bloodGroup: string;
  lat: number;
  lng: number;
  radius?: number;
}

export interface LocationResolveRequest {
  lat: number;
  lng: number;
  radius?: number;
}

export interface LocationResolveResponse {
  hospitals: ApiHospital[];
  bloodBanks: ApiBloodBank[];
}
