
import { Hospital, UserLocation } from '@/types/hospital';

// Type guard to check if Google Maps is available
export const isGoogleMapsAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof window.google !== 'undefined' && 
         typeof window.google.maps !== 'undefined';
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return '#10B981'; // Green
    case 'available': return '#F59E0B'; // Yellow
    case 'full': return '#EF4444'; // Red
    default: return '#6B7280'; // Gray
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'open': return 'Open';
    case 'available': return 'Available';
    case 'full': return 'Full';
    default: return 'Unknown';
  }
};

export const createUserLocationMarker = (map: any, position: UserLocation) => {
  return new (window as any).google.maps.Marker({
    position: position,
    map: map,
    title: 'Your Location',
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
          <circle cx="12" cy="12" r="3" fill="#ffffff"/>
        </svg>
      `),
      scaledSize: new (window as any).google.maps.Size(24, 24)
    }
  });
};

export const createHospitalMarker = (
  map: any, 
  hospital: Hospital, 
  userLocation: UserLocation,
  onMarkerClick: (hospital: Hospital) => void
) => {
  const marker = new (window as any).google.maps.Marker({
    position: { lat: hospital.lat, lng: hospital.lng },
    map: map,
    title: hospital.name,
    icon: {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${getStatusColor(hospital.status)}" stroke="#ffffff" stroke-width="2"/>
          <path d="M16 8v8m0 0v8m0-8h8m-8 0H8" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `),
      scaledSize: new (window as any).google.maps.Size(32, 32)
    }
  });

  const infoWindow = new (window as any).google.maps.InfoWindow({
    content: `
      <div style="padding: 8px; max-width: 250px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold;">${hospital.name}</h3>
        <p style="margin: 4px 0; color: #666;">${hospital.type}</p>
        <p style="margin: 4px 0;">
          <span style="color: ${getStatusColor(hospital.status)}; font-weight: bold;">
            ${getStatusText(hospital.status)}
          </span>
        </p>
        <p style="margin: 4px 0; font-size: 12px;">${hospital.address}</p>
        <button 
          onclick="window.open('https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.lat},${hospital.lng}', '_blank')"
          style="background: #3B82F6; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-top: 8px;"
        >
          Get Directions
        </button>
      </div>
    `
  });

  marker.addListener('click', () => {
    infoWindow.open(map, marker);
    onMarkerClick(hospital);
  });

  return marker;
};

export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    if (isGoogleMapsAvailable()) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'));
    };
    
    document.head.appendChild(script);
  });
};
