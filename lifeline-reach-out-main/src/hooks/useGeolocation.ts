
import { useState, useEffect, useRef } from 'react';
import { UserLocation } from '@/types/hospital';

interface UseGeolocationReturn {
  userLocation: UserLocation | null;
  latitude: number | null;
  longitude: number | null;
  locationError: string;
  error: string;
  isLoading: boolean;
  loading: boolean;
  getCurrentLocation: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);

  const handleLocationError = (error: GeolocationPositionError) => {
    console.error('Geolocation error:', error);
    setIsLoading(false);
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationError("Location access denied. Please enable location permissions and try again.");
        // Try IP-based fallback for desktop
        tryIPBasedLocation();
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationError("Location information is unavailable. Trying alternative method...");
        tryIPBasedLocation();
        break;
      case error.TIMEOUT:
        setLocationError("Location request timed out. Trying alternative method...");
        tryIPBasedLocation();
        break;
      default:
        setLocationError("An unknown error occurred while retrieving location.");
        tryIPBasedLocation();
        break;
    }
  };

  const tryIPBasedLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const position = {
          lat: data.latitude,
          lng: data.longitude
        };
        
        setUserLocation(position);
        setLocationError("Location detected using your IP address (approximate)");
        
        console.log('IP-based location detected:', position);
      }
    } catch (error) {
      console.error('IP-based location failed:', error);
      setLocationError("Unable to detect location. Please enable location permissions or enter your location manually.");
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('❌ Geolocation not supported by your browser.');
      setIsLoading(false);
      return;
    }

    // Check if we're on HTTPS (required for geolocation on desktop)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setLocationError('🔒 HTTPS required for location access. Please use a secure connection.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLocationError('');

    // Get initial position with enhanced options
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Validate coordinates are within valid bounds
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          setLocationError('❌ Invalid location coordinates received.');
          setIsLoading(false);
          return;
        }

        const userPos = { lat, lng };
        setUserLocation(userPos);
        setLocationError('');
        setIsLoading(false);
      },
      handleLocationError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );

    // Start watching position for real-time updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Validate coordinates
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          const newPos = { lat, lng };
          setUserLocation(newPos);
        }
      },
      (error) => console.warn('Watch position error:', error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { 
    userLocation, 
    latitude: userLocation?.lat || null,
    longitude: userLocation?.lng || null,
    locationError, 
    error: locationError,
    isLoading, 
    loading: isLoading,
    getCurrentLocation 
  };
};
