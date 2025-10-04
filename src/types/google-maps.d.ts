
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element | null, opts?: MapOptions);
      setCenter(latlng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      getZoom(): number;
      setZoom(zoom: number): void;
      panTo(latlng: LatLng | LatLngLiteral): void;
      fitBounds(bounds: LatLngBounds, padding?: number): void;
      setMapTypeId(mapTypeId: string): void;
    }

    class LatLngBounds {
      constructor();
      extend(point: LatLng | LatLngLiteral): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      addListener(eventName: string, handler: Function): void;
      setMap(map: Map | null): void;
      getPosition(): LatLng | undefined;
      setPosition(position: LatLng | LatLngLiteral): void;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: Marker): void;
      close(): void;
    }

    class Geocoder {
      constructor();
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void): void;
    }

    interface GeocoderRequest {
      address?: string;
    }

    interface GeocoderResult {
      geometry: {
        location: LatLng;
      };
    }

    enum GeocoderStatus {
      OK = 'OK'
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class Size {
      constructor(width: number, height: number);
    }

    interface MapOptions {
      zoom?: number;
      center?: LatLng | LatLngLiteral;
      styles?: MapTypeStyle[];
      mapTypeId?: string;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      gestureHandling?: string;
    }

    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string | Icon;
    }

    interface InfoWindowOptions {
      content?: string | Element;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface Icon {
      url: string;
      scaledSize?: Size;
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: any[];
    }

    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain',
    }

    class DirectionsService {
      route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: DirectionsStatus) => void): void;
    }

    class DirectionsRenderer {
      constructor(opts?: DirectionsRendererOptions);
      setMap(map: Map | null): void;
      setDirections(directions: DirectionsResult): void;
      setRouteIndex(index: number): void;
    }

    interface DirectionsRequest {
      origin: LatLng | LatLngLiteral | string;
      destination: LatLng | LatLngLiteral | string;
      travelMode: TravelMode;
      provideRouteAlternatives?: boolean;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      legs: DirectionsLeg[];
      overview_polyline: { points: string };
    }

    interface DirectionsLeg {
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      steps: DirectionsStep[];
    }

    interface DirectionsStep {
      html_instructions: string;
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      end_location: LatLng;
    }

    enum DirectionsStatus {
      OK = 'OK',
      ERROR = 'ERROR',
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      BICYCLING = 'BICYCLING',
      WALKING = 'WALKING',
    }

    interface DirectionsRendererOptions {
      map?: Map;
      suppressMarkers?: boolean;
      polylineOptions?: PolylineOptions;
    }

    class Polyline {
      constructor(opts?: PolylineOptions);
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): void;
    }

    interface PolylineOptions {
      path?: LatLng[] | LatLngLiteral[];
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      map?: Map;
    }

    namespace geometry {
      namespace encoding {
        function decodePath(encodedPath: string): LatLng[];
      }
    }

    namespace places {
      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        addListener(eventName: string, handler: Function): void;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {
        types?: string[];
        componentRestrictions?: any;
      }

      interface PlaceResult {
        place_id?: string;
        name?: string;
        formatted_address?: string;
        geometry?: {
          location?: LatLng;
        };
      }
    }
  }
}

export {};
