import { useState, useEffect } from 'react';
import { MapPin, Phone, Heart, Users, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import HospitalFinder from '@/components/HospitalFinder';
import BloodBankSearch from '@/components/BloodBankSearch';
import EmergencyServices from '@/components/EmergencyServices';
import EmergencyDonorSearch from '@/components/EmergencyDonorSearch';
import HealthCamps from '@/components/HealthCamps';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import iconDoctor from '@/assets/icon-doctor.png';
import iconHospital from '@/assets/icon-hospital.png';
import iconBlood from '@/assets/icon-blood.png';
import iconAmbulance from '@/assets/icon-ambulance.png';

const Index = () => {
  const [activeTab, setActiveTab] = useState('hospitals');

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out'
    });
  }, []);

  const stats = [
    { icon: Heart, label: 'Lives Saved', value: '25,000+', color: 'from-red-400 to-red-500' },
    { icon: MapPin, label: 'Hospitals Listed', value: '1,200+', color: 'from-primary to-secondary' },
    { icon: Users, label: 'Blood Donors', value: '50,000+', color: 'from-green-400 to-emerald-500' },
    { icon: Clock, label: 'Avg Response Time', value: '3 mins', color: 'from-purple-400 to-purple-500' },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F8F5] via-white to-[#A3E4D7]/20">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Enhanced Stats Section with Animation */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent"
          animate={{
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-secondary/20 text-primary border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Platform Statistics
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Making Healthcare <span className="text-primary">Accessible</span>
            </h2>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center group"
                variants={fadeInUp}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`bg-gradient-to-br ${stat.color} w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium text-sm sm:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Main Services with Tabs */}
      <section id="services-section" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#E8F8F5] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            data-aos="fade-up"
          >
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 sm:mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Our Services
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              Comprehensive Healthcare <span className="text-primary">Access</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Find trusted hospitals, blood banks, and emergency services in your area. 
              Real-time availability and instant directions powered by AI.
            </p>
          </motion.div>

          {/* Enhanced Service Tabs */}
          <motion.div 
            className="bg-white rounded-2xl p-2 max-w-4xl mx-auto shadow-xl border border-border/50 mb-8 sm:mb-12"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {/* Mobile Tab Carousel */}
            <div className="block sm:hidden">
              <div className="flex overflow-x-auto scrollbar-hide gap-2 p-1">
                {[
                  { id: 'hospitals', label: 'Hospitals', icon: MapPin, color: 'text-primary' },
                  { id: 'blood', label: 'Blood Banks', icon: Heart, color: 'text-red-500' },
                  { id: 'emergency', label: 'Emergency', icon: Phone, color: 'text-orange-500' },
                  { id: 'donor-search', label: 'Find Donors', icon: Heart, color: 'text-red-500' },
                  { id: 'camps', label: 'Health Camps', icon: Users, color: 'text-green-500' },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    data-tab={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 whitespace-nowrap font-medium text-sm ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r from-primary to-secondary text-white shadow-lg`
                        : `text-muted-foreground hover:text-foreground hover:bg-muted/50`
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Desktop Tab Grid */}
            <div className="hidden sm:flex flex-wrap justify-center gap-2">
              {[
                { id: 'hospitals', label: 'Hospitals', icon: MapPin, color: 'text-primary' },
                { id: 'blood', label: 'Blood Banks', icon: Heart, color: 'text-red-500' },
                { id: 'emergency', label: 'Emergency', icon: Phone, color: 'text-orange-500' },
                { id: 'donor-search', label: 'Find Donors', icon: Heart, color: 'text-red-500' },
                { id: 'camps', label: 'Health Camps', icon: Users, color: 'text-green-500' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 flex-1 font-medium text-sm sm:text-base min-w-0 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-primary to-secondary text-white shadow-lg`
                      : `text-muted-foreground hover:text-foreground hover:bg-muted/50`
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                  <span className="hidden sm:inline truncate">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Service Content with Animation */}
          <motion.div 
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-border/50"
            data-aos="fade-up"
            data-aos-delay="200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeTab === 'hospitals' && <HospitalFinder />}
            {activeTab === 'blood' && <BloodBankSearch />}
            {activeTab === 'emergency' && <EmergencyServices />}
            {activeTab === 'donor-search' && <EmergencyDonorSearch />}
            {activeTab === 'camps' && <HealthCamps />}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Call to Action with 3D Icons */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary via-secondary to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <motion.div 
          className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8"
            data-aos="fade-up"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white mr-2 sm:mr-3" />
            <span className="text-white font-medium text-sm sm:text-base">Join the Healthcare Revolution</span>
          </motion.div>
          
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            You can't save a life you can't see. 
            <span className="block text-white/90 mt-2">Let's fix that together.</span>
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Join thousands of healthcare providers and donors making healthcare accessible for everyone across India.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <Link to="/register-hospital">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 rounded-2xl shadow-xl font-semibold">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Register Your Hospital
                </Button>
              </motion.div>
            </Link>
            <Link to="/become-donor">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-6 rounded-2xl shadow-xl font-semibold">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  Become a Blood Donor
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer with Animations */}
      <footer className="bg-foreground text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-[#1a2332] to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
            <motion.div 
              className="col-span-1 md:col-span-2"
              data-aos="fade-up"
            >
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-primary to-secondary p-2 sm:p-3 rounded-xl shadow-lg">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold">MediReach</span>
                  <p className="text-xs sm:text-sm text-gray-400">Healthcare Access Platform</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed max-w-md text-sm sm:text-base">
                Connecting people to life-saving healthcare services across India. 
                Real-time access to hospitals, blood banks, and emergency care when you need it most.
              </p>
              <div className="flex space-x-3 sm:space-x-4 mb-6 sm:mb-0">
                
                <a 
                  href="https://www.facebook.com/profile.php?id=100091245684954" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <span className="text-white font-bold text-xs sm:text-sm">FB</span>
                </a>
                <a 
                  href="https://x.com/Riteshdas495?t=6R4ZXHmp8x1yktqjPUKPiA&s=09" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <span className="text-white font-bold text-xs sm:text-sm">TW</span>
                </a>
                <a 
                  href="http://www.linkedin.com/in/ritesh-das-a96ab4273" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  <span className="text-white font-bold text-xs sm:text-sm">LI</span>
                </a>
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-8 md:mt-0"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-primary">Quick Access</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link to="/find-hospitals" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:text-primary" />
                  Find Hospitals
                </Link></li>
                <li><Link to="/blood-banks" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:text-primary" />
                  Blood Banks
                </Link></li>
                <li><Link to="/emergency-services" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:text-primary" />
                  Emergency Services
                </Link></li>
                <li><Link to="/health-camps" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:text-primary" />
                  Health Camps
                </Link></li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="mt-8 md:mt-0"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-primary">Support</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Contact Us</Link></li>
                <li><Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Terms of Service</Link></li>
              </ul>
            </motion.div>
          </div>
          
          {/* Footer Bottom */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700 text-center md:text-left">
            <p className="text-xs sm:text-sm text-gray-400">
              Developed By <span className="text-primary font-semibold">Ritesh Das</span> | © 2025 MediReach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
