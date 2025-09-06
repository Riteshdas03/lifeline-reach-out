import React from 'react';
import EmergencyWidget from '@/components/EmergencyWidget';
import Header from '@/components/Header';

const Emergency: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <EmergencyWidget />
        </div>
      </div>
    </div>
  );
};

export default Emergency;