// Map Marker Animation Utilities
// These functions help animate Leaflet.js map markers

/**
 * Adds drop-in animation to a Leaflet marker
 * @param marker - The Leaflet marker instance
 * @param delay - Animation delay in milliseconds (optional)
 */
export const animateMarkerDrop = (marker: any, delay: number = 0) => {
  if (!marker || !marker.getElement) return;
  
  const element = marker.getElement();
  if (!element) return;

  // Set initial state
  element.style.opacity = '0';
  element.style.transform = 'translateY(-50px) scale(0.8)';
  element.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

  // Trigger animation after delay
  setTimeout(() => {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0) scale(1)';
  }, delay);
};

/**
 * Adds staggered drop animation to multiple markers
 * @param markers - Array of Leaflet marker instances
 * @param staggerDelay - Delay between each marker animation (default: 100ms)
 */
export const animateMarkersStaggered = (markers: any[], staggerDelay: number = 100) => {
  markers.forEach((marker, index) => {
    animateMarkerDrop(marker, index * staggerDelay);
  });
};

/**
 * CSS class names that can be applied to marker elements
 */
export const markerAnimationClasses = {
  drop: 'marker-drop',
  bounce: 'marker-bounce',
  fadeIn: 'fade-in',
} as const;

/**
 * Apply CSS animation class to a marker element
 * @param marker - The Leaflet marker instance
 * @param animationClass - The CSS animation class to apply
 */
export const applyMarkerAnimation = (marker: any, animationClass: string) => {
  if (!marker || !marker.getElement) return;
  
  const element = marker.getElement();
  if (!element) return;

  element.classList.add(animationClass);
  
  // Remove animation class after animation completes to allow re-animation
  element.addEventListener('animationend', () => {
    element.classList.remove(animationClass);
  }, { once: true });
};

/**
 * Example usage for hospital markers:
 * 
 * import { animateMarkerDrop, animateMarkersStaggered } from '@/utils/mapAnimations';
 * 
 * // For single marker
 * const hospitalMarker = L.marker([lat, lng]).addTo(map);
 * animateMarkerDrop(hospitalMarker);
 * 
 * // For multiple markers with stagger effect
 * const allMarkers = hospitals.map(hospital => 
 *   L.marker([hospital.lat, hospital.lng]).addTo(map)
 * );
 * animateMarkersStaggered(allMarkers, 150);
 */