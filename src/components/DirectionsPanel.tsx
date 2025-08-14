import React from 'react';
import { X, Navigation, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RouteResult } from '@/services/routingService';

interface DirectionsPanelProps {
  route: RouteResult | null;
  destinationName: string;
  onClose: () => void;
  isLoading?: boolean;
  error?: string;
}

const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  route,
  destinationName,
  onClose,
  isLoading = false,
  error
}) => {
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto bg-background/95 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Navigation className="h-5 w-5 text-primary" />
              Calculating Route...
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto bg-background/95 backdrop-blur-sm border-destructive/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-destructive">
              <Navigation className="h-5 w-5" />
              Route Error
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 w-full"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!route) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-background/95 backdrop-blur-sm border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className="h-5 w-5 text-primary" />
            Directions
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{destinationName}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-primary font-medium">
              <Clock className="h-4 w-4" />
              {route.totalTime}
            </div>
            <div className="text-muted-foreground">
              {route.totalDistance}
            </div>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <div className="p-4 space-y-3">
            {route.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-3 text-sm">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-foreground leading-relaxed">
                    {instruction.text}
                  </p>
                  {instruction.distance && (
                    <p className="text-xs text-muted-foreground">
                      {instruction.distance} • {instruction.time}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DirectionsPanel;