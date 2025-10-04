import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, X, Navigation, Car, Bike, PersonStanding } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NavigationControlsProps {
  isNavigating: boolean;
  isVoiceEnabled: boolean;
  currentInstruction: string;
  remainingDistance: string;
  remainingTime: string;
  vehicleType: string;
  onToggleVoice: () => void;
  onStop: () => void;
  onVehicleTypeChange: (type: string) => void;
}

const vehicleIcons = {
  driving: Car,
  bicycling: Bike,
  walking: PersonStanding,
};

const NavigationControls = ({
  isNavigating,
  isVoiceEnabled,
  currentInstruction,
  remainingDistance,
  remainingTime,
  vehicleType,
  onToggleVoice,
  onStop,
  onVehicleTypeChange,
}: NavigationControlsProps) => {
  const VehicleIcon = vehicleIcons[vehicleType as keyof typeof vehicleIcons] || Car;

  return (
    <Card className="p-4 bg-background shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {isNavigating ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-5 w-5 text-primary flex-shrink-0" />
                <p
                  className="text-sm font-medium line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: currentInstruction || 'Loading directions...' }}
                />
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="secondary" className="font-mono">
                  {remainingDistance}
                </Badge>
                <span>•</span>
                <span>{remainingTime}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <VehicleIcon className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Select a destination to start navigation</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isNavigating && (
            <Select value={vehicleType} onValueChange={onVehicleTypeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="driving">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    <span>Driving</span>
                  </div>
                </SelectItem>
                <SelectItem value="bicycling">
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4" />
                    <span>Bicycling</span>
                  </div>
                </SelectItem>
                <SelectItem value="walking">
                  <div className="flex items-center gap-2">
                    <PersonStanding className="h-4 w-4" />
                    <span>Walking</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}

          <Button
            size="icon"
            variant={isVoiceEnabled ? 'default' : 'outline'}
            onClick={onToggleVoice}
            title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
          >
            {isVoiceEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>

          {isNavigating && (
            <Button size="icon" variant="destructive" onClick={onStop} title="Stop navigation">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default NavigationControls;
