import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NavigationMapProps {
  onMapReady: (map: google.maps.Map) => void;
  userLocation: { lat: number; lng: number } | null;
  centerOnUser: boolean;
}

const NavigationMap = ({ onMapReady, userLocation, centerOnUser }: NavigationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      try {
        const defaultCenter = userLocation || { lat: 28.6139, lng: 77.209 };
        
        const map = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: defaultCenter,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        mapInstanceRef.current = map;
        onMapReady(map);
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setIsLoading(false);
      }
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          initMap();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkGoogle);
        if (!mapInstanceRef.current) {
          setError('Google Maps failed to load');
          setIsLoading(false);
        }
      }, 10000);
    }
  }, [onMapReady]);

  useEffect(() => {
    if (mapInstanceRef.current && userLocation && centerOnUser) {
      mapInstanceRef.current.panTo(userLocation);
    }
  }, [userLocation, centerOnUser]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default NavigationMap;
