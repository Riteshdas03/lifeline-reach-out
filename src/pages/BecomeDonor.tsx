import { useState } from 'react';
import { Heart, Phone, MapPin, User, ArrowLeft, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { validateCoordinates, validatePhoneNumber, sanitizeInput, validateRequired, validateBloodGroup } from '@/utils/validation';

const BecomeDonor = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    latitude: '',
    longitude: '',
    sosEnabled: false,
    lastDonationDate: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast({
            title: "Location Detected",
            description: "Your current coordinates have been filled automatically"
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Could not get your location. Please enter coordinates manually.",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Input validation
    const errors: string[] = [];
    
    if (!validateRequired(formData.name)) {
      errors.push("Name is required");
    }
    
    if (!validatePhoneNumber(formData.phone)) {
      errors.push("Please enter a valid phone number");
    }
    
    if (!validateBloodGroup(formData.bloodGroup)) {
      errors.push("Please select a valid blood group");
    }
    
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    
    if (!validateCoordinates(lat, lng)) {
      errors.push("Please provide valid coordinates");
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to register as a donor",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('donors')
        .insert({
          user_id: user.id,
          name: sanitizeInput(formData.name),
          phone: sanitizeInput(formData.phone),
          blood_group: formData.bloodGroup,
          latitude: lat,
          longitude: lng,
          sos_enabled: formData.sosEnabled,
          last_donation_date: formData.lastDonationDate || null
        });

      if (error) throw error;

      toast({
        title: "Registration Successful! 🎉",
        description: "Thank you for joining our blood donor network. You're now helping save lives!"
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        bloodGroup: '',
        latitude: '',
        longitude: '',
        sosEnabled: false,
        lastDonationDate: ''
      });

      // Navigate back after 2 seconds
      setTimeout(() => navigate('/'), 2000);
      
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register as donor",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <Header />
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-red-600 to-red-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Droplets className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Become a Blood Donor</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our network of heroes and help save lives. Every donation can save up to 3 lives.
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-6 h-6 mr-3 text-red-600" />
              Donor Registration
            </CardTitle>
            <CardDescription>
              Your information will be kept confidential and used only for blood donation coordination
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                  <Input
                    placeholder="e.g., +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Blood Group *</label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => setFormData(prev => ({ ...prev, bloodGroup: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your blood group" />
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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Donation Date</label>
                  <Input
                    type="date"
                    value={formData.lastDonationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastDonationDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Latitude *</label>
                  <Input
                    placeholder="e.g., 28.6139"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Longitude *</label>
                  <Input
                    placeholder="e.g., 77.2090"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="w-full"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Location
                  </Button>
                </div>
              </div>

              <div className="flex items-space-x-2 space-x-3 p-4 bg-blue-50 rounded-lg">
                <Checkbox
                  id="sosEnabled"
                  checked={formData.sosEnabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sosEnabled: !!checked }))}
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="sosEnabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Enable Emergency SOS
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Allow emergency contacts when urgent blood is needed in your area
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-amber-800 mb-2">Important Guidelines:</h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• You must be 18-65 years old to donate blood</li>
                  <li>• Wait at least 56 days between whole blood donations</li>
                  <li>• Maintain good health and avoid alcohol 24 hours before donation</li>
                  <li>• Bring a valid ID when donating blood</li>
                </ul>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Register as Donor
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BecomeDonor;