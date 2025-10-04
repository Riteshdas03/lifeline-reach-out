/// <reference path="../types/google-maps.d.ts" />

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import NavigationMap from '@/components/NavigationMap';
import NavigationPanel from '@/components/NavigationPanel';
import NavigationControls from '@/components/NavigationControls';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Layers, Map as MapIcon } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useVoiceInstructions } from '@/hooks/useVoiceInstructions';
import { toast } from '@/hooks/use-toast';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { supabase } from '@/integrations/supabase/client';

const Navigation = () => {
  const [searchParams] = useSearchParams();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [centerOnUser, setCenterOnUser] = useState(true);
  const [vehicleType, setVehicleType] = useState('driving');
  const [showPanel, setShowPanel] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [steps, setSteps] = useState<any[]>([]);
  const [totalDistance, setTotalDistance] = useState('');
  const [totalDuration, setTotalDuration] = useState('');
  const [destinationName, setDestinationName] = useState('');

  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const alternateRoutesRef = useRef<google.maps.Polyline[]>([]);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { state, createRoute, startNavigation, stopNavigation, toggleVoice, updateNavigationState } = useNavigation();
  const { speak, cancel: cancelVoice } = useVoiceInstructions(state.isVoiceEnabled);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: 'Location access denied',
            description: 'Using default location',
            variant: 'destructive',
          });
          setUserLocation({ lat: 28.6139, lng: 77.209 });
        }
      );
    }
  }, []);

  // Initialize map
  const handleMapReady = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);

    // Create user marker
    userMarkerRef.current = new google.maps.Marker({
      position: userLocation || { lat: 28.6139, lng: 77.209 },
      map: mapInstance,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" fill="#2563eb" stroke="#fff" stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="#fff"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(24, 24),
      },
      title: 'Your location',
    });

    // Initialize directions renderer
    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#2563eb',
        strokeWeight: 6,
        strokeOpacity: 0.8,
      },
    });

    // Load hospitals
    loadHospitals(mapInstance);

    // Initialize autocomplete
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput && window.google?.maps?.places) {
      autocompleteRef.current = new google.maps.places.Autocomplete(searchInput, {
        types: ['establishment', 'geocode'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          handlePlaceSelected(place);
        }
      });
    }
  }, [userLocation]);

  // Load hospitals from Supabase
  const loadHospitals = async (mapInstance: google.maps.Map) => {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .limit(50);

    if (error) {
      console.error('Error loading hospitals:', error);
      return;
    }

    const markers = (data || []).map((hospital: any) => {
      const marker = new google.maps.Marker({
        position: { lat: hospital.latitude, lng: hospital.longitude },
        map: mapInstance,
        title: hospital.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
              <path fill="#dc2626" d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 16h-2v-4H6v-2h4V8h2v4h4v2h-4v4z"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="font-weight: 600; margin-bottom: 4px;">${hospital.name}</h3>
            <p style="font-size: 12px; color: #666;">${hospital.address || ''}</p>
            <button 
              id="navigate-${hospital.id}" 
              style="margin-top: 8px; padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Navigate
            </button>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
        setTimeout(() => {
          const btn = document.getElementById(`navigate-${hospital.id}`);
          if (btn) {
            btn.onclick = () => {
              handleNavigateToHospital(hospital);
              infoWindow.close();
            };
          }
        }, 100);
      });

      return marker;
    });

    markerClustererRef.current = new MarkerClusterer({ map: mapInstance, markers });
  };

  // Handle place selection from autocomplete
  const handlePlaceSelected = async (place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location || !userLocation) return;

    const destination = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    setDestinationName(place.name || 'Selected Location');
    await calculateAndDisplayRoute(userLocation, destination, place.name, place.formatted_address);
  };

  // Handle navigate to hospital
  const handleNavigateToHospital = async (hospital: any) => {
    if (!userLocation) {
      toast({
        title: 'Location required',
        description: 'Unable to get your current location',
        variant: 'destructive',
      });
      return;
    }

    const destination = { lat: hospital.latitude, lng: hospital.longitude };
    setDestinationName(hospital.name);
    await calculateAndDisplayRoute(userLocation, destination, hospital.name, hospital.address);
  };

  // Calculate and display route
  const calculateAndDisplayRoute = async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    destName?: string,
    destAddress?: string
  ) => {
    try {
      const routeData = await createRoute(
        origin.lat,
        origin.lng,
        destination.lat,
        destination.lng,
        vehicleType,
        destName,
        destAddress
      );

      if (!routeData || !routeData.route) {
        throw new Error('Failed to create route');
      }

      const directionsData = routeData.route;
      const route = directionsData.routes[0];
      const leg = route.legs[0];

      // Display main route
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(directionsData);
      }

      // Clear alternate routes
      alternateRoutesRef.current.forEach((polyline) => polyline.setMap(null));
      alternateRoutesRef.current = [];

      // Display alternate routes
      for (let i = 1; i < directionsData.routes.length; i++) {
        const altRoute = directionsData.routes[i];
        const polyline = new google.maps.Polyline({
          path: google.maps.geometry.encoding.decodePath(altRoute.overview_polyline.points),
          strokeColor: '#9ca3af',
          strokeOpacity: 0.6,
          strokeWeight: 4,
          map: map,
        });

        polyline.addListener('click', () => {
          if (directionsRendererRef.current) {
            directionsRendererRef.current.setRouteIndex(i);
          }
        });

        alternateRoutesRef.current.push(polyline);
      }

      // Update steps
      const formattedSteps = leg.steps.map((step: any) => ({
        instruction: step.html_instructions,
        distance: step.distance.text,
        duration: step.duration.text,
      }));

      setSteps(formattedSteps);
      setTotalDistance(leg.distance.text);
      setTotalDuration(leg.duration.text);

      // Start navigation
      await startNavigation(routeData.routeId, origin.lat, origin.lng);

      // Speak first instruction
      if (state.isVoiceEnabled && formattedSteps.length > 0) {
        speak(formattedSteps[0].instruction);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate route',
        variant: 'destructive',
      });
    }
  };

  // Update user marker position
  useEffect(() => {
    if (userMarkerRef.current && state.currentLocation) {
      userMarkerRef.current.setPosition(state.currentLocation);
    }
  }, [state.currentLocation]);

  // Update map type
  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapType);
    }
  }, [map, mapType]);

  // Check URL params for destination
  useEffect(() => {
    const destLat = searchParams.get('destLat');
    const destLng = searchParams.get('destLng');
    const destName = searchParams.get('destName');

    if (destLat && destLng && userLocation) {
      const destination = { lat: parseFloat(destLat), lng: parseFloat(destLng) };
      setDestinationName(destName || 'Destination');
      calculateAndDisplayRoute(userLocation, destination, destName || undefined);
    }
  }, [searchParams, userLocation]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Search and Map Controls */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-input"
                placeholder="Search hospitals, places..."
                className="pl-10"
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
              title="Toggle map type"
            >
              {mapType === 'roadmap' ? <Layers className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setShowPanel(!showPanel)}
              className="lg:hidden"
              title="Toggle panel"
            >
              <MapIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 relative rounded-lg overflow-hidden border">
            <NavigationMap
              onMapReady={handleMapReady}
              userLocation={userLocation}
              centerOnUser={centerOnUser}
            />
          </div>

          <NavigationControls
            isNavigating={state.isNavigating}
            isVoiceEnabled={state.isVoiceEnabled}
            currentInstruction={steps[state.currentStepIndex]?.instruction || ''}
            remainingDistance={`${state.remainingDistance.toFixed(1)} km`}
            remainingTime={`${state.remainingTime} min`}
            vehicleType={vehicleType}
            onToggleVoice={toggleVoice}
            onStop={stopNavigation}
            onVehicleTypeChange={setVehicleType}
          />
        </div>

        {/* Navigation Panel */}
        {showPanel && steps.length > 0 && (
          <div className="lg:w-96 h-[500px] lg:h-auto">
            <NavigationPanel
              steps={steps}
              currentStepIndex={state.currentStepIndex}
              destinationName={destinationName}
              totalDistance={totalDistance}
              totalDuration={totalDuration}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;
