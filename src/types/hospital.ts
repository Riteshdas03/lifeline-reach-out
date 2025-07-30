
export interface Hospital {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  status: 'open' | 'available' | 'full';
  phone: string;
  address: string;
  facilities: string[];
}

export interface UserLocation {
  lat: number;
  lng: number;
}
