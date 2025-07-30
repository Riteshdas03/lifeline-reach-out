import { useState } from 'react';
import { MapPin, Phone, Building2, Users, Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';

const RegisterHospital = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
    latitude: '',
    longitude: '',
    type: '',
    services: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const serviceOptions = [
    'Emergency Care', 'ICU', 'Surgery', 'Pediatrics', 'Cardiology',
    'Orthopedics', 'Neurology', 'Oncology', 'Maternity', 'Radiology',
    'Laboratory', 'Pharmacy', 'Blood Bank', 'Dialysis', 'Mental Health'
  ];

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

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
    
    if (!formData.name || !formData.contact || !formData.latitude || !formData.longitude) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("You must be logged in to register a hospital");
      }

      const { error } = await supabase
        .from('hospitals')
        .insert({
          name: formData.name,
          address: formData.address || null,
          contact: formData.contact,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          type: formData.type as any || 'private',
          services: formData.services.length > 0 ? formData.services : null,
          status: 'available',
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Hospital Registered Successfully!",
        description: "Your hospital has been added to our database"
      });

      // Reset form
      setFormData({
        name: '',
        address: '',
        contact: '',
        latitude: '',
        longitude: '',
        type: '',
        services: []
      });

      // Navigate back after 2 seconds
      setTimeout(() => navigate('/'), 2000);
      
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register hospital",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Register Your Hospital</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our network of healthcare providers and help patients find quality medical care
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="w-6 h-6 mr-3 text-blue-600" />
              Hospital Information
            </CardTitle>
            <CardDescription>
              Please provide accurate information about your healthcare facility
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Hospital Name *</label>
                  <Input
                    placeholder="e.g., City Medical Center"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Contact Number *</label>
                  <Input
                    placeholder="e.g., +91 9876543210"
                    value={formData.contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <Textarea
                  placeholder="Enter complete address..."
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Hospital Type</label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="ngo">NGO</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Available Services</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviceOptions.map((service) => (
                    <Badge
                      key={service}
                      variant={formData.services.includes(service) ? "default" : "outline"}
                      className="cursor-pointer p-3 justify-center hover:bg-blue-50 transition-colors"
                      onClick={() => toggleService(service)}
                    >
                      {service}
                    </Badge>
                  ))}
                </div>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Register Hospital
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

export default RegisterHospital;