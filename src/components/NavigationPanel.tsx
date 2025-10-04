import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Navigation, MapPin } from 'lucide-react';

interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
}

interface NavigationPanelProps {
  steps: NavigationStep[];
  currentStepIndex: number;
  destinationName?: string;
  totalDistance: string;
  totalDuration: string;
}

const NavigationPanel = ({
  steps,
  currentStepIndex,
  destinationName,
  totalDistance,
  totalDuration,
}: NavigationPanelProps) => {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (stepRefs.current[currentStepIndex]) {
      stepRefs.current[currentStepIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStepIndex]);

  return (
    <Card className="h-full flex flex-col bg-background">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">{destinationName || 'Destination'}</h2>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{totalDistance}</span>
          <span>•</span>
          <span>{totalDuration}</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              ref={(el) => (stepRefs.current[index] = el)}
              className={`p-3 rounded-lg border transition-all ${
                index === currentStepIndex
                  ? 'bg-primary/10 border-primary shadow-sm'
                  : index < currentStepIndex
                  ? 'opacity-50'
                  : 'bg-muted/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 mt-1 ${
                    index === currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Navigation className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      index === currentStepIndex ? 'font-medium' : ''
                    }`}
                    dangerouslySetInnerHTML={{ __html: step.instruction }}
                  />
                  <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{step.distance}</span>
                    {step.duration && (
                      <>
                        <span>•</span>
                        <span>{step.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default NavigationPanel;
