import { Heart, MapPin, Users, Clock, Award, Shield, Target, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const About = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Real-time Hospital Finder',
      description: 'Locate nearby hospitals with live availability and directions'
    },
    {
      icon: Heart,
      title: 'Blood Bank Network',
      description: 'Connect with blood banks and verified donors instantly'
    },
    {
      icon: Users,
      title: 'Emergency Response',
      description: 'Quick access to emergency services and medical assistance'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Round-the-clock access to healthcare information'
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Accessibility',
      description: 'Making healthcare accessible to everyone, everywhere'
    },
    {
      icon: Shield,
      title: 'Reliability',
      description: 'Verified information you can trust in critical moments'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to providing the best healthcare access platform'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4 sm:mb-6">
              About MediReach
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Connecting Lives to <span className="text-blue-600">Healthcare</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              MediReach is India's leading healthcare access platform, dedicated to bridging the gap 
              between people and life-saving medical services. We believe that everyone deserves 
              immediate access to quality healthcare when they need it most.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white mb-12 sm:mb-16">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                Our Mission
              </h2>
              <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                To revolutionize healthcare accessibility in India by providing real-time information 
                about hospitals, blood banks, and emergency services, ensuring no one is left behind 
                when seeking medical assistance.
              </p>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                What We <span className="text-blue-600">Offer</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Comprehensive healthcare access solutions designed with you in mind
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Our Values */}
          <div className="mb-12 sm:mb-16 lg:mb-20">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Our <span className="text-blue-600">Values</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The principles that drive everything we do
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mr-4">
                        <value.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <CardTitle className="text-lg sm:text-xl">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm sm:text-base">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 mb-12 sm:mb-16">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Our <span className="text-blue-600">Impact</span>
              </h2>
              <p className="text-lg text-gray-600">
                Real numbers, real impact on people's lives
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">25,000+</div>
                <div className="text-gray-600 text-sm sm:text-base">Lives Impacted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2">1,200+</div>
                <div className="text-gray-600 text-sm sm:text-base">Hospitals Listed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 mb-2">50,000+</div>
                <div className="text-gray-600 text-sm sm:text-base">Blood Donors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 mb-2">3 mins</div>
                <div className="text-gray-600 text-sm sm:text-base">Avg Response Time</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-green-600 to-green-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
              Join Our Mission
            </h2>
            <p className="text-lg sm:text-xl text-green-100 mb-6 sm:mb-8 max-w-3xl mx-auto">
              Be part of the healthcare revolution. Together, we can make quality healthcare 
              accessible to every Indian, everywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <a 
                href="/register-hospital" 
                className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-xl font-semibold transition-colors duration-200 text-center"
              >
                Register Hospital
              </a>
              <a 
                href="/become-donor" 
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-6 py-3 rounded-xl font-semibold transition-colors duration-200 text-center"
              >
                Become Donor
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;