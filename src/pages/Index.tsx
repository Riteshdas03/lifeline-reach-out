
import { useState } from 'react';
import { MapPin, Phone, Heart, Search, Navigation, Clock, Users, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import HospitalFinder from '@/components/HospitalFinder';
import BloodBankSearch from '@/components/BloodBankSearch';
import EmergencyServices from '@/components/EmergencyServices';
import EmergencyDonorSearch from '@/components/EmergencyDonorSearch';
import HealthCamps from '@/components/HealthCamps';

const Index = () => {
  const [activeTab, setActiveTab] = useState('hospitals');

  const stats = [
    { icon: Heart, label: 'Lives Saved', value: '25,000+', color: 'from-red-500 to-pink-500' },
    { icon: MapPin, label: 'Hospitals Listed', value: '1,200+', color: 'from-blue-500 to-cyan-500' },
    { icon: Users, label: 'Blood Donors', value: '50,000+', color: 'from-green-500 to-emerald-500' },
    { icon: Clock, label: 'Avg Response Time', value: '3 mins', color: 'from-purple-500 to-violet-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Enhanced Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Platform Statistics
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Making Healthcare <span className="text-blue-600">Accessible</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`bg-gradient-to-br ${stat.color} w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Main Services */}
      <section id="services-section" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 mb-4 sm:mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Our Services
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Comprehensive Healthcare <span className="text-blue-600">Access</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find trusted hospitals, blood banks, and emergency services in your area. 
              Real-time availability and instant directions powered by AI.
            </p>
          </div>

          {/* Enhanced Service Tabs */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-2 sm:p-2 max-w-4xl mx-auto shadow-xl border border-gray-100 mb-8 sm:mb-12">
            {/* Mobile Tab Carousel */}
            <div className="block sm:hidden">
              <div className="flex overflow-x-auto scrollbar-hide gap-2 p-1">
                {[
                  { id: 'hospitals', label: 'Hospitals', icon: MapPin, color: 'text-blue-600' },
                  { id: 'blood', label: 'Blood Banks', icon: Heart, color: 'text-red-600' },
                  { id: 'emergency', label: 'Emergency', icon: Phone, color: 'text-orange-600' },
                  { id: 'donor-search', label: 'Find Donors', icon: Heart, color: 'text-red-600' },
                  { id: 'camps', label: 'Health Camps', icon: Users, color: 'text-green-600' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    data-tab={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300 whitespace-nowrap font-medium text-sm ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg`
                        : `text-gray-600 hover:text-gray-900 hover:bg-gray-50`
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Tab Grid */}
            <div className="hidden sm:flex flex-wrap justify-center gap-1">
              {[
                { id: 'hospitals', label: 'Hospitals', icon: MapPin, color: 'text-blue-600' },
                { id: 'blood', label: 'Blood Banks', icon: Heart, color: 'text-red-600' },
                { id: 'emergency', label: 'Emergency', icon: Phone, color: 'text-orange-600' },
                { id: 'donor-search', label: 'Find Donors', icon: Heart, color: 'text-red-600' },
                { id: 'camps', label: 'Health Camps', icon: Users, color: 'text-green-600' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300 flex-1 font-medium text-sm sm:text-base min-w-0 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105`
                      : `text-gray-600 hover:text-gray-900 hover:bg-gray-50`
                  }`}
                >
                  <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                  <span className="hidden sm:inline truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Service Content */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {activeTab === 'hospitals' && <HospitalFinder />}
            {activeTab === 'blood' && <BloodBankSearch />}
            {activeTab === 'emergency' && <EmergencyServices />}
            {activeTab === 'donor-search' && <EmergencyDonorSearch />}
            {activeTab === 'camps' && <HealthCamps />}
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200 mr-2 sm:mr-3" />
            <span className="text-blue-100 font-medium text-sm sm:text-base">Join the Healthcare Revolution</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            You can't save a life you can't see. 
            <span className="block text-blue-200 mt-2">Let's fix that together.</span>
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of healthcare providers and donors making healthcare accessible for everyone across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link to="/register-hospital">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Register Your Hospital
              </Button>
            </Link>
            <Link to="/become-donor">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-xl backdrop-blur-sm">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Become a Blood Donor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
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
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <span className="text-white font-bold text-xs sm:text-sm">FB</span>
                </a>
                <a 
                  href="https://x.com/Riteshdas495?t=6R4ZXHmp8x1yktqjPUKPiA&s=09" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-400 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors"
                >
                  <span className="text-white font-bold text-xs sm:text-sm">TW</span>
                </a>
                <a 
                  href="http://www.linkedin.com/in/ritesh-das-a96ab4273" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-800 transition-colors"
                >
                  <span className="text-white font-bold text-xs sm:text-sm">LI</span>
                </a>
              </div>
            </div>
            
            <div className="mt-8 md:mt-0">
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-blue-400">Quick Access</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:text-blue-400" />
                  Find Hospitals
                </a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:text-blue-400" />
                  Blood Banks
                </a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:text-blue-400" />
                  Emergency Services
                </a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors flex items-center group text-sm sm:text-base">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:text-blue-400" />
                  Health Camps
                </a></li>
              </ul>
            </div>
            
            <div className="mt-8 md:mt-0">
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-blue-400">Support</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Terms of Service</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm sm:text-base">Accessibility</a></li>
              </ul>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700 text-center md:text-left">
            <p className="text-xs sm:text-sm text-gray-400">
              Developed By <span className="text-blue-400 font-semibold">Ritesh Das</span> | © 2025 MediReach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
