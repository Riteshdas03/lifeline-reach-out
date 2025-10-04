import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface NavigationState {
  routeId: string | null;
  isNavigating: boolean;
  currentLocation: { lat: number; lng: number } | null;
  remainingDistance: number;
  remainingTime: number;
  currentStepIndex: number;
  isVoiceEnabled: boolean;
}

export const useNavigation = () => {
  const [state, setState] = useState<NavigationState>({
    routeId: null,
    isNavigating: false,
    currentLocation: null,
    remainingDistance: 0,
    remainingTime: 0,
    currentStepIndex: 0,
    isVoiceEnabled: localStorage.getItem('voiceEnabled') === 'true',
  });

  const watchIdRef = useRef<number | null>(null);

  const createRoute = useCallback(async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    vehicleType: string,
    destinationName?: string,
    destinationAddress?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-route', {
        body: {
          startLat,
          startLng,
          endLat,
          endLng,
          vehicleType,
          destinationName,
          destinationAddress,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating route:', error);
      toast({
        title: 'Error',
        description: 'Failed to create route',
        variant: 'destructive',
      });
      return null;
    }
  }, []);

  const startNavigation = useCallback(async (
    routeId: string,
    startLat: number,
    startLng: number
  ) => {
    try {
      const { error } = await supabase.functions.invoke('start-tracking', {
        body: { routeId, lat: startLat, lng: startLng },
      });

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        routeId,
        isNavigating: true,
        currentLocation: { lat: startLat, lng: startLng },
      }));

      // Start watching position
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, heading } = position.coords;
            updateTracking(routeId, latitude, longitude, speed, heading);
          },
          (error) => {
            console.error('Geolocation error:', error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
          }
        );
      }

      toast({
        title: 'Navigation started',
        description: 'Follow the directions on screen',
      });
    } catch (error) {
      console.error('Error starting navigation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start navigation',
        variant: 'destructive',
      });
    }
  }, []);

  const updateTracking = useCallback(async (
    routeId: string,
    lat: number,
    lng: number,
    speed?: number | null,
    heading?: number | null
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-tracking', {
        body: {
          routeId,
          lat,
          lng,
          speed,
          heading,
          remainingDistanceKm: state.remainingDistance,
          remainingEtaMinutes: state.remainingTime,
          currentStepIndex: state.currentStepIndex,
        },
      });

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        currentLocation: { lat, lng },
      }));
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  }, [state.remainingDistance, state.remainingTime, state.currentStepIndex]);

  const stopNavigation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isNavigating: false,
      routeId: null,
    }));

    toast({
      title: 'Navigation stopped',
    });
  }, []);

  const toggleVoice = useCallback(() => {
    setState((prev) => {
      const newValue = !prev.isVoiceEnabled;
      localStorage.setItem('voiceEnabled', String(newValue));
      return { ...prev, isVoiceEnabled: newValue };
    });
  }, []);

  const updateNavigationState = useCallback((updates: Partial<NavigationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    state,
    createRoute,
    startNavigation,
    stopNavigation,
    toggleVoice,
    updateNavigationState,
  };
};
