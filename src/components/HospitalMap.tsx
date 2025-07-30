
import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, UserLocation } from '@/types/hospital';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEnhancedHospitalSearch } from '@/hooks/useEnhancedHospitalSearch';
import { 
  isGoogleMapsAvailable, 
  loadGoogleMapsScript, 
  createUserLocationMarker,
  createHospitalMarker
} from '@/utils/googleMapsUtils';
import MapLegend from './MapLegend';
import HospitalListCard from './HospitalListCard';

const HospitalMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  
  const { userLocation, locationError, isLoading, getCurrentLocation } = useGeolocation();
  
  // Get nearby hospitals based on user location
  const { hospitals } = useEnhancedHospitalSearch({
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    radius: 20, // 20km radius
  });

  const getDirections = (hospital: Hospital) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.lat},${hospital.lng}`;
      window.open(url, '_blank');
    }
  };

  const initializeMap = (position: UserLocation) => {
    if (!isGoogleMapsLoaded || !isGoogleMapsAvailable()) {
      console.log('Google Maps not loaded yet');
      return;
    }

    if (mapRef.current) {
      const googleMap = new (window as any).google.maps.Map(mapRef.current, {
        zoom: 14,
        center: position,
        styles: [
          {
            featureType: 'poi.medical',
            elementType: 'geometry',
            stylers: [{ color: '#ffeaa7' }]
          }
        ]
      });

      setMap(googleMap);

      // Add user location marker
      createUserLocationMarker(googleMap, position);

      // Add hospital markers
      hospitals.forEach((hospital) => {
        const hospitalForMarker: Hospital = {
          id: parseInt(hospital.id) || Math.random(),
          name: hospital.name,
          type: hospital.type,
          lat: hospital.latitude,
          lng: hospital.longitude,
          status: hospital.status,
          phone: hospital.contact,
          address: hospital.address || '',
          facilities: hospital.services || [],
        };
        createHospitalMarker(googleMap, hospitalForMarker, position, setSelectedHospital);
      });
    }
  };

  const handleLocationError = (position: UserLocation) => {
    if (mapRef.current && isGoogleMapsLoaded && isGoogleMapsAvailable()) {
      const googleMap = new (window as any).google.maps.Map(mapRef.current, {
        zoom: 12,
        center: position
      });
      setMap(googleMap);
    }
  };

  useEffect(() => {
    const initializeEverything = async () => {
      try {
        await loadGoogleMapsScript();
        setIsGoogleMapsLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Maps:', error);
      }
    };

    initializeEverything();
  }, []);

  useEffect(() => {
    if (userLocation && isGoogleMapsLoaded) {
      if (locationError) {
        handleLocationError(userLocation);
      } else {
        initializeMap(userLocation);
      }
    }
  }, [userLocation, isGoogleMapsLoaded, locationError]);

  useEffect(() => {
    if (map && userLocation) {
      map.setCenter(userLocation);
    }
  }, [map, userLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {locationError && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800">{locationError}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="relative">
            <div 
              ref={mapRef} 
              className="w-full h-96 lg:h-[500px] rounded-lg shadow-lg border"
            />
            <MapLegend />
          </div>
        </div>

        {/* Hospital List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Nearby Hospitals</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {hospitals.length > 0 ? (
              hospitals.map((hospital) => {
                const hospitalForCard: Hospital = {
                  id: parseInt(hospital.id) || Math.random(),
                  name: hospital.name,
                  type: hospital.type,
                  lat: hospital.latitude,
                  lng: hospital.longitude,
                  status: hospital.status,
                  phone: hospital.contact,
                  address: hospital.address || '',
                  facilities: hospital.services || [],
                };
                return (
                  <HospitalListCard
                    key={hospital.id}
                    hospital={hospitalForCard}
                    userLocation={userLocation}
                    onGetDirections={getDirections}
                  />
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No hospitals found in your area</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your location or check back later</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalMap;
