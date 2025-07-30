
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
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Hospitals Near You</h3>
        <p className="text-gray-600">Real-time availability and instant directions to healthcare facilities</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <Input
            id="hospital-search"
            placeholder="Enter your location or use current location"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full"
          />
          <Button
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Use Current Location'
            )}
          </Button>
        </div>
        
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

      {/* View Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <Button
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="flex items-center space-x-2"
          >
            <Map className="w-4 h-4" />
            <span>Map View</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>List View</span>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(error || locationError) && (
        <Alert className="mb-6">
          <AlertDescription>
            {error || locationError}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading hospitals...</span>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <LeafletMap />
      )}

      {/* List View */}
      {viewMode === 'list' && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hospitals.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No hospitals found. Try adjusting your filters or location.</p>
            </div>
          ) : (
            hospitals.map((hospital) => (
              <Card key={hospital.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg mb-1">{hospital.name}</CardTitle>
                      <CardDescription className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {hospital.address}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(hospital.status)}>
                      {getStatusText(hospital.status)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatDistance(hospital.distance_km) || 'Distance unavailable'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Type: {hospital.type}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {hospital.contact}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Available Services:</p>
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

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        const url = `https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(`tel:${hospital.contact}`)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
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
