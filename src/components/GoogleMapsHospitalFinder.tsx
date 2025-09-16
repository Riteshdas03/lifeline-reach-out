import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, MapPin, Phone, Navigation, Map as MapIcon, List, Car, Clock, Route, X, Copy, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    google: any;
    MarkerClusterer: any;
  }
}

interface Hospital {
  id: string;
  name: string;
  type: string;
  status: string;
  address: string;
  contact: string;
  latitude: number;
  longitude: number;
  services: string[];
  distance_m?: number;
}

interface TravelMode {
  key: string;
  label: string;
  icon: string;
  value: any;
}

interface DirectionsInfo {
  hospital: Hospital;
  distance: string;
  duration: string;
  steps: any[];
  routes: any[];
  selectedRouteIndex: number;
}

const GoogleMapsHospitalFinder: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindows, setInfoWindows] = useState<any[]>([]);
  const [markerCluster, setMarkerCluster] = useState<any>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userMarker, setUserMarker] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [directionsInfo, setDirectionsInfo] = useState<DirectionsInfo | null>(null);
  const [travelMode, setTravelMode] = useState<string>('DRIVING');
  const [showDirections, setShowDirections] = useState(false);

  const travelModes: TravelMode[] = [
    { key: 'DRIVING', label: 'Driving', icon: '🚗', value: 'DRIVING' },
    { key: 'WALKING', label: 'Walking', icon: '🚶', value: 'WALKING' },
    { key: 'BICYCLING', label: 'Cycling', icon: '🚴', value: 'BICYCLING' },
    { key: 'TRANSIT', label: 'Transit', icon: '🚌', value: 'TRANSIT' },
  ];

  // Initialize Google Maps with auto-location detection
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || !window.google) return;

      const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi fallback

      const newMap = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 13,
        mapTypeId: mapType,
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        gestureHandling: 'greedy',
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_CENTER,
        },
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
        streetViewControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP,
        },
        fullscreenControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP,
        },
      });

      setMap(newMap);

      // Initialize directions service and renderer
      const dirService = new window.google.maps.DirectionsService();
      const dirRenderer = new window.google.maps.DirectionsRenderer({
        draggable: false,
        panel: null,
      });
      
      setDirectionsService(dirService);
      setDirectionsRenderer(dirRenderer);

      // Initialize Places Autocomplete
      const input = document.getElementById('searchInput') as HTMLInputElement;
      if (input && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ['geocode', 'establishment'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place && place.geometry && place.geometry.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };
            newMap.panTo(location);
            newMap.setZoom(13);
            loadNearbyHospitals(location);
          }
        });
      }

      // Auto-detect user location on load
      autoDetectLocation(newMap);
    };

    // Load Google Maps if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBnnCC1mB9dQr__PJ1M_NOazUsTpYvGgVc&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
      
      // Also load MarkerClusterer
      const clusterScript = document.createElement('script');
      clusterScript.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
      clusterScript.async = true;
      document.head.appendChild(clusterScript);
    } else {
      initMap();
    }
  }, []);

  // Auto-detect user location
  const autoDetectLocation = useCallback((mapInstance?: any) => {
    if (!navigator.geolocation) return;

    const targetMap = mapInstance || map;
    if (!targetMap) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(coords);
        targetMap.panTo(coords);
        targetMap.setZoom(14);

        // Create blue dot user marker
        if (userMarker) {
          userMarker.setMap(null);
        }

        const newUserMarker = new window.google.maps.Marker({
          position: coords,
          map: targetMap,
          title: 'You are here',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          },
          zIndex: 9999,
        });

        setUserMarker(newUserMarker);
        loadNearbyHospitals(coords);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Still load default hospitals even if location detection fails
        loadAllHospitals();
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    );
  }, [map, userMarker]);

  // Update map type when changed
  useEffect(() => {
    if (map) {
      map.setMapTypeId(mapType);
    }
  }, [map, mapType]);

  const clearMarkersAndInfoWindows = useCallback(() => {
    markers.forEach(marker => marker.setMap(null));
    infoWindows.forEach(infoWindow => infoWindow.close());
    if (markerCluster) {
      markerCluster.clearMarkers();
    }
    setMarkers([]);
    setInfoWindows([]);
  }, [markers, infoWindows, markerCluster]);

  const loadAllHospitals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, type, status, address, contact, latitude, longitude, services')
        .limit(20);

      if (error) throw error;
      setHospitals(data || []);
      renderHospitalsOnMap(data || []);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyHospitals = async (location: { lat: number; lng: number }, query?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_nearby_hospitals_with_search', {
        lat: location.lat,
        lng: location.lng,
        radius_m: 10000, // 10km radius as requested
        search_term: query || null
      }) as { data: Hospital[] | null; error: any };

      if (error) throw error;
      const hospitals = (data || []) as Hospital[];
      setHospitals(hospitals);
      renderHospitalsOnMap(hospitals);
    } catch (error) {
      console.error('Error loading nearby hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchHospitalsByName = async (query: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name, type, status, address, contact, latitude, longitude, services')
        .ilike('name', `%${query}%`)
        .limit(20);

      if (error) throw error;
      setHospitals(data || []);
      renderHospitalsOnMap(data || []);
    } catch (error) {
      console.error('Error searching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHospitalsOnMap = (hospitalsData: Hospital[]) => {
    if (!map || !window.google) return;

    clearMarkersAndInfoWindows();

    const newMarkers: any[] = [];
    const newInfoWindows: any[] = [];

    hospitalsData.forEach((hospital, index) => {
      if (!hospital.latitude || !hospital.longitude) return;

      const marker = new window.google.maps.Marker({
        position: { lat: hospital.latitude, lng: hospital.longitude },
        map,
        title: hospital.name,
        icon: {
          url: getHospitalIcon(hospital.status),
          scaledSize: new window.google.maps.Size(32, 32)
        },
        animation: window.google.maps.Animation.DROP,
      });

      const infoWindowContent = `
        <div style="font-family: Inter, Arial, sans-serif; font-size: 13px; max-width: 280px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${escapeHtml(hospital.name)}</h3>
          <div style="margin-bottom: 8px;">
            <span style="display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: ${getStatusColor(hospital.status)}; background: ${getStatusBgColor(hospital.status)};">
              ${escapeHtml(hospital.status || '-')}
            </span>
          </div>
          <p style="margin: 0 0 6px 0; color: #6b7280;"><strong>Type:</strong> ${escapeHtml(hospital.type || '-')}</p>
          <p style="margin: 0 0 8px 0; color: #6b7280;"><strong>Address:</strong> ${escapeHtml(hospital.address || 'N/A')}</p>
          <p style="margin: 0 0 12px 0; color: #6b7280;"><strong>Phone:</strong> ${escapeHtml(hospital.contact || 'N/A')}</p>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button onclick="showDirectionsToHospital(${index})"
              style="flex: 1; padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 500;">
              Get Directions
            </button>
            <button onclick="callHospital('${escapeHtml(hospital.contact || '')}')"
              style="padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
              Call
            </button>
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoWindowContent
      });

      marker.addListener('click', () => {
        newInfoWindows.forEach(iw => iw.close());
        infoWindow.open(map, marker);
        highlightListItem(index);
      });

      newMarkers.push(marker);
      newInfoWindows.push(infoWindow);
    });

    setMarkers(newMarkers);
    setInfoWindows(newInfoWindows);

    // Add marker clustering if available
    if (window.MarkerClusterer && newMarkers.length > 0) {
      const cluster = new window.MarkerClusterer({ 
        map, 
        markers: newMarkers,
        gridSize: 60,
        maxZoom: 15
      });
      setMarkerCluster(cluster);
    }

    // Fit map to markers if any
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      
      // Include user location in bounds if available
      if (userLocation) {
        bounds.extend(userLocation);
      }
      
      map.fitBounds(bounds, { padding: 50 });
    }
  };

  const showDirectionsToHospital = useCallback((hospitalIndex: number) => {
    const hospital = hospitals[hospitalIndex];
    if (!hospital || !userLocation || !directionsService || !directionsRenderer) return;

    setLoading(true);

    const request = {
      origin: userLocation,
      destination: { lat: hospital.latitude, lng: hospital.longitude },
      travelMode: window.google.maps.TravelMode[travelMode as keyof typeof window.google.maps.TravelMode],
      provideRouteAlternatives: true,
      avoidHighways: false,
      avoidTolls: false,
    };

    directionsService.route(request, (result: any, status: string) => {
      setLoading(false);
      
      if (status === 'OK' && result) {
        directionsRenderer.setMap(map);
        directionsRenderer.setDirections(result);
        
        const route = result.routes[0];
        const leg = route.legs[0];
        
        setDirectionsInfo({
          hospital,
          distance: leg.distance.text,
          duration: leg.duration.text,
          steps: leg.steps,
          routes: result.routes,
          selectedRouteIndex: 0,
        });
        
        setShowDirections(true);
        
        // Close all info windows
        infoWindows.forEach(iw => iw.close());
      } else {
        console.error('Directions request failed:', status);
        alert('Unable to get directions. Please try again.');
      }
    });
  }, [hospitals, userLocation, directionsService, directionsRenderer, travelMode, map, infoWindows]);

  const clearDirections = useCallback(() => {
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
    setDirectionsInfo(null);
    setShowDirections(false);
  }, [directionsRenderer]);

  const changeRoute = useCallback((routeIndex: number) => {
    if (!directionsInfo || !directionsRenderer) return;
    
    const newDirections = {
      ...directionsInfo,
      selectedRouteIndex: routeIndex
    };
    
    // Update the directions renderer to show the selected route
    directionsRenderer.setRouteIndex(routeIndex);
    
    const route = directionsInfo.routes[routeIndex];
    const leg = route.legs[0];
    
    setDirectionsInfo({
      ...newDirections,
      distance: leg.distance.text,
      duration: leg.duration.text,
      steps: leg.steps,
    });
  }, [directionsInfo, directionsRenderer]);

  const changeTravelMode = useCallback((newTravelMode: string) => {
    setTravelMode(newTravelMode);
    
    // If directions are currently shown, recalculate with new travel mode
    if (directionsInfo && userLocation) {
      const hospitalIndex = hospitals.findIndex(h => h.id === directionsInfo.hospital.id);
      if (hospitalIndex !== -1) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          showDirectionsToHospital(hospitalIndex);
        }, 100);
      }
    }
  }, [directionsInfo, userLocation, hospitals, showDirectionsToHospital]);

  const copyDirectionsLink = useCallback(() => {
    if (!directionsInfo || !userLocation) return;
    
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${directionsInfo.hospital.latitude},${directionsInfo.hospital.longitude}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Directions link copied to clipboard!');
    });
  }, [directionsInfo, userLocation]);

  const getHospitalIcon = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'open':
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'full':
        return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'open':
        return '#059669';
      case 'full':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'open':
        return '#d1fae5';
      case 'full':
        return '#fee2e2';
      default:
        return '#fef3c7';
    }
  };

  const escapeHtml = (str: string): string => {
    return String(str || '').replace(/[&<>"'`=\/]/g, (s) => {
      const entityMap: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
      };
      return entityMap[s];
    });
  };

  const highlightListItem = (index: number) => {
    const listItems = document.querySelectorAll('.hospital-list-item');
    listItems.forEach((item, i) => {
      const element = item as HTMLElement;
      if (i === index) {
        element.style.boxShadow = '0 6px 18px rgba(37,99,235,0.12)';
        element.style.borderColor = '#cfe3ff';
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        element.style.boxShadow = 'none';
        element.style.borderColor = '#e5e7eb';
      }
    });
  };

  const performSearch = () => {
    if (!searchQuery.trim()) {
      if (userLocation) {
        loadNearbyHospitals(userLocation);
      } else {
        loadAllHospitals();
      }
      return;
    }

    if (!window.google) {
      searchHospitalsByName(searchQuery);
      return;
    }

    // Try geocoding first
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results: any, status: string) => {
      if (status === 'OK' && results && results[0] && results[0].geometry && results[0].geometry.location) {
        const location = results[0].geometry.location;
        const coords = { lat: location.lat(), lng: location.lng() };
        if (map) {
          map.panTo(coords);
          map.setZoom(13);
        }
        loadNearbyHospitals(coords, searchQuery);
      } else {
        searchHospitalsByName(searchQuery);
      }
    });
  };

  // Global functions for info window buttons
  useEffect(() => {
    (window as any).showDirectionsToHospital = showDirectionsToHospital;
    
    (window as any).callHospital = (phone: string) => {
      if (!phone) {
        alert('Phone number not available');
        return;
      }
      window.location.href = `tel:${phone}`;
    };
  }, [showDirectionsToHospital]);

  return (
    <div className="w-full relative">
      {/* Search Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <Input
            id="searchInput"
            placeholder="Search hospitals, cities, or areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch()}
            className="flex-1"
          />
          <Button onClick={performSearch} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => autoDetectLocation()} 
            title="Use current location"
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="w-4 h-4 mr-1" />
              Map
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <Select value={travelMode} onValueChange={changeTravelMode}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {travelModes.map(mode => (
                  <SelectItem key={mode.key} value={mode.key}>
                    <span className="flex items-center gap-2">
                      {mode.icon} {mode.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={mapType === 'roadmap' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMapType('roadmap')}
            >
              Map
            </Button>
            <Button
              variant={mapType === 'satellite' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMapType('satellite')}
            >
              <Layers className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Directions Sidebar */}
        {showDirections && directionsInfo && (
          <Card className="w-80 max-h-96 overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Directions</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearDirections}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{directionsInfo.hospital.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {directionsInfo.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Route className="w-4 h-4" />
                    {directionsInfo.distance}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={copyDirectionsLink}
                    className="flex-1"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-4 pt-0">
              <div className="space-y-2">
                <h4 className="font-medium text-sm mb-2">Route Instructions:</h4>
                {directionsInfo.steps.map((step, index) => (
                  <div key={index} className="text-xs border-l-2 border-muted pl-3 pb-2">
                    <div 
                      className="text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: step.instructions }}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.distance.text} - {step.duration.text}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Alternative Routes */}
              {directionsInfo.routes.length > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Alternative Routes:</h4>
                  {directionsInfo.routes.map((route, index) => (
                    <Button
                      key={index}
                      variant={index === directionsInfo.selectedRouteIndex ? 'default' : 'outline'}
                      size="sm"
                      className="w-full mb-1 justify-start text-xs"
                      onClick={() => changeRoute(index)}
                    >
                      Route {index + 1}: {route.legs[0].duration.text} ({route.legs[0].distance.text})
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          <div className={`flex gap-4 ${viewMode === 'list' ? 'flex-col lg:flex-row' : ''}`}>
            {/* Map Container */}
            <div className={`${viewMode === 'list' ? 'lg:flex-1' : 'w-full'}`}>
              <div
                ref={mapRef}
                className={`rounded-lg shadow-lg ${viewMode === 'map' ? 'h-96' : 'h-64 lg:h-96'} w-full`}
                style={{ display: viewMode === 'map' || viewMode === 'list' ? 'block' : 'none' }}
              />
            </div>

            {/* List Panel */}
            {viewMode === 'list' && (
              <div className="lg:w-96 max-h-96 overflow-auto">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">
                    Results ({hospitals.length})
                    {userLocation && ' within 10km'}
                  </h4>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Loading hospitals...</span>
                    </div>
                  ) : hospitals.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No hospitals found</p>
                  ) : (
                    hospitals.map((hospital, index) => (
                      <Card
                        key={hospital.id}
                        className="hospital-list-item cursor-pointer hover:shadow-md transition-all duration-200"
                        onClick={() => {
                          if (markers[index] && map) {
                            const position = markers[index].getPosition();
                            if (position) {
                              map.panTo(position);
                              map.setZoom(15);
                              infoWindows.forEach((iw: any) => iw.close());
                              infoWindows[index].open(map, markers[index]);
                              highlightListItem(index);
                            }
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-semibold">{hospital.name}</h5>
                              <p className="text-sm text-muted-foreground mb-2">
                                {hospital.address}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="secondary"
                                  style={{
                                    backgroundColor: getStatusBgColor(hospital.status),
                                    color: getStatusColor(hospital.status)
                                  }}
                                >
                                  {hospital.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {hospital.type}
                                </span>
                              </div>
                              {hospital.distance_m && (
                                <p className="text-xs text-muted-foreground">
                                  {(hospital.distance_m / 1000).toFixed(1)} km away
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  showDirectionsToHospital(index);
                                }}
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                Directions
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (hospital.contact) {
                                    window.location.href = `tel:${hospital.contact}`;
                                  }
                                }}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsHospitalFinder;