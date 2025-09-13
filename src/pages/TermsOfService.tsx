import { FileText, AlertTriangle, CheckCircle, XCircle, Scale, Shield } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TermsOfService = () => {
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: CheckCircle,
      content: [
        'By accessing and using MediReach, you accept and agree to be bound by these terms',
        'If you do not agree to these terms, please do not use our services',
        'These terms may be updated from time to time, and continued use constitutes acceptance',
        'Users must be at least 13 years old to use our services',
        'Healthcare providers must have valid licenses and certifications'
      ]
    },
    {
      title: 'Platform Services',
      icon: FileText,
      content: [
        'MediReach provides information about healthcare facilities and services',
        'We facilitate connections between patients and healthcare providers',
        'Emergency services information is provided for immediate assistance',
        'Blood bank and donor network access for critical situations',
        'All information is provided as-is and may not always be 100% current'
      ]
    },
    {
      title: 'User Responsibilities',
      icon: Shield,
      content: [
        'Provide accurate and current information when registering',
        'Use the platform only for legitimate healthcare purposes',
        'Respect the privacy and rights of other users',
        'Do not misuse emergency services or false emergency reporting',
        'Healthcare providers must maintain accurate facility information'
      ]
    },
    {
      title: 'Prohibited Activities',
      icon: XCircle,
      content: [
        'Providing false or misleading healthcare information',
        'Impersonating healthcare providers or medical professionals',
        'Using the platform for illegal activities or fraud',
        'Spamming or harassing other users',
        'Attempting to hack or disrupt our services'
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
              <Scale className="w-4 h-4 mr-2" />
              Terms of Service
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Terms & <span className="text-blue-600">Conditions</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              These terms govern your use of MediReach and define the rights and responsibilities 
              of all users. Please read them carefully before using our services.
            </p>
            <div className="mt-6 text-sm text-gray-500">
              Last updated: January 2025
            </div>
          </div>

          {/* Important Medical Disclaimer */}
          <Card className="mb-8 sm:mb-12 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">Medical Disclaimer</h3>
                  <p className="text-red-700 text-sm sm:text-base">
                    <strong>MediReach is not a medical service provider.</strong> We provide 
                    information and connections to healthcare facilities but do not provide 
                    medical advice, diagnosis, or treatment. In medical emergencies, always 
                    call emergency services (108) immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms Sections */}
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

          {/* Additional Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                  <li>• MediReach is not liable for medical outcomes</li>
                  <li>• Information accuracy is not guaranteed</li>
                  <li>• Users are responsible for verifying information</li>
                  <li>• No warranty on service availability</li>
                  <li>• Third-party services are beyond our control</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                  <li>• MediReach owns all platform content and code</li>
                  <li>• Users retain rights to their personal information</li>
                  <li>• No copying or redistribution without permission</li>
                  <li>• Trademark and logo protection applies</li>
                  <li>• Fair use for healthcare purposes is permitted</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Privacy & Data</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                  <li>• Your privacy is governed by our Privacy Policy</li>
                  <li>• Location data is used for service provision</li>
                  <li>• Personal information is protected and encrypted</li>
                  <li>• Emergency data sharing may occur to save lives</li>
                  <li>• You can delete your account and data anytime</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base text-gray-600">
                  <li>• Users can terminate their account anytime</li>
                  <li>• We may suspend accounts for terms violations</li>
                  <li>• Healthcare providers must maintain valid licenses</li>
                  <li>• Data retention follows our privacy policy</li>
                  <li>• Emergency access may continue as legally required</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Governing Law */}
          <Card className="mt-8 sm:mt-12">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Governing Law & Jurisdiction</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                These terms are governed by the laws of India. Any disputes arising from the use 
                of MediReach shall be subject to the exclusive jurisdiction of the courts in 
                Kolkata, West Bengal, India. We comply with the Information Technology Act, 2000, 
                Indian Medical Council regulations, and other applicable Indian laws governing 
                healthcare information services.
              </p>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Questions About These Terms?
                </h2>
                <p className="text-blue-100 mb-6">
                  If you have any questions about these terms of service or need clarification 
                  on any point, please contact our legal team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <a 
                    href="/contact" 
                    className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-colors duration-200 text-center"
                  >
                    Contact Support
                  </a>
                  <a 
                    href="mailto:legal@medireach.in" 
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-xl font-semibold transition-colors duration-200 text-center"
                  >
                    Email Legal Team
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acceptance Notice */}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-sm text-gray-500">
              By using MediReach, you acknowledge that you have read, understood, and agree to 
              be bound by these Terms of Service and our Privacy Policy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;