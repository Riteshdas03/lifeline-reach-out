
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

// Default fallback coordinates (Bhubaneswar, India)
const DEFAULT_LOCATION = { lat: 20.2961, lng: 85.8245 };

export const useGeolocation = (): UseGeolocationReturn => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocationRef = useRef<UserLocation | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Throttle location updates
  const shouldUpdateLocation = (newLocation: UserLocation): boolean => {
    const now = Date.now();
    const timeDiff = now - lastUpdateTimeRef.current;
    
    // Update if no previous location or if 15 seconds have passed
    if (!lastLocationRef.current || timeDiff > 15000) {
      return true;
    }
    
    // Update if user moved more than 25 meters
    const distance = calculateDistance(
      lastLocationRef.current.lat,
      lastLocationRef.current.lng,
      newLocation.lat,
      newLocation.lng
    );
    
    return distance > 25;
  };

  const handleLocationError = (error: GeolocationPositionError) => {
    console.error('Geolocation error:', error);
    setIsLoading(false);
    
    // Clear timeout if set
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setLocationError("Location access denied. Using fallback location.");
        tryIPBasedLocation();
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationError("Location unavailable. Using fallback location.");
        tryIPBasedLocation();
        break;
      case error.TIMEOUT:
        setLocationError("Location request timed out. Using fallback location.");
        tryIPBasedLocation();
        break;
      default:
        setLocationError("Location error. Using fallback location.");
        tryIPBasedLocation();
        break;
    }
  };

  const tryIPBasedLocation = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (data.latitude && data.longitude && !data.error) {
        const position = {
          lat: data.latitude,
          lng: data.longitude
        };
        
        setUserLocation(position);
        setLocationError("Location detected using IP address (approximate)");
        console.log('IP-based location detected:', position);
        return;
      }
    } catch (error) {
      console.error('IP-based location failed:', error);
    }
    
    // Final fallback to default location
    setUserLocation(DEFAULT_LOCATION);
    setLocationError("Using default location (Bhubaneswar). Enable location for accuracy.");
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported. Using default location.');
      tryIPBasedLocation();
      return;
    }

    // Check if we're on HTTPS (required for geolocation on desktop)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setLocationError('HTTPS required for precise location. Using fallback.');
      tryIPBasedLocation();
      return;
    }

    setIsLoading(true);
    setLocationError('');

    // Set timeout for location request
    timeoutRef.current = setTimeout(() => {
      setLocationError('Location request timed out. Using fallback.');
      handleLocationError({ code: 3 } as GeolocationPositionError);
    }, 10000);

    // Get initial position with enhanced options
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          setLocationError('Invalid coordinates. Using fallback.');
          tryIPBasedLocation();
          return;
        }

        const userPos = { lat, lng };
        
        // Apply throttling
        if (shouldUpdateLocation(userPos)) {
          setUserLocation(userPos);
          lastLocationRef.current = userPos;
          lastUpdateTimeRef.current = Date.now();
          setLocationError('');
        }
        
        setIsLoading(false);
      },
      handleLocationError,
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000
      }
    );

    // Start watching position for real-time updates
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          const newPos = { lat, lng };
          
          // Apply throttling to watch position updates
          if (shouldUpdateLocation(newPos)) {
            setUserLocation(newPos);
            lastLocationRef.current = newPos;
            lastUpdateTimeRef.current = Date.now();
          }
        }
      },
      (error) => console.warn('Watch position error:', error),
      {
        enableHighAccuracy: false, // Less battery intensive
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();

    return () => {
      // Cleanup on unmount
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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
