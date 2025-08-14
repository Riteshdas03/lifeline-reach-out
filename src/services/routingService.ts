import L from 'leaflet';
import 'leaflet-routing-machine';

export interface RouteInstruction {
  text: string;
  distance: string;
  time: string;
  type: string;
}

export interface RouteResult {
  instructions: RouteInstruction[];
  totalDistance: string;
  totalTime: string;
  waypoints: L.LatLng[];
}

export interface RoutingProvider {
  calculateRoute(start: L.LatLng, end: L.LatLng): Promise<RouteResult>;
  createRoutingControl(start: L.LatLng, end: L.LatLng): L.Routing.Control;
}

/**
 * OSRM Provider - Free routing service using OpenStreetMap data
 * This is the default provider that works without API keys
 */
class OSRMProvider implements RoutingProvider {
  async calculateRoute(start: L.LatLng, end: L.LatLng): Promise<RouteResult> {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&overview=full`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }
      
      const route = data.routes[0];
      const instructions: RouteInstruction[] = route.legs[0].steps.map((step: any) => ({
        text: step.maneuver.instruction || 'Continue',
        distance: this.formatDistance(step.distance),
        time: this.formatDuration(step.duration),
        type: step.maneuver.type
      }));
      
      return {
        instructions,
        totalDistance: this.formatDistance(route.distance),
        totalTime: this.formatDuration(route.duration),
        waypoints: [start, end]
      };
    } catch (error) {
      console.error('OSRM routing error:', error);
      throw new Error('Failed to calculate route. Please try again.');
    }
  }

  createRoutingControl(start: L.LatLng, end: L.LatLng): L.Routing.Control {
    return L.Routing.control({
      waypoints: [start, end],
      routeWhileDragging: false,
      addWaypoints: false,
      lineOptions: {
        styles: [
          { color: '#3b82f6', weight: 6, opacity: 0.8 },
          { color: 'white', weight: 4, opacity: 0.9 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 100
      },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving'
      }),
      show: false, // Hide default instructions panel
      fitSelectedRoutes: false
    } as any);
  }

  private formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}

/**
 * Mapbox Provider - Premium routing service (50k free requests/month)
 * Requires VITE_MAPBOX_ACCESS_TOKEN environment variable
 */
class MapboxProvider implements RoutingProvider {
  private accessToken: string;

  constructor() {
    this.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    if (!this.accessToken) {
      throw new Error('Mapbox access token not found. Set VITE_MAPBOX_ACCESS_TOKEN environment variable.');
    }
  }

  async calculateRoute(start: L.LatLng, end: L.LatLng): Promise<RouteResult> {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=true&geometries=geojson&access_token=${this.accessToken}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }
      
      const route = data.routes[0];
      const instructions: RouteInstruction[] = route.legs[0].steps.map((step: any) => ({
        text: step.maneuver.instruction || 'Continue',
        distance: this.formatDistance(step.distance),
        time: this.formatDuration(step.duration),
        type: step.maneuver.type
      }));
      
      return {
        instructions,
        totalDistance: this.formatDistance(route.distance),
        totalTime: this.formatDuration(route.duration),
        waypoints: [start, end]
      };
    } catch (error) {
      console.error('Mapbox routing error:', error);
      throw new Error('Failed to calculate route using Mapbox. Please try again.');
    }
  }

  createRoutingControl(start: L.LatLng, end: L.LatLng): L.Routing.Control {
    // For Mapbox, we'll use custom implementation since LRM doesn't directly support Mapbox
    // This is a placeholder - in real implementation, you'd create custom routing control
    throw new Error('Mapbox routing control not implemented yet');
  }

  private formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}

/**
 * Google Maps Provider - Premium routing service ($200 free credit/month)
 * Requires VITE_GOOGLE_MAPS_API_KEY environment variable
 */
class GoogleMapsProvider implements RoutingProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Google Maps API key not found. Set VITE_GOOGLE_MAPS_API_KEY environment variable.');
    }
  }

  async calculateRoute(start: L.LatLng, end: L.LatLng): Promise<RouteResult> {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
        throw new Error(`Google Maps API error: ${data.status}`);
      }
      
      const route = data.routes[0];
      const leg = route.legs[0];
      const instructions: RouteInstruction[] = leg.steps.map((step: any) => ({
        text: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
        distance: step.distance.text,
        time: step.duration.text,
        type: step.maneuver || 'straight'
      }));
      
      return {
        instructions,
        totalDistance: leg.distance.text,
        totalTime: leg.duration.text,
        waypoints: [start, end]
      };
    } catch (error) {
      console.error('Google Maps routing error:', error);
      throw new Error('Failed to calculate route using Google Maps. Please try again.');
    }
  }

  createRoutingControl(start: L.LatLng, end: L.LatLng): L.Routing.Control {
    // For Google Maps, we'll use custom implementation since LRM doesn't support Google Maps directly
    // This is a placeholder - in real implementation, you'd create custom routing control
    throw new Error('Google Maps routing control not implemented yet');
  }
}

/**
 * Routing Service Factory
 * Switch between providers here by changing the provider type
 */
export type ProviderType = 'osrm' | 'mapbox' | 'google';

export class RoutingService {
  private provider: RoutingProvider;

  constructor(providerType: ProviderType = 'osrm') {
    switch (providerType) {
      case 'mapbox':
        this.provider = new MapboxProvider();
        break;
      case 'google':
        this.provider = new GoogleMapsProvider();
        break;
      case 'osrm':
      default:
        this.provider = new OSRMProvider();
        break;
    }
  }

  async getRoute(start: L.LatLng, end: L.LatLng): Promise<RouteResult> {
    return this.provider.calculateRoute(start, end);
  }

  createRoutingControl(start: L.LatLng, end: L.LatLng): L.Routing.Control {
    return this.provider.createRoutingControl(start, end);
  }
}

// Default service instance - change provider here to switch globally
export const routingService = new RoutingService('osrm');