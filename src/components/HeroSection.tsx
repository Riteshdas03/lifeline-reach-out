import { MapPin, Phone, Heart, Search, Navigation, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import heroIllustration from '@/assets/hero-medical-illustration.png';

const HeroSection = () => {
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const { latitude, longitude, getCurrentLocation } = useGeolocation();
  const { toast } = useToast();

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  const fadeInRight = {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, delay: 0.2 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#A3E4D7] via-white to-[#E8F8F5]">
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute top-10 sm:top-20 left-5 sm:left-10 w-24 h-24 sm:w-32 sm:h-32 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-32 h-32 sm:w-40 sm:h-40 bg-secondary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content - Animated */}
          <motion.div 
            className="text-center lg:text-left space-y-6 lg:space-y-8"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div 
              className="inline-flex items-center bg-white/80 backdrop-blur-md border border-primary/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-lg"
              variants={fadeInUp}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2 sm:mr-3" />
              <span className="text-foreground font-medium text-sm sm:text-base">Trusted by 25,000+ patients nationwide</span>
            </motion.div>
            
            <motion.div className="space-y-4 sm:space-y-6" variants={fadeInUp}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Health Is Our 
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  First Priority
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                Discover hospitals, blood banks, and emergency medical aid in real-time. 
                Because every second counts when lives are at stake.
              </p>
            </motion.div>

            {/* Quick Actions - Animated */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full"
              variants={fadeInUp}
            >
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-white shadow-xl group text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl h-auto min-h-[48px] sm:min-h-[56px]"
                  onClick={handleEmergencyClick}
                  disabled={emergencyLoading}
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-pulse flex-shrink-0" />
                  <span className="flex-1">{emergencyLoading ? 'Finding Hospital...' : '🚨 Emergency Help'}</span>
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 ml-2 flex-shrink-0" />
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-2 border-primary/30 bg-white/50 backdrop-blur-sm text-foreground hover:bg-primary hover:text-white shadow-xl text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-xl sm:rounded-2xl h-auto min-h-[48px] sm:min-h-[56px]"
                  onClick={() => {
                    document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="flex-1">🏥 Find Hospitals</span>
                </Button>
              </motion.div>
            </motion.div>

            {/* Enhanced Search Bar - Animated */}
            <motion.div 
              className="relative max-w-lg mx-auto lg:mx-0"
              variants={fadeInUp}
            >
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                <Input 
                  placeholder="Search by location or hospital name..."
                  className="hero-search-input pl-10 sm:pl-12 pr-12 sm:pr-16 py-3 sm:py-4 bg-white/95 backdrop-blur-sm border-2 border-primary/20 rounded-2xl shadow-lg text-foreground placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/20 text-sm sm:text-base"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      const searchValue = input.value;
                      if (searchValue.trim()) {
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
                    }
                  }}
                />
                <Button 
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 rounded-xl p-2 sm:p-3"
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
                  <Navigation className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </Button>
              </div>
            </motion.div>

            {/* Trust Indicators - Animated */}
            <motion.div 
              className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-muted-foreground"
              variants={fadeInUp}
            >
              <div className="flex items-center">
                <motion.div 
                  className="w-2 h-2 bg-primary rounded-full mr-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs sm:text-sm">Real-time updates</span>
              </div>
              <div className="flex items-center">
                <motion.div 
                  className="w-2 h-2 bg-secondary rounded-full mr-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
                <span className="text-xs sm:text-sm">1,200+ verified hospitals</span>
              </div>
              <div className="flex items-center">
                <motion.div 
                  className="w-2 h-2 bg-destructive rounded-full mr-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                />
                <span className="text-xs sm:text-sm">24/7 emergency support</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Illustration with Animation */}
          <motion.div
            className="relative w-full max-w-md mx-auto lg:max-w-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src={heroIllustration} 
                alt="Healthcare Professional" 
                className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-2xl"
              />
            </motion.div>
            
            {/* Floating decorative elements */}
            <motion.div
              className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 rounded-full blur-2xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
