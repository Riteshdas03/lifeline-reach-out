import { useState } from 'react';
import { Heart, Phone, MapPin, User, Clock, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';

interface Donor {
  id: string;
  name: string;
  phone: string;
  blood_group: string;
  distance?: number;
  last_donation_date?: string;
  sos_enabled: boolean;
}

const EmergencyDonorSearch = () => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const { latitude, longitude, getCurrentLocation } = useGeolocation();
  const { toast } = useToast();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const searchEmergencyDonors = async () => {
    if (!selectedBloodGroup) {
      toast({
        title: "Blood Group Required",
        description: "Please select a blood group to search for donors",
        variant: "destructive",
      });
      return;
    }

    if (!latitude || !longitude) {
      toast({
        title: "Location Required",
        description: "Please allow location access to find nearby donors",
        variant: "destructive",
      });
      getCurrentLocation();
      return;
    }

    setLoading(true);
    
    try {
      // Only search for donors with SOS enabled (secure access for emergencies)
      const { data, error } = await supabase
        .from('donors')
        .select('id, name, phone, blood_group, latitude, longitude, last_donation_date, sos_enabled')
        .eq('blood_group', selectedBloodGroup)
        .eq('sos_enabled', true);

      if (error) throw error;

      // Calculate distances and filter within 10km
      const donorsWithDistance = (data || []).map((donor: any) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          donor.latitude,
          donor.longitude
        );
        return { ...donor, distance };
      }).filter(donor => donor.distance <= 10)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5); // Get top 5 nearest donors

      setDonors(donorsWithDistance);

      if (donorsWithDistance.length === 0) {
        toast({
          title: "No Donors Found",
          description: `No ${selectedBloodGroup} blood donors found within 10km who have SOS enabled`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Donors Found! 🩸",
          description: `Found ${donorsWithDistance.length} ${selectedBloodGroup} blood donors nearby`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search for donors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatLastDonation = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const canDonate = (lastDonationDate?: string) => {
    if (!lastDonationDate) return true;
    const lastDate = new Date(lastDonationDate);
    const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 56; // 56 days minimum between donations
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Heart className="w-8 h-8 mr-3 text-red-600" />
          Emergency Blood Donor Search
        </h3>
        <p className="text-gray-600">Find nearby blood donors for emergency situations</p>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Droplets className="w-6 h-6 mr-3 text-red-600" />
            Search Emergency Donors
          </CardTitle>
          <CardDescription>
            Find SOS-enabled blood donors within 10km radius
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Blood Group Needed</label>
              <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={searchEmergencyDonors}
              disabled={loading || !selectedBloodGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Find Donors
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Donors List */}
      {donors.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">
            Emergency Donors ({selectedBloodGroup}) - {donors.length} found
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {donors.map((donor) => (
              <Card key={donor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="font-semibold text-lg flex items-center">
                        <User className="w-5 h-5 mr-2 text-gray-600" />
                        {donor.name}
                      </h5>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {donor.distance?.toFixed(1)} km away
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {donor.blood_group}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Last donation: {formatLastDonation(donor.last_donation_date)}
                    </div>
                    <div className="flex items-center text-sm">
                      <div className={`w-2 h-2 rounded-full mr-2 ${canDonate(donor.last_donation_date) ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      {canDonate(donor.last_donation_date) ? 'Available to donate' : 'Recent donation (wait period)'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={() => window.open(`tel:${donor.phone}`)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(`sms:${donor.phone}?body=EMERGENCY: Need ${selectedBloodGroup} blood donation. Please respond if available.`)}
                    >
                      💬 SMS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Instructions */}
      <Card className="mt-6 bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
            ⚠️ Emergency Protocol
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Contact multiple donors to ensure availability</li>
            <li>• Verify donor's last donation date (56-day gap required)</li>
            <li>• Coordinate with hospital blood bank for testing and collection</li>
            <li>• Consider calling 108 for ambulance if transport is needed</li>
            <li>• Keep this search confidential - share only with medical personnel</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyDonorSearch;