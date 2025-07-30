
import React from 'react';
import { MapPin, Navigation, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Hospital, UserLocation } from '@/types/hospital';

interface HospitalListCardProps {
  hospital: Hospital;
  userLocation: UserLocation | null;
  onGetDirections: (hospital: Hospital) => void;
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'open': return 'Open';
    case 'available': return 'Available';
    case 'full': return 'Full';
    default: return 'Unknown';
  }
};

const HospitalListCard = ({ hospital, userLocation, onGetDirections }: HospitalListCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-yellow-100 text-yellow-800';
      case 'full': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-gray-900">{hospital.name}</h4>
          <Badge className={getStatusColor(hospital.status)}>
            {getStatusText(hospital.status)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-2">{hospital.type}</p>
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{hospital.address}</span>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={() => onGetDirections(hospital)}
            className="flex-1"
          >
            <Navigation className="w-3 h-3 mr-1" />
            Directions
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open(`tel:${hospital.phone}`, '_self')}
          >
            <Phone className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalListCard;
