
import { Hospital } from '@/types/hospital';

export const mockHospitals: Hospital[] = [
  {
    id: 1,
    name: 'City General Hospital',
    type: 'Government',
    lat: 28.6129,
    lng: 77.2295,
    status: 'open',
    phone: '+91-9876543210',
    address: '123 Main Street, New Delhi',
    facilities: ['Emergency', 'ICU', 'Surgery', 'Pharmacy']
  },
  {
    id: 2,
    name: 'MediCare Super Speciality',
    type: 'Private',
    lat: 28.6169,
    lng: 77.2090,
    status: 'available',
    phone: '+91-9876543211',
    address: '456 Health Avenue, New Delhi',
    facilities: ['Emergency', 'ICU', 'Surgery', 'Cardiology']
  },
  {
    id: 3,
    name: 'Community Health Center',
    type: 'NGO',
    lat: 28.6089,
    lng: 77.2295,
    status: 'full',
    phone: '+91-9876543212',
    address: '789 Community Road, New Delhi',
    facilities: ['Emergency', 'General Medicine', 'Pediatrics']
  },
  {
    id: 4,
    name: 'Sacred Heart Hospital',
    type: 'Private',
    lat: 28.6200,
    lng: 77.2100,
    status: 'open',
    phone: '+91-9876543213',
    address: '321 Care Street, New Delhi',
    facilities: ['Emergency', 'ICU', 'Surgery', 'Neurology']
  }
];
