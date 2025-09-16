import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, MapPin, Phone, Navigation, Map as MapIcon, List, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || !window.google) return;

      const defaultLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi fallback

      const newMap = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 13,
        mapTypeId: mapType,
        mapTypeControl: false,
        streetViewControl: true,
        gestureHandling: 'greedy',
      });

      setMap(newMap);

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

      // Load initial hospitals
      loadAllHospitals();
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
        radius_m: 10000,
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
      });

      const infoWindowContent = `
        <div style="font-family: Inter, Arial, sans-serif; font-size: 13px; max-width: 260px;">
          <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600;">${escapeHtml(hospital.name)}</h3>
          <p style="margin: 0 0 6px 0; color: #666;"><strong>Type:</strong> ${escapeHtml(hospital.type || '-')}</p>
          <p style="margin: 0 0 6px 0;">
            <strong>Status:</strong>
            <span style="color: ${getStatusColor(hospital.status)}; font-weight: 600;">
              ${escapeHtml(hospital.status || '-')}
            </span>
          </p>
          <p style="margin: 0 0 8px 0; color: #666;"><strong>Address:</strong> ${escapeHtml(hospital.address || 'N/A')}</p>
          <p style="margin: 0 0 8px 0; color: #666;"><strong>Phone:</strong> ${escapeHtml(hospital.contact || 'N/A')}</p>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button onclick="openDirections(${hospital.latitude}, ${hospital.longitude})"
              style="padding: 7px 10px; background: #2563eb; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 12px;">
              Directions
            </button>
            <button onclick="focusMarker(${index})"
              style="padding: 7px 10px; background: #edf2ff; color: #2563eb; border: 1px solid #c7ddff; border-radius: 8px; cursor: pointer; font-size: 12px;">
              Focus
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
      const cluster = new window.MarkerClusterer({ map, markers: newMarkers });
      setMarkerCluster(cluster);
    }

    // Fit map to markers if any
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds, 80);
    }
  };

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
      loadAllHospitals();
      return;
    }

    if (!window.google) {
      // If Google Maps isn't loaded yet, fallback to name search
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
        // Fallback to name search
        searchHospitalsByName(searchQuery);
      }
    });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setUserLocation(coords);
        
        if (map) {
          map.panTo(coords);
          map.setZoom(14);

          // Add user marker
          new window.google.maps.Marker({
            position: coords,
            map,
            title: 'You are here',
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          });
        }

        loadNearbyHospitals(coords);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please search manually.');
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
  };

  // Global functions for info window buttons
  useEffect(() => {
    (window as any).openDirections = (lat: number, lng: number) => {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    };

    (window as any).focusMarker = (index: number) => {
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
    };
  }, [markers, infoWindows, map]);

  return (
    <div className="w-full">
      {/* Search Controls */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <Input
            id="searchInput"
            placeholder="Search by hospital name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && performSearch()}
            className="flex-1"
          />
          <Button onClick={performSearch} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </Button>
          <Button variant="outline" onClick={useCurrentLocation} title="Use current location">
            📍
          </Button>
        </div>

        <div className="flex justify-between items-center">
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

          <div className="flex gap-2">
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
              <Satellite className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className={`flex gap-4 ${viewMode === 'list' ? 'flex-col lg:flex-row' : ''}`}>
        {/* Map Container */}
        <div className={`${viewMode === 'list' ? 'lg:flex-1' : 'w-full'}`}>
          <div
            ref={mapRef}
            className={`rounded-lg shadow-lg ${viewMode === 'map' ? 'h-96' : 'h-64 lg:h-96'}`}
            style={{ display: viewMode === 'map' || viewMode === 'list' ? 'block' : 'none' }}
          />
        </div>

        {/* List Panel */}
        {viewMode === 'list' && (
          <div className="lg:w-96 max-h-96 overflow-auto">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Results ({hospitals.length})</h4>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading hospitals...</span>
                </div>
              ) : hospitals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hospitals found</p>
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
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base">{hospital.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {hospital.address}
                          </p>
                        </div>
                        <Badge
                          style={{
                            backgroundColor: hospital.status?.toLowerCase() === 'available' || hospital.status?.toLowerCase() === 'open' ? '#d1fae5' : 
                                           hospital.status?.toLowerCase() === 'full' ? '#fee2e2' : '#fff7ed',
                            color: '#000'
                          }}
                        >
                          {hospital.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <p>{hospital.type}</p>
                          <p className="flex items-center mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            {hospital.contact}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <Navigation className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`tel:${hospital.contact}`);
                            }}
                          >
                            <Phone className="w-3 h-3" />
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
  );
};

export default GoogleMapsHospitalFinder;