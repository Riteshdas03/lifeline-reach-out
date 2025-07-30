
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertCircle, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, UserLocation } from '@/types/hospital';
import { mockHospitals } from '@/data/mockHospitals';
import { useGeolocation } from '@/hooks/useGeolocation';
import MapLegend from './MapLegend';
import HospitalListCard from './HospitalListCard';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LeafletMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  
  const { userLocation, locationError, isLoading, getCurrentLocation } = useGeolocation();

  const getDirections = (hospital: Hospital) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.lat},${hospital.lng}`;
      window.open(url, '_blank');
    }
  };

  const createUserLocationMarker = (leafletMap: L.Map, position: UserLocation) => {
    const userIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            background-color: #3b82f6; 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            animation: pulse-location 2s infinite;
          "></div>
          <style>
            @keyframes pulse-location {
              0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
              100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
            }
          </style>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: 'user-location-marker'
    });

    L.marker([position.lat, position.lng], { icon: userIcon })
      .addTo(leafletMap)
      .bindPopup('📍 You are here! Location detected successfully.')
      .openPopup();
  };

  const createHospitalMarker = (leafletMap: L.Map, hospital: Hospital) => {
    const statusColors = {
      open: '#22c55e',
      available: '#eab308', 
      full: '#ef4444'
    };

    const hospitalIcon = L.divIcon({
      html: `
        <div style="
          background-color: ${statusColors[hospital.status]}; 
          width: 24px; 
          height: 24px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: white; 
          font-weight: bold; 
          font-size: 12px;
          animation: bounce-pin 2s infinite;
          cursor: pointer;
        ">🏥</div>
        <style>
          @keyframes bounce-pin {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
        </style>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: 'hospital-marker'
    });

    const marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
      .addTo(leafletMap);

    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${hospital.name}</h3>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${hospital.type}</p>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${hospital.address}</p>
        <div style="margin: 8px 0; padding: 4px 8px; background-color: ${statusColors[hospital.status]}; color: white; border-radius: 4px; display: inline-block; font-size: 12px; font-weight: bold;">
          ${hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
        </div>
        <div style="margin-top: 8px; display: flex; gap: 8px;">
          <button onclick="window.open('tel:${hospital.phone}', '_self')" style="padding: 4px 8px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Call</button>
          <button onclick="window.open('https://www.google.com/maps/dir/${userLocation?.lat || 0},${userLocation?.lng || 0}/${hospital.lat},${hospital.lng}', '_blank')" style="padding: 4px 8px; background-color: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Directions</button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    marker.on('click', () => {
      setSelectedHospital(hospital);
    });

    return marker;
  };

  const initializeMap = (position: UserLocation) => {
    if (mapRef.current) {
      const leafletMap = L.map(mapRef.current).setView([position.lat, position.lng], 14);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(leafletMap);

      setMap(leafletMap);

      // Add user location marker
      createUserLocationMarker(leafletMap, position);

      // Add hospital markers
      mockHospitals.forEach((hospital) => {
        createHospitalMarker(leafletMap, hospital);
      });

      return leafletMap;
    }
    return null;
  };

  useEffect(() => {
    if (userLocation && mapRef.current && !map) {
      initializeMap(userLocation);
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (map && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14);
    }
  }, [map, userLocation]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 font-medium">🗺️ Loading your location...</p>
            <p className="text-sm text-gray-500">Please allow location access for best experience</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {locationError && (
        <Card className="border-amber-200 bg-amber-50 animate-in fade-in-50 slide-in-from-top-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-amber-800 font-medium">Location Access Issue</p>
                <p className="text-amber-700 text-sm">{locationError}</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={getCurrentLocation}
                >
                  Try Again
                </Button>
              </div>
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
              className="w-full h-96 lg:h-[500px] rounded-lg shadow-lg border z-0"
            />
            <MapLegend />
          </div>
        </div>

        {/* Hospital List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Nearby Hospitals</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {mockHospitals.map((hospital) => (
              <HospitalListCard
                key={hospital.id}
                hospital={hospital}
                userLocation={userLocation}
                onGetDirections={getDirections}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
