
import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Filter, Navigation, Map, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LeafletMap from './LeafletMap';
import { useEnhancedHospitalSearch } from '@/hooks/useEnhancedHospitalSearch';
import { useGeolocation } from '@/hooks/useGeolocation';

const HospitalFinder = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [hospitalType, setHospitalType] = useState('all');
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('map');
  
  const { latitude, longitude, error: locationError, loading: locationLoading, getCurrentLocation } = useGeolocation();
  
  const radius = selectedDistance === 'all' ? undefined : parseFloat(selectedDistance);
  
  const { hospitals, loading, error } = useEnhancedHospitalSearch({
    searchQuery: searchLocation,
    userLat: latitude || undefined,
    userLng: longitude || undefined,
    radius,
    type: hospitalType === 'all' ? undefined : hospitalType,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'open': return 'Open';
      case 'full': return 'Full';
      default: return 'Unknown';
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Find Hospitals Near You</h3>
        <p className="text-gray-600 text-sm sm:text-base">Real-time availability and instant directions to healthcare facilities</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 gap-4 mb-4 sm:mb-6">
        <div className="relative">
          <Input
            id="hospital-search"
            placeholder="Enter your location or use current location"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full pr-24 sm:pr-32"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 sm:px-3 sm:py-2"
            onClick={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <span className="hidden sm:inline">Use Current Location</span>
            )}
            <Navigation className="w-3 h-3 sm:w-4 sm:h-4 sm:hidden" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Select value={hospitalType} onValueChange={setHospitalType}>
            <SelectTrigger>
              <SelectValue placeholder="Hospital Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="ngo">NGO</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDistance} onValueChange={setSelectedDistance}>
            <SelectTrigger>
              <SelectValue placeholder="Distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Distances</SelectItem>
              <SelectItem value="2">Within 2 km</SelectItem>
              <SelectItem value="5">Within 5 km</SelectItem>
              <SelectItem value="10">Within 10 km</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="bg-gray-100 rounded-lg p-1 flex w-full sm:w-auto">
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="flex items-center justify-center space-x-2 flex-1 sm:flex-none"
          >
            <Map className="w-4 h-4" />
            <span className="text-sm">Map View</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center justify-center space-x-2 flex-1 sm:flex-none"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">List View</span>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(error || locationError) && (
        <Alert className="mb-4 sm:mb-6">
          <AlertDescription className="text-sm">
            {error || locationError}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin mr-2" />
          <span className="text-sm sm:text-base">Loading hospitals...</span>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="h-64 sm:h-96 rounded-lg overflow-hidden">
          <LeafletMap />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && !loading && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {hospitals.length === 0 ? (
            <div className="col-span-full text-center py-6 sm:py-8">
              <p className="text-gray-500 text-sm sm:text-base">No hospitals found. Try adjusting your filters or location.</p>
            </div>
          ) : (
            hospitals.map((hospital) => (
              <Card key={hospital.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg mb-1">{hospital.name}</CardTitle>
                      <CardDescription className="flex items-center text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="line-clamp-2">{hospital.address}</span>
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(hospital.status)} text-xs whitespace-nowrap`}>
                      {getStatusText(hospital.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      {formatDistance(hospital.distance_km) || 'Distance unavailable'}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Type: {hospital.type}
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-600 col-span-1 sm:col-span-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      {hospital.contact}
                    </div>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Available Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {hospital.services?.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      )) || (
                        <span className="text-xs text-gray-400">No services listed</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-2"
                      onClick={() => {
                        const url = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <Navigation className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 text-sm py-2"
                      onClick={() => window.open(`tel:${hospital.contact}`)}
                    >
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Call Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HospitalFinder;
