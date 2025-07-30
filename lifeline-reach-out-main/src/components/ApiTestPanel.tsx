
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHospitals, useNearbyHospitals, useBloodBanks, useBloodBankSearch, useCamps, useEmergencyHospital } from '@/hooks/useApi';
import { Loader, MapPin, Phone, Clock } from 'lucide-react';

const ApiTestPanel = () => {
  const [nearbyParams, setNearbyParams] = useState({ lat: 28.6129, lng: 77.2295, radius: 5 });
  const [bloodParams, setBloodParams] = useState({ bloodGroup: 'O+', lat: 28.6129, lng: 77.2295, radius: 10 });
  const [emergencyParams, setEmergencyParams] = useState({ lat: 28.6129, lng: 77.2295 });

  const { data: hospitals, isLoading: hospitalsLoading } = useHospitals();
  const { data: nearbyHospitals, isLoading: nearbyLoading } = useNearbyHospitals(nearbyParams);
  const { data: bloodBanks, isLoading: bloodBanksLoading } = useBloodBanks();
  const { data: bloodSearch, isLoading: bloodSearchLoading } = useBloodBankSearch(bloodParams);
  const { data: camps, isLoading: campsLoading } = useCamps();
  const { data: emergencyHospital, isLoading: emergencyLoading } = useEmergencyHospital(
    emergencyParams.lat, emergencyParams.lng
  );

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">API Testing Panel</h2>
        <p className="text-gray-600">Test all MediReach backend APIs (currently using mock data)</p>
      </div>

      <Tabs defaultValue="hospitals" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
          <TabsTrigger value="blood">Blood Banks</TabsTrigger>
          <TabsTrigger value="camps">Camps</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="hospitals">
          <Card>
            <CardHeader>
              <CardTitle>All Hospitals API</CardTitle>
            </CardHeader>
            <CardContent>
              {hospitalsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="h-6 w-6 animate-spin mr-2" />
                  Loading hospitals...
                </div>
              ) : (
                <div className="space-y-4">
                  {hospitals?.map((hospital) => (
                    <div key={hospital._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{hospital.name}</h3>
                        <Badge variant={hospital.status === 'open' ? 'default' : 'secondary'}>
                          {hospital.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{hospital.type} • {hospital.address}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {hospital.location.lat}, {hospital.location.lng}
                        <Phone className="w-4 h-4 ml-4 mr-1" />
                        {hospital.contact}
                      </div>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {hospital.facilities.map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nearby">
          <Card>
            <CardHeader>
              <CardTitle>Nearby Hospitals API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <Input
                  type="number"
                  placeholder="Latitude"
                  value={nearbyParams.lat}
                  onChange={(e) => setNearbyParams({...nearbyParams, lat: parseFloat(e.target.value)})}
                />
                <Input
                  type="number"
                  placeholder="Longitude"
                  value={nearbyParams.lng}
                  onChange={(e) => setNearbyParams({...nearbyParams, lng: parseFloat(e.target.value)})}
                />
                <Input
                  type="number"
                  placeholder="Radius (km)"
                  value={nearbyParams.radius}
                  onChange={(e) => setNearbyParams({...nearbyParams, radius: parseInt(e.target.value)})}
                />
              </div>
              
              {nearbyLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="h-6 w-6 animate-spin mr-2" />
                  Searching nearby hospitals...
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Found {nearbyHospitals?.length || 0} hospitals within {nearbyParams.radius}km
                  </p>
                  {nearbyHospitals?.map((hospital) => (
                    <div key={hospital._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{hospital.name}</h3>
                        <Badge variant={hospital.status === 'open' ? 'default' : 'secondary'}>
                          {hospital.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{hospital.address}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blood">
          <Card>
            <CardHeader>
              <CardTitle>Blood Bank Search API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <select
                  value={bloodParams.bloodGroup}
                  onChange={(e) => setBloodParams({...bloodParams, bloodGroup: e.target.value})}
                  className="border rounded px-3 py-2"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
                <Input
                  type="number"
                  placeholder="Latitude"
                  value={bloodParams.lat}
                  onChange={(e) => setBloodParams({...bloodParams, lat: parseFloat(e.target.value)})}
                />
                <Input
                  type="number"
                  placeholder="Longitude"
                  value={bloodParams.lng}
                  onChange={(e) => setBloodParams({...bloodParams, lng: parseFloat(e.target.value)})}
                />
                <Input
                  type="number"
                  placeholder="Radius (km)"
                  value={bloodParams.radius}
                  onChange={(e) => setBloodParams({...bloodParams, radius: parseInt(e.target.value)})}
                />
              </div>

              {bloodSearchLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="h-6 w-6 animate-spin mr-2" />
                  Searching blood banks...
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Found {bloodSearch?.length || 0} blood banks with {bloodParams.bloodGroup}
                  </p>
                  {bloodSearch?.map((bloodBank) => (
                    <div key={bloodBank._id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{bloodBank.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{bloodBank.address}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {bloodBank.bloodGroups.map((group, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-1" />
                        {bloodBank.contact}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="camps">
          <Card>
            <CardHeader>
              <CardTitle>Health Camps API</CardTitle>
            </CardHeader>
            <CardContent>
              {campsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="h-6 w-6 animate-spin mr-2" />
                  Loading camps...
                </div>
              ) : (
                <div className="space-y-4">
                  {camps?.map((camp) => (
                    <div key={camp._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{camp.name}</h3>
                        <Badge variant="outline">{camp.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{camp.address}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {camp.date}
                        <Phone className="w-4 h-4 ml-4 mr-1" />
                        {camp.contact}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Hospital API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  type="number"
                  placeholder="Emergency Latitude"
                  value={emergencyParams.lat}
                  onChange={(e) => setEmergencyParams({...emergencyParams, lat: parseFloat(e.target.value)})}
                />
                <Input
                  type="number"
                  placeholder="Emergency Longitude"
                  value={emergencyParams.lng}
                  onChange={(e) => setEmergencyParams({...emergencyParams, lng: parseFloat(e.target.value)})}
                />
              </div>

              {emergencyLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="h-6 w-6 animate-spin mr-2" />
                  Finding nearest emergency hospital...
                </div>
              ) : emergencyHospital ? (
                <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-red-900">{emergencyHospital.name}</h3>
                    <Badge className="bg-red-600">{emergencyHospital.status}</Badge>
                  </div>
                  <p className="text-sm text-red-700 mb-2">{emergencyHospital.address}</p>
                  <div className="flex items-center text-sm text-red-600">
                    <Phone className="w-4 h-4 mr-1" />
                    {emergencyHospital.contact}
                  </div>
                  <Button className="mt-3 bg-red-600 hover:bg-red-700" size="sm">
                    🚨 Call Emergency
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">No emergency hospital found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiTestPanel;
