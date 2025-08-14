
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { AlertCircle, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hospital, UserLocation } from '@/types/hospital';
import { Tables } from '@/integrations/supabase/types';
import { useSupabaseHospitals } from '@/hooks/useSupabaseHospitals';
import { adaptSupabaseHospitals } from '@/utils/hospitalAdapter';
import { routingService, RouteResult } from '@/services/routingService';
import DirectionsPanel from './DirectionsPanel';

type SupabaseHospital = Tables<'hospitals'>;
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
  const [currentRoute, setCurrentRoute] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string>('');
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  
  const { userLocation, locationError, isLoading, getCurrentLocation } = useGeolocation();
  const { hospitals: supabaseHospitals, loading: hospitalsLoading, error: hospitalsError } = useSupabaseHospitals({
    userLat: userLocation?.lat,
    userLng: userLocation?.lng,
    radius: 20 // 20km radius
  });

  // Convert Supabase hospital format to component Hospital format
  const hospitals = adaptSupabaseHospitals(supabaseHospitals);

  const getDirections = async (hospital: Hospital) => {
    if (!userLocation || !map) return;

    try {
      setRouteLoading(true);
      setRouteError('');
      setSelectedHospital(hospital);

      // Clear previous route
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }

      const startLatLng = L.latLng(userLocation.lat, userLocation.lng);
      const endLatLng = L.latLng(hospital.lat, hospital.lng);

      // Get route data
      const route = await routingService.getRoute(startLatLng, endLatLng);
      setCurrentRoute(route);

      // Add routing control to map
      const routingControl = routingService.createRoutingControl(startLatLng, endLatLng);
      routingControlRef.current = routingControl;
      routingControl.addTo(map);

      // Fit map to show the route
      const group = L.featureGroup([
        L.marker(startLatLng),
        L.marker(endLatLng)
      ]);
      map.fitBounds(group.getBounds().pad(0.1));

    } catch (error) {
      console.error('Error getting directions:', error);
      setRouteError(error instanceof Error ? error.message : 'Failed to get directions');
    } finally {
      setRouteLoading(false);
    }
  };

  const clearRoute = () => {
    if (map && routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    setCurrentRoute(null);
    setSelectedHospital(null);
    setRouteError('');
  };

  const createUserLocationMarker = (leafletMap: L.Map, position: UserLocation) => {
    // Remove existing user marker if it exists
    if (userMarkerRef.current) {
      leafletMap.removeLayer(userMarkerRef.current);
    }

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

    userMarkerRef.current = L.marker([position.lat, position.lng], { icon: userIcon })
      .addTo(leafletMap)
      .bindPopup('📍 You are here!')
      .openPopup();
  };

  const createHospitalMarker = (hospital: Hospital): L.Marker => {
    const statusColors = {
      open: '#22c55e',
      available: '#eab308',
      full: '#ef4444'
    };

    const hospitalIcon = L.divIcon({
      html: `
        <div style="
          background-color: ${statusColors[hospital.status as keyof typeof statusColors] || '#eab308'}; 
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
          cursor: pointer;
        ">🏥</div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: 'hospital-marker'
    });

    const marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon });

    const popupContent = `
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${hospital.name}</h3>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${hospital.type}</p>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${hospital.address}</p>
        <div style="margin: 8px 0; padding: 4px 8px; background-color: ${statusColors[hospital.status as keyof typeof statusColors] || '#eab308'}; color: white; border-radius: 4px; display: inline-block; font-size: 12px; font-weight: bold;">
          ${hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
        </div>
        <div style="margin-top: 8px; display: flex; gap: 8px;">
          <button onclick="window.open('tel:${hospital.phone}', '_self')" style="padding: 4px 8px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Call</button>
          <button onclick="window.getDirections && window.getDirections('${hospital.id}')" style="padding: 4px 8px; background-color: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Directions</button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);

    marker.on('click', () => {
      getDirections(hospital);
    });

    return marker;
  };

  const initializeMap = (position: UserLocation) => {
    if (mapRef.current && !map) {
      const leafletMap = L.map(mapRef.current).setView([position.lat, position.lng], 14);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(leafletMap);

      // Create layer group for markers
      markersLayerRef.current = L.layerGroup().addTo(leafletMap);

      setMap(leafletMap);

      // Add user location marker
      createUserLocationMarker(leafletMap, position);

      return leafletMap;
    }
    return null;
  };

  // Update hospital markers efficiently
  const updateHospitalMarkers = (leafletMap: L.Map, hospitalsList: Hospital[]) => {
    if (!markersLayerRef.current) return;

    // Clear existing hospital markers
    markersLayerRef.current.clearLayers();

    // Add new hospital markers
    hospitalsList.forEach((hospital) => {
      const marker = createHospitalMarker(hospital);
      markersLayerRef.current!.addLayer(marker);
    });
  };

  // Initialize map only once
  useEffect(() => {
    if (userLocation && mapRef.current && !map) {
      initializeMap(userLocation);
    }
  }, [userLocation, map]);

  // Update user location smoothly without re-initializing map
  useEffect(() => {
    if (map && userLocation) {
      // Smooth pan to new location
      map.panTo([userLocation.lat, userLocation.lng]);
      
      // Update user marker
      createUserLocationMarker(map, userLocation);
    }
  }, [map, userLocation]);

  // Update hospital markers when hospitals data changes
  useEffect(() => {
    if (map && hospitals.length > 0) {
      updateHospitalMarkers(map, hospitals);
    }
  }, [map, hospitals]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (map) {
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
        }
        map.remove();
        setMap(null);
      }
      if (markersLayerRef.current) {
        markersLayerRef.current = null;
      }
      if (userMarkerRef.current) {
        userMarkerRef.current = null;
      }
      if (routingControlRef.current) {
        routingControlRef.current = null;
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
            
            {/* Floating Directions Panel */}
            {(currentRoute || routeLoading || routeError) && (
              <div className="absolute top-4 right-4 z-10 max-w-sm">
                <DirectionsPanel
                  route={currentRoute}
                  destinationName={selectedHospital?.name || 'Selected Hospital'}
                  isLoading={routeLoading}
                  error={routeError}
                  onClose={clearRoute}
                />
              </div>
            )}
          </div>
        </div>

        {/* Hospital List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Nearby Hospitals {hospitals.length > 0 && `(${hospitals.length})`}
          </h3>
          
          {hospitalsError && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
              {hospitalsError}
            </div>
          )}
          
          {hospitalsLoading && (
            <div className="text-gray-500 text-sm p-2 bg-gray-50 rounded">
              Loading hospitals...
            </div>
          )}
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {hospitals.map((hospital) => (
              <HospitalListCard
                key={hospital.id}
                hospital={hospital}
                userLocation={userLocation}
                onGetDirections={getDirections}
              />
            ))}
            
            {!hospitalsLoading && hospitals.length === 0 && (
              <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded text-center">
                No hospitals found in your area
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;
