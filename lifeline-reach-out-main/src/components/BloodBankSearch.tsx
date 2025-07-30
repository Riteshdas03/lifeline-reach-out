
import { useState } from 'react';
import { Heart, MapPin, Phone, Clock, User, Search, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseBloodBanks, useSupabaseDonors } from '@/hooks/useSupabaseBloodBanks';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';

const BloodBankSearch = () => {
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [donorFormData, setDonorFormData] = useState({
    name: '',
    blood_group: '',
    phone: '',
    sos_enabled: true
  });

  const { toast } = useToast();
  const { latitude, longitude, getCurrentLocation } = useGeolocation();
  
  const { bloodBanks, loading: banksLoading, error: banksError } = useSupabaseBloodBanks({
    userLat: latitude || undefined,
    userLng: longitude || undefined,
    bloodGroup: bloodGroup || undefined,
    radius: 10
  });

  const { donors, loading: donorsLoading, error: donorsError, fetchDonors, registerDonor } = useSupabaseDonors();

  const handleSearch = () => {
    if (bloodGroup && latitude && longitude) {
      fetchDonors(bloodGroup, latitude, longitude, 10);
    }
  };

  const handleSOSAlert = async () => {
    if (!bloodGroup) {
      toast({
        title: "Blood Group Required",
        description: "Please select a blood group first",
        variant: "destructive",
      });
      return;
    }

    if (latitude && longitude) {
      await fetchDonors(bloodGroup, latitude, longitude, 10);
      toast({
        title: "SOS Alert Sent!",
        description: `Notified ${donors.length} nearby ${bloodGroup} donors`,
      });
    } else {
      toast({
        title: "Location Required",
        description: "Please allow location access for SOS alerts",
        variant: "destructive",
      });
    }
  };

  const handleRegisterDonor = async () => {
    if (!donorFormData.name || !donorFormData.blood_group || !donorFormData.phone) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!latitude || !longitude) {
      toast({
        title: "Location Required",
        description: "Please allow location access to register as a donor",
        variant: "destructive",
      });
      return;
    }

    const result = await registerDonor({
      ...donorFormData,
      latitude,
      longitude,
    });

    if (result) {
      toast({
        title: "Registration Successful!",
        description: "You've been registered as a blood donor",
      });
      setShowDonorForm(false);
      setDonorFormData({
        name: '',
        blood_group: '',
        phone: '',
        sos_enabled: true
      });
    }
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return `${distance.toFixed(1)} km`;
  };

  const getAvailabilityColor = (units: number) => {
    if (units >= 20) return 'text-green-600 bg-green-100';
    if (units >= 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Blood Bank & Donor Network</h3>
        <p className="text-gray-600">Find blood banks and verified donors in your area</p>
      </div>

      {/* Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select value={bloodGroup} onValueChange={setBloodGroup}>
          <SelectTrigger>
            <SelectValue placeholder="Select Blood Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A-">A-</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B-">B-</SelectItem>
            <SelectItem value="AB+">AB+</SelectItem>
            <SelectItem value="AB-">AB-</SelectItem>
            <SelectItem value="O+">O+</SelectItem>
            <SelectItem value="O-">O-</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Enter your location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Button 
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={handleSearch}
          disabled={!bloodGroup || banksLoading}
        >
          {banksLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          🩸 Find Blood
        </Button>
      </div>

      {/* Emergency SOS */}
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-red-600 p-2 rounded-full mr-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800">Emergency Blood Needed?</h4>
                <p className="text-red-600 text-sm">Send SOS alert to nearby donors and blood banks</p>
              </div>
            </div>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleSOSAlert}
              disabled={donorsLoading}
            >
              {donorsLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Heart className="w-4 h-4 mr-2" />
              )}
              Send SOS Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="banks" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="banks">Blood Banks</TabsTrigger>
          <TabsTrigger value="donors">Individual Donors</TabsTrigger>
        </TabsList>

        <TabsContent value="banks">
          {banksError && (
            <Alert className="mb-6">
              <AlertDescription>{banksError}</AlertDescription>
            </Alert>
          )}
          
          {banksLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading blood banks...</span>
            </div>
          ) : (
            <div className="grid gap-6">
              {bloodBanks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No blood banks found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                bloodBanks.map((bank) => (
                  <Card key={bank.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{bank.name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {bank.address}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {formatDistance((bank as any).distance) || 'Distance unavailable'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {bank.operating_hours || '24/7'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {bank.contact}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="font-medium text-gray-900 mb-2">Available Blood Groups</h5>
                        <div className="flex flex-wrap gap-2">
                          {bank.blood_groups.map((group) => (
                            <Badge key={group} variant="secondary" className="text-xs">
                              {group}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => window.open(`tel:${bank.contact}`)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Contact Bank
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            const url = `https://www.google.com/maps/search/?api=1&query=${bank.latitude},${bank.longitude}`;
                            window.open(url, '_blank');
                          }}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Get Directions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="donors">
          {donorsError && (
            <Alert className="mb-6">
              <AlertDescription>{donorsError}</AlertDescription>
            </Alert>
          )}
          
          {donorsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading donors...</span>
            </div>
          ) : (
            <div className="grid gap-4">
              {donors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No SOS-enabled donors found. Try searching for a specific blood group.</p>
                </div>
              ) : (
                donors.map((donor) => (
                  <Card key={donor.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-red-100 p-3 rounded-full mr-4">
                            <User className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              {donor.name}
                              <Badge className="ml-2 bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                SOS Enabled
                              </Badge>
                            </h4>
                            <p className="text-sm text-gray-600">
                              {donor.blood_group} • {formatDistance((donor as any).distance)} away
                            </p>
                            {donor.last_donation_date && (
                              <p className="text-xs text-gray-500">
                                Last donation: {new Date(donor.last_donation_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => window.open(`tel:${donor.phone}`)}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Donor Registration Form */}
          {showDonorForm ? (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Register as Blood Donor</CardTitle>
                <CardDescription>Join our network to help save lives in emergencies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={donorFormData.name}
                  onChange={(e) => setDonorFormData({...donorFormData, name: e.target.value})}
                />
                <Select value={donorFormData.blood_group} onValueChange={(value) => setDonorFormData({...donorFormData, blood_group: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Phone Number"
                  value={donorFormData.phone}
                  onChange={(e) => setDonorFormData({...donorFormData, phone: e.target.value})}
                />
                <div className="flex gap-2">
                  <Button onClick={handleRegisterDonor} className="flex-1">
                    Register
                  </Button>
                  <Button variant="outline" onClick={() => setShowDonorForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-blue-800 mb-2">Become a Blood Donor</h4>
                <p className="text-blue-600 mb-4">
                  Join our network of verified donors and help save lives in your community.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowDonorForm(true)}
                >
                  Register as Donor
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BloodBankSearch;
