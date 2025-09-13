import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Heart, User } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const Contact = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Emergency Helpline',
      details: '+91-108 (24/7 Emergency)',
      description: 'For medical emergencies and urgent assistance'
    },
    {
      icon: Mail,
      title: 'Email Support',
      details: 'support@medireach.in',
      description: 'General inquiries and support requests'
    },
    {
      icon: MapPin,
      title: 'Office Address',
      details: 'MediReach HQ, Kolkata, West Bengal, India',
      description: 'Our main office and development center'
    },
    {
      icon: Clock,
      title: 'Support Hours',
      details: '24/7 Emergency | 9 AM - 6 PM Support',
      description: 'We\'re here when you need us most'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4 sm:mb-6">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Us
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Get in <span className="text-blue-600">Touch</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our services? Need help with the platform? 
              We're here to assist you 24/7. Reach out to us anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <Heart className="w-6 h-6 mr-3" />
                    <h2 className="text-xl font-bold">We're Here to Help</h2>
                  </div>
                  <p className="text-blue-100 mb-6">
                    Your health and safety are our top priorities. Contact us for any assistance.
                  </p>
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-sm text-blue-100">
                      <strong>Emergency?</strong> Call 108 immediately for medical emergencies.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div className="bg-blue-100 p-2 rounded-lg mr-4">
                            <info.icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                            <p className="text-blue-600 font-medium mb-1">{info.details}</p>
                            <p className="text-sm text-gray-600">{info.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Send us a Message
                  </CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <Input
                          id="firstName"
                          type="text"
                          required
                          className="w-full"
                          placeholder="Your first name"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <Input
                          id="lastName"
                          type="text"
                          required
                          className="w-full"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          required
                          className="w-full"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          className="w-full"
                          placeholder="+91-XXXXXXXXXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        required
                        className="w-full"
                        placeholder="What is this regarding?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        required
                        rows={6}
                        className="w-full resize-none"
                        placeholder="Please describe your inquiry in detail..."
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        <strong>Note:</strong> For medical emergencies, please call 108 directly. 
                        This form is for general inquiries and support requests only.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        How do I register my hospital on MediReach?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Visit our "Register Hospital" page and fill out the required information. 
                        Our team will verify and activate your listing within 24-48 hours.
                      </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Is the platform free to use?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Yes, MediReach is completely free for patients to find hospitals, 
                        blood banks, and emergency services. Hospital registration is also free.
                      </p>
                    </div>
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        What should I do in a medical emergency?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Call 108 immediately for medical emergencies. You can also use our 
                        emergency services feature to find the nearest hospital quickly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;