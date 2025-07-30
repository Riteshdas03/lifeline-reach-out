
import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Stethoscope, Eye, Heart, Activity, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseCamps } from '@/hooks/useSupabaseCamps';
import { useGeolocation } from '@/hooks/useGeolocation';
import { CampOrganiserModal } from '@/components/CampOrganiserModal';

const HealthCamps = () => {
  const [searchLocation, setSearchLocation] = useState('');
  const [campType, setCampType] = useState('all');
  const [selectedCampForOrganiser, setSelectedCampForOrganiser] = useState<{ id: string; name: string } | null>(null);

  const { latitude, longitude, getCurrentLocation } = useGeolocation();
  
  const { camps, loading, error } = useSupabaseCamps({
    userLat: latitude || undefined,
    userLng: longitude || undefined,
    radius: 25, // 25km radius
    type: campType === 'all' ? undefined : campType,
  });

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'eye': return Eye;
      case 'cardiology': return Heart;
      case 'general': return Stethoscope;
      case 'diabetes': return Activity;
      default: return Stethoscope;
    }
  };

  const getOccupancyColor = (registered: number, capacity: number) => {
    if (!capacity) return 'text-gray-600 bg-gray-100';
    const percentage = (registered / capacity) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Health Camps & Medical Drives</h3>
        <p className="text-gray-600">Free and affordable health checkups in your community</p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input
          placeholder="Enter your location"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="md:col-span-2"
        />
        
        <Select value={campType} onValueChange={setCampType}>
          <SelectTrigger>
            <SelectValue placeholder="Camp Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="eye">Eye Care</SelectItem>
            <SelectItem value="cardiology">Cardiology</SelectItem>
            <SelectItem value="general">General Medicine</SelectItem>
            <SelectItem value="diabetes">Diabetes</SelectItem>
            <SelectItem value="vaccine">Vaccination</SelectItem>
            <SelectItem value="medicine">Medicine</SelectItem>
            <SelectItem value="dental">Dental</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading Display */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading health camps...</span>
        </div>
      )}

      {/* Featured Camp */}
      {camps.length > 0 && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-600 p-3 rounded-full mr-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-800">Upcoming: {camps[0].name}</h4>
                  <p className="text-green-600">
                    {formatDate(camps[0].date)} • {camps[0].start_time && camps[0].end_time ? 
                      `${camps[0].start_time} - ${camps[0].end_time}` : 'All Day'}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {camps[0].registered_count || 0}/{camps[0].capacity || 'Unlimited'} registered
                  </p>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Register Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health Camps List */}
      {!loading && (
        <div className="grid gap-6">
          {camps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No health camps found. Try adjusting your filters.</p>
            </div>
          ) : (
            camps.map((camp) => {
              const IconComponent = getTypeIcon(camp.type);
              return (
                <Card key={camp.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg mb-1">{camp.name}</CardTitle>
                          <CardDescription>
                            {camp.organizer ? `Organized by ${camp.organizer}` : 'Health Camp'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getOccupancyColor(camp.registered_count || 0, camp.capacity || 0)}>
                          {camp.registered_count || 0}/{camp.capacity || 'Unlimited'} registered
                        </Badge>
                        <Badge variant="outline" className="ml-2">
                          Free
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(camp.date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {camp.start_time && camp.end_time ? 
                            `${camp.start_time} - ${camp.end_time}` : 'All Day'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {formatDistance((camp as any).distance)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          Capacity: {camp.capacity || 'Unlimited'} people
                        </div>
                        <div className="text-sm text-gray-600">
                          Contact: {camp.contact}
                        </div>
                        <div className="text-sm text-gray-600">
                          Type: {camp.type}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2 font-medium">Services Offered:</p>
                      <div className="flex flex-wrap gap-2">
                        {camp.services?.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        )) || (
                          <span className="text-xs text-gray-400">Services to be announced</span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <strong>Address:</strong> {camp.address || 'Address to be announced'}
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        Register for Camp
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          const url = `https://www.google.com/maps/search/?api=1&query=${camp.latitude},${camp.longitude}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Get Directions
                      </Button>
                    </div>
                    
                    <div className="mt-2">
                      <Button 
                        variant="secondary" 
                        className="w-full"
                        onClick={() => setSelectedCampForOrganiser({ id: camp.id, name: camp.name })}
                      >
                        Register as Organiser
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Organize Camp CTA */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <Stethoscope className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-blue-800 mb-2">Organize a Health Camp</h4>
          <p className="text-blue-600 mb-4">
            Are you a healthcare provider or NGO? Register to organize health camps in your community.
          </p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setSelectedCampForOrganiser({ id: 'general', name: 'General Health Camp Organization' })}
          >
            Register as Organizer
          </Button>
        </CardContent>
      </Card>

      {/* Camp Organiser Modal */}
      {selectedCampForOrganiser && (
        <CampOrganiserModal
          isOpen={!!selectedCampForOrganiser}
          onClose={() => setSelectedCampForOrganiser(null)}
          campId={selectedCampForOrganiser.id}
          campName={selectedCampForOrganiser.name}
        />
      )}
    </div>
  );
};

export default HealthCamps;
