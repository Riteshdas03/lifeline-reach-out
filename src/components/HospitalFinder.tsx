
import { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Filter, Navigation, Map, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import GoogleMapsHospitalFinder from './GoogleMapsHospitalFinder';

const HospitalFinder = () => {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Find Hospitals Near You</h3>
        <p className="text-gray-600 text-sm sm:text-base">Real-time availability and instant directions to healthcare facilities</p>
      </div>

      <GoogleMapsHospitalFinder />
    </div>
  );
};

export default HospitalFinder;
