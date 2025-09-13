import { Shield, Lock, Eye, UserCheck, FileText, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: 'Information We Collect',
      icon: UserCheck,
      content: [
        'Personal information (name, email, phone number) when you register',
        'Location data to help you find nearby healthcare services',
        'Medical facility information when hospitals register on our platform',
        'Usage data to improve our services and user experience',
        'Device information for security and optimization purposes'
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: FileText,
      content: [
        'To provide you with nearby hospital and healthcare service information',
        'To connect you with blood banks and emergency services',
        'To improve our platform and develop new features',
        'To send important notifications about healthcare services',
        'To verify and maintain the accuracy of medical facility information'
      ]
    },
    {
      title: 'Information Sharing',
      icon: Eye,
      content: [
        'We do not sell your personal information to third parties',
        'Healthcare providers may access your contact information when you request services',
        'Emergency services may receive your location data during emergency situations',
        'We may share aggregated, non-personal data for healthcare research',
        'Legal authorities may access information when required by law'
      ]
    },
    {
      title: 'Data Security',
      icon: Lock,
      content: [
        'We use industry-standard encryption to protect your data',
        'All personal information is stored on secure servers',
        'Regular security audits and updates are performed',
        'Access to your information is restricted to authorized personnel only',
        'We comply with Indian data protection laws and regulations'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4 sm:mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Privacy Policy
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Your Privacy <span className="text-blue-600">Matters</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              At MediReach, we are committed to protecting your privacy and personal information. 
              This policy explains how we collect, use, and safeguard your data.
            </p>
            <div className="mt-6 text-sm text-gray-500">
              Last updated: January 2025
            </div>
          </div>

          {/* Important Notice */}
          <Card className="mb-8 sm:mb-12 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-orange-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-800 mb-2">Important Notice</h3>
                  <p className="text-orange-700 text-sm sm:text-base">
                    In medical emergencies, we may share your location and contact information 
                    with emergency services and nearby hospitals to ensure you receive immediate 
                    medical attention. This is done to save lives and is considered vital for 
                    emergency medical care.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
          <div className="space-y-8 sm:space-y-12">
            {sections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl sm:text-2xl">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <section.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-sm sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Your Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                  <li>• Access your personal information</li>
                  <li>• Request correction of inaccurate data</li>
                  <li>• Delete your account and data</li>
                  <li>• Opt-out of non-essential communications</li>
                  <li>• File complaints with data protection authorities</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Cookies & Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                  <li>• Essential cookies for platform functionality</li>
                  <li>• Analytics cookies to improve user experience</li>
                  <li>• Location tracking only when permitted</li>
                  <li>• No tracking for advertising purposes</li>
                  <li>• You can disable cookies in your browser</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <Card className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Have Privacy Questions?
                </h2>
                <p className="text-blue-100 mb-6">
                  If you have any questions about this privacy policy or how we handle your data, 
                  please don't hesitate to contact us.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <a 
                    href="/contact" 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-colors duration-200 text-center"
                  >
                    Contact Us
                  </a>
                  <a 
                    href="mailto:privacy@medireach.in" 
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-xl font-semibold transition-colors duration-200 text-center"
                  >
                    Email Privacy Team
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Notice */}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-sm text-gray-500">
              MediReach complies with the Information Technology Act, 2000 and other applicable 
              Indian data protection laws. We are committed to maintaining the highest standards 
              of data privacy and security.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;