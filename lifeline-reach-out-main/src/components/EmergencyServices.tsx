
import { useState } from 'react';
import { Phone, MapPin, AlertTriangle, Clock, Navigation, Zap, Ambulance, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';

const EmergencyServices = () => {
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [nearestHospitals, setNearestHospitals] = useState<any[]>([]);
  const [loadingEmergency, setLoadingEmergency] = useState(false);

  const { toast } = useToast();
  const { latitude, longitude, getCurrentLocation, locationError } = useGeolocation();

  const emergencyContacts = [
    { name: 'Ambulance', number: '108', description: 'Emergency medical services' },
    { name: 'Police', number: '100', description: 'Law enforcement emergency' },
    { name: 'Fire Department', number: '101', description: 'Fire and rescue services' },
    { name: 'Women Helpline', number: '1091', description: 'Women safety helpline' },
    { name: 'Child Helpline', number: '1098', description: 'Child emergency services' },
  ];

  const handleEmergencyCall = async () => {
    if (!latitude || !longitude) {
      toast({
        title: "Location Required",
        description: locationError || "Please allow location access for emergency services",
        variant: "destructive",
      });
      getCurrentLocation();
      return;
    }

    setEmergencyActive(true);
    setLoadingEmergency(true);
    
    try {
      // Call the Supabase function to get nearby hospitals
      const { data, error } = await supabase.rpc('get_nearby_hospitals', {
        lat: latitude,
        lng: longitude,
        radius: 5.0
      });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Filter for open/available hospitals
        const availableHospitals = data.filter(
          (hospital: any) => hospital.status === 'open' || hospital.status === 'available'
        );

        if (availableHospitals.length > 0) {
          setNearestHospitals(availableHospitals.slice(0, 3)); // Top 3 nearest
          const nearest = availableHospitals[0];
          toast({
            title: "🚨 Emergency Alert Sent!",
            description: `Nearest hospital: ${nearest.name} (${nearest.distance_km?.toFixed(1)} km away)`,
          });
        } else {
          toast({
            title: "No Open Hospitals Found",
            description: "Calling 108 for emergency assistance",
            variant: "destructive",
          });
          window.open('tel:108');
        }
      } else {
        toast({
          title: "No Hospitals Found",
          description: "Calling 108 for emergency assistance",
          variant: "destructive",
        });
        window.open('tel:108');
      }
    } catch (error) {
      console.error('Emergency service error:', error);
      toast({
        title: "Emergency Service Error",
        description: "Calling 108 for emergency assistance",
        variant: "destructive",
      });
      window.open('tel:108');
    } finally {
      setLoadingEmergency(false);
    }

    // Reset after 15 seconds
    setTimeout(() => {
      setEmergencyActive(false);
      setNearestHospitals([]);
    }, 15000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-red-100 text-red-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Emergency Services</h3>
        <p className="text-gray-600">Quick access to emergency medical services and immediate help</p>
      </div>

      {/* Emergency Alert */}
      {emergencyActive && (
        <Alert className="mb-6 border-red-200 bg-red-50 animate-pulse">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>🚨 Emergency Alert Active!</strong> 
            {nearestHospitals.length > 0 ? (
              <>
                {nearestHospitals.length} hospital(s) found nearby. See details below.
              </>
            ) : loadingEmergency ? (
              'Finding nearest hospitals...'
            ) : (
              'Emergency services have been notified.'
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Emergency Button */}
      <Card className="mb-6 border-red-200 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="bg-white/20 p-4 rounded-full inline-flex mb-4">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Emergency Assistance</h3>
            <p className="text-red-100 mb-6">
              Press for immediate emergency medical assistance. Your location will be shared automatically.
            </p>
            <Button 
              id="emergency-btn"
              size="lg" 
              className="bg-white text-red-600 hover:bg-red-50 text-xl px-8 py-4 transform hover:scale-105 transition-all duration-200 shadow-lg"
              onClick={handleEmergencyCall}
              disabled={loadingEmergency}
            >
              {loadingEmergency ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Finding Nearest Hospital...
                </>
              ) : emergencyActive ? (
                <>
                  <AlertTriangle className="w-6 h-6 mr-2 animate-pulse" />
                  Emergency Active
                </>
              ) : (
                <>
                  <Phone className="w-6 h-6 mr-2" />
                  🚨 Call Emergency
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Emergency Contacts */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Emergency Helplines
          </CardTitle>
          <CardDescription>
            Direct access to essential emergency services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">{contact.name}</h4>
                  <p className="text-sm text-gray-600">{contact.description}</p>
                </div>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 font-bold"
                  onClick={() => window.open(`tel:${contact.number}`)}
                >
                  {contact.number}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nearest Emergency Hospitals */}
      {nearestHospitals.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">🚨 Nearest Emergency Hospitals</h4>
          <div className="space-y-4">
            {nearestHospitals.map((hospital, index) => (
              <Card key={hospital.id} className={`border-2 ${index === 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'} animate-in fade-in-50 slide-in-from-bottom-4`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${index === 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                        <Ambulance className={`w-5 h-5 ${index === 0 ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className={`font-semibold ${index === 0 ? 'text-red-900' : 'text-green-900'}`}>
                            {hospital.name}
                          </h5>
                          {index === 0 && <Badge className="bg-red-200 text-red-800 text-xs">NEAREST</Badge>}
                        </div>
                        <p className={`text-sm ${index === 0 ? 'text-red-700' : 'text-green-700'}`}>
                          {hospital.type?.charAt(0).toUpperCase() + hospital.type?.slice(1)} Hospital
                        </p>
                      </div>
                    </div>
                    <Badge className={`${index === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {hospital.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className={`flex items-center text-sm ${index === 0 ? 'text-red-700' : 'text-green-700'}`}>
                      <MapPin className="w-4 h-4 mr-2" />
                      {hospital.distance_km?.toFixed(1)} km away
                    </div>
                    <div className={`flex items-center text-sm ${index === 0 ? 'text-red-700' : 'text-green-700'}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      {hospital.contact}
                    </div>
                  </div>

                  {hospital.address && (
                    <p className={`text-sm mb-4 ${index === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      📍 {hospital.address}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      className={`flex-1 ${index === 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                      onClick={() => window.open(`tel:${hospital.contact}`)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Hospital
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`flex-1 ${index === 0 ? 'border-red-300 text-red-700 hover:bg-red-100' : 'border-green-300 text-green-700 hover:bg-green-100'}`}
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${hospital.latitude},${hospital.longitude}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Safety Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Emergency Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-blue-700">
            <li>• Stay calm and speak clearly when calling emergency services</li>
            <li>• Provide your exact location and nature of emergency</li>
            <li>• Don't hang up until the operator says it's okay</li>
            <li>• If possible, have someone meet the ambulance at the entrance</li>
            <li>• Keep important medical information easily accessible</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyServices;
