import React, { useState, useEffect } from 'react';
import { AlertTriangle, Phone, MapPin, Clock, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface EmergencyResponse {
  alert_id: string;
  nearest_hospitals: Array<{
    id: string;
    name: string;
    contact: string;
    distance_km: number;
  }>;
  emergency_contacts: EmergencyContact[];
  status: string;
}

const EmergencyWidget: React.FC = () => {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyResponse, setEmergencyResponse] = useState<EmergencyResponse | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const { latitude, longitude, loading: locationLoading, error: locationError } = useGeolocation();
  const { toast } = useToast();

  // Emergency cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const handleEmergencyAlert = async () => {
    if (!latitude || !longitude) {
      toast({
        title: "Location Required",
        description: "Please enable location access for emergency alerts",
        variant: "destructive",
      });
      return;
    }

    if (cooldownTime > 0) {
      toast({
        title: "Please Wait",
        description: `Emergency button is on cooldown. Wait ${cooldownTime} seconds.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setIsEmergencyActive(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use emergency services",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.rpc('send_emergency_alert', {
        user_lat: latitude,
        user_lng: longitude,
        alert_message: 'Emergency assistance needed - sent from MediReach app'
      });

      if (error) throw error;

      setEmergencyResponse(data as unknown as EmergencyResponse);
      setCooldownTime(30); // 30 second cooldown

      toast({
        title: "Emergency Alert Sent!",
        description: "Alert sent to nearby hospitals and your emergency contacts",
      });

    } catch (err: any) {
      console.error('Emergency alert error:', err);
      toast({
        title: "Alert Failed",
        description: err.message || "Failed to send emergency alert",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAlert = () => {
    setIsEmergencyActive(false);
    setEmergencyResponse(null);
  };

  if (locationLoading) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Getting location...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Emergency Button */}
      <Card className={`transition-all duration-300 ${
        isEmergencyActive 
          ? 'border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-400' 
          : 'border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <CardTitle className="text-lg text-orange-800 dark:text-orange-200">
                Emergency Alert
              </CardTitle>
            </div>
            {isEmergencyActive && (
              <Badge variant="destructive" className="animate-pulse">
                ACTIVE
              </Badge>
            )}
          </div>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            One-tap emergency assistance
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {locationError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-sm">
                {locationError}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleEmergencyAlert}
              disabled={isLoading || cooldownTime > 0 || locationLoading || !latitude}
              className={`flex-1 ${
                isEmergencyActive 
                  ? 'bg-red-600 hover:bg-red-700 pulse-emergency' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } ${!isLoading && !cooldownTime && latitude ? 'pulse-emergency' : ''}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Alert...
                </>
              ) : cooldownTime > 0 ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Wait {cooldownTime}s
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {isEmergencyActive ? 'Alert Active' : 'Send Emergency Alert'}
                </>
              )}
            </Button>

            {isEmergencyActive && (
              <Button
                onClick={handleClearAlert}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Clear
              </Button>
            )}
          </div>

          {latitude && longitude && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="w-3 h-3" />
              <span>Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Response Details */}
      {emergencyResponse && isEmergencyActive && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800 dark:text-blue-200">
              Emergency Response
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Alert ID: {emergencyResponse.alert_id}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Nearest Hospitals */}
            {emergencyResponse.nearest_hospitals && emergencyResponse.nearest_hospitals.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Nearest Hospitals Contacted:
                </h4>
                <div className="space-y-2">
                  {emergencyResponse.nearest_hospitals.map((hospital) => (
                    <div key={hospital.id} className="bg-white dark:bg-blue-900 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {hospital.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Distance: {hospital.distance_km?.toFixed(1)} km
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${hospital.contact}`)}
                          className="text-green-700 border-green-300 hover:bg-green-50"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            {emergencyResponse.emergency_contacts && emergencyResponse.emergency_contacts.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Emergency Contacts Notified:
                </h4>
                <div className="space-y-2">
                  {emergencyResponse.emergency_contacts.map((contact, index) => (
                    <div key={index} className="bg-white dark:bg-blue-900 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {contact.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {contact.relationship}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${contact.phone}`)}
                          className="text-green-700 border-green-300 hover:bg-green-50"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!emergencyResponse.nearest_hospitals || emergencyResponse.nearest_hospitals.length === 0) &&
             (!emergencyResponse.emergency_contacts || emergencyResponse.emergency_contacts.length === 0) && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  No nearby hospitals or emergency contacts found. Please add emergency contacts in your profile.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmergencyWidget;