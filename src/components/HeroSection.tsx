
import { MapPin, Phone, Heart, Search, Navigation, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

const HeroSection = () => {
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const { latitude, longitude, getCurrentLocation } = useGeolocation();
  const { toast } = useToast();

  const handleEmergencyClick = async () => {
    if (!latitude || !longitude) {
      toast({
        title: "Location Required",
        description: "Please allow location access for emergency services",
        variant: "destructive",
      });
      getCurrentLocation();
      return;
    }

    setEmergencyLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('get_nearby_hospitals', {
        lat: latitude,
        lng: longitude,
        radius: 5.0
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const nearest = data[0];
        toast({
          title: `🚨 Nearest Hospital: ${nearest.name}`,
          description: `📞 ${nearest.contact} | ${nearest.distance_km?.toFixed(1)} km away`,
        });
        
        // Show alert with hospital info
        const confirmed = confirm(
          `🚨 EMERGENCY ALERT\n\nNearest Hospital: ${nearest.name}\nDistance: ${nearest.distance_km?.toFixed(1)} km\nContact: ${nearest.contact}\n\nPress OK to call hospital or Cancel to call 108`
        );
        
        if (confirmed) {
          window.open(`tel:${nearest.contact}`);
        } else {
          window.open('tel:108');
        }
      } else {
        window.open('tel:108');
      }
    } catch (error) {
      console.error('Emergency error:', error);
      window.open('tel:108');
    } finally {
      setEmergencyLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <div className="w-8 h-8 bg-blue-400/20 rounded-full blur-sm"></div>
      </div>
      <div className="absolute top-40 right-20 animate-pulse">
        <div className="w-6 h-6 bg-white/10 rounded-full"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            <div className="inline-flex items-center bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 mr-2 sm:mr-3" />
              <span className="text-blue-100 font-medium text-sm sm:text-base">Trusted by 25,000+ patients nationwide</span>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                Find Nearby 
                <span className="block bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  Healthcare Access
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 max-w-2xl leading-relaxed">
                Discover hospitals, blood banks, and emergency medical aid in real-time. 
                Because every second counts when lives are at stake.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white shadow-xl transform hover:scale-105 transition-all duration-300 group text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
                onClick={handleEmergencyClick}
                disabled={emergencyLoading}
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover:animate-pulse" />
                {emergencyLoading ? 'Finding Hospital...' : '🚨 Emergency Help'}
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 shadow-xl backdrop-blur-sm text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
                onClick={() => {
                  document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                🏥 Find Hospitals
              </Button>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative max-w-lg mx-auto lg:mx-0">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input 
                  placeholder="Search by location or hospital name..."
                  className="hero-search-input pl-10 sm:pl-12 pr-12 sm:pr-16 py-3 sm:py-4 bg-white/95 backdrop-blur-sm border-0 rounded-xl sm:rounded-2xl shadow-2xl text-gray-800 placeholder:text-gray-500 focus:ring-4 focus:ring-blue-300/50 text-sm sm:text-base"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      const searchValue = input.value;
                      if (searchValue.trim()) {
                        // Scroll to services section and set search query
                        document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                        // Trigger search in HospitalFinder component
                        setTimeout(() => {
                          const hospitalTab = document.querySelector('[data-tab="hospitals"]') as HTMLButtonElement;
                          if (hospitalTab) hospitalTab.click();
                          
                          const searchInput = document.querySelector('#hospital-search') as HTMLInputElement;
                          if (searchInput) {
                            searchInput.value = searchValue;
                            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                          }
                        }, 500);
                      }
                    }
                  }}
                />
                <Button 
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-lg sm:rounded-xl p-2 sm:p-3"
                  onClick={() => {
                    const input = document.querySelector('.hero-search-input') as HTMLInputElement;
                    const searchValue = input?.value;
                    if (searchValue?.trim()) {
                      document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                      setTimeout(() => {
                        const hospitalTab = document.querySelector('[data-tab="hospitals"]') as HTMLButtonElement;
                        if (hospitalTab) hospitalTab.click();
                        
                        const searchInput = document.querySelector('#hospital-search') as HTMLInputElement;
                        if (searchInput) {
                          searchInput.value = searchValue;
                          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                      }, 500);
                    }
                  }}
                >
                  <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-blue-200">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs sm:text-sm">Real-time updates</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs sm:text-sm">1,200+ verified hospitals</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs sm:text-sm">24/7 emergency support</span>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 lg:mt-0">
            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 group">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="bg-gradient-to-br from-green-400 to-green-600 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Real-time Status</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Live availability updates from 1,200+ healthcare facilities across the country</p>
                <Badge className="mt-3 sm:mt-4 bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm">
                  99.9% Uptime
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 group">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="bg-gradient-to-br from-red-400 to-red-600 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Blood Bank Network</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">50,000+ verified donors across all blood groups nationwide</p>
                <Badge className="mt-3 sm:mt-4 bg-red-100 text-red-800 border-red-200 text-xs sm:text-sm">
                  Active Network
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 group">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Emergency Response</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">Average 3-minute response time for critical medical emergencies</p>
                <Badge className="mt-3 sm:mt-4 bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm">
                  24/7 Support
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 group">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Navigation className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Smart Directions</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">GPS-powered routing to the nearest available healthcare facility</p>
                <Badge className="mt-3 sm:mt-4 bg-purple-100 text-purple-800 border-purple-200 text-xs sm:text-sm">
                  AI Powered
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
