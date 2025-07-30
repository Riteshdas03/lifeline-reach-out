
import { ApiHospital, ApiBloodBank, ApiDonor, ApiCamp, NearbySearchRequest, BloodBankSearchRequest, LocationResolveRequest, LocationResolveResponse } from '@/types/api';

// Mock Data
const mockHospitals: ApiHospital[] = [
  {
    _id: '1',
    name: 'City General Hospital',
    type: 'government',
    status: 'open',
    location: { lat: 28.6129, lng: 77.2295 },
    contact: '+91-9876543210',
    address: '123 Main Street, New Delhi',
    facilities: ['Emergency', 'ICU', 'Surgery', 'Pharmacy']
  },
  {
    _id: '2',
    name: 'MediCare Super Speciality',
    type: 'private',
    status: 'available',
    location: { lat: 28.6169, lng: 77.2090 },
    contact: '+91-9876543211',
    address: '456 Health Avenue, New Delhi',
    facilities: ['Emergency', 'ICU', 'Surgery', 'Cardiology']
  },
  {
    _id: '3',
    name: 'Community Health Center',
    type: 'NGO',
    status: 'full',
    location: { lat: 28.6089, lng: 77.2295 },
    contact: '+91-9876543212',
    address: '789 Community Road, New Delhi',
    facilities: ['Emergency', 'General Medicine', 'Pediatrics']
  }
];

const mockBloodBanks: ApiBloodBank[] = [
  {
    _id: '1',
    name: 'Central Blood Bank',
    bloodGroups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    location: { lat: 28.6139, lng: 77.2190 },
    contact: '+91-9876543220',
    address: '101 Blood Bank Road, New Delhi'
  },
  {
    _id: '2',
    name: 'Red Cross Blood Center',
    bloodGroups: ['O+', 'O-', 'A+', 'B+'],
    location: { lat: 28.6159, lng: 77.2090 },
    contact: '+91-9876543221',
    address: '202 Red Cross Street, New Delhi'
  }
];

const mockDonors: ApiDonor[] = [
  {
    _id: '1',
    name: 'John Doe',
    bloodGroup: 'O+',
    phone: '+91-9876543230',
    location: { lat: 28.6149, lng: 77.2195 },
    sosEnabled: true
  },
  {
    _id: '2',
    name: 'Jane Smith',
    bloodGroup: 'A+',
    phone: '+91-9876543231',
    location: { lat: 28.6119, lng: 77.2195 },
    sosEnabled: true
  }
];

const mockCamps: ApiCamp[] = [
  {
    _id: '1',
    name: 'Free Health Checkup Camp',
    type: 'checkup',
    date: '2024-07-15',
    location: { lat: 28.6179, lng: 77.2095 },
    contact: '+91-9876543240',
    address: '301 Community Center, New Delhi'
  },
  {
    _id: '2',
    name: 'COVID Vaccination Drive',
    type: 'vaccine',
    date: '2024-07-20',
    location: { lat: 28.6099, lng: 77.2195 },
    contact: '+91-9876543241',
    address: '401 School Ground, New Delhi'
  }
];

// Utility function to calculate distance between two points
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiService {
  // Hospital APIs
  static async getHospitals(): Promise<ApiHospital[]> {
    await delay(300);
    return mockHospitals;
  }

  static async getNearbyHospitals(request: NearbySearchRequest): Promise<ApiHospital[]> {
    await delay(500);
    return mockHospitals.filter(hospital => {
      const distance = calculateDistance(
        request.lat, request.lng,
        hospital.location.lat, hospital.location.lng
      );
      return distance <= request.radius;
    });
  }

  // Blood Bank APIs
  static async getBloodBanks(): Promise<ApiBloodBank[]> {
    await delay(300);
    return mockBloodBanks;
  }

  static async searchBloodBanks(request: BloodBankSearchRequest): Promise<ApiBloodBank[]> {
    await delay(500);
    const radius = request.radius || 10;
    return mockBloodBanks.filter(bloodBank => {
      const hasBloodGroup = bloodBank.bloodGroups.includes(request.bloodGroup);
      const distance = calculateDistance(
        request.lat, request.lng,
        bloodBank.location.lat, bloodBank.location.lng
      );
      return hasBloodGroup && distance <= radius;
    });
  }

  // Donor APIs
  static async registerDonor(donor: Omit<ApiDonor, '_id'>): Promise<ApiDonor> {
    await delay(400);
    const newDonor = { ...donor, _id: Date.now().toString() };
    mockDonors.push(newDonor);
    return newDonor;
  }

  static async getDonors(): Promise<ApiDonor[]> {
    await delay(300);
    return mockDonors;
  }

  // Camp APIs
  static async getCamps(): Promise<ApiCamp[]> {
    await delay(300);
    return mockCamps;
  }

  // Emergency API
  static async getEmergencyHospital(lat: number, lng: number): Promise<ApiHospital | null> {
    await delay(200);
    const openHospitals = mockHospitals.filter(h => h.status === 'open');
    if (openHospitals.length === 0) return null;

    // Find nearest open hospital
    let nearest = openHospitals[0];
    let minDistance = calculateDistance(lat, lng, nearest.location.lat, nearest.location.lng);

    for (const hospital of openHospitals) {
      const distance = calculateDistance(lat, lng, hospital.location.lat, hospital.location.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = hospital;
      }
    }

    return nearest;
  }

  // Location Resolve API
  static async resolveLocation(request: LocationResolveRequest): Promise<LocationResolveResponse> {
    await delay(600);
    const radius = request.radius || 5;
    
    const nearbyHospitals = mockHospitals.filter(hospital => {
      const distance = calculateDistance(
        request.lat, request.lng,
        hospital.location.lat, hospital.location.lng
      );
      return distance <= radius;
    });

    const nearbyBloodBanks = mockBloodBanks.filter(bloodBank => {
      const distance = calculateDistance(
        request.lat, request.lng,
        bloodBank.location.lat, bloodBank.location.lng
      );
      return distance <= radius;
    });

    return {
      hospitals: nearbyHospitals,
      bloodBanks: nearbyBloodBanks
    };
  }
}
