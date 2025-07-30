# MediReach Animation Guide

This guide explains how to use the enhanced animation system in MediReach for smooth, accessibility-friendly user interactions.

## 🎨 Available Animations

### 1. Fade Animations (0.4s duration)

#### CSS Classes:
```css
.fade-in        /* Simple fade in */
.fade-out       /* Simple fade out */
.fade-in-up     /* Fade in with upward movement */
```

#### Tailwind Classes:
```css
animate-fade-in
animate-fade-out
animate-fade-in-up
animate-fade-out-down
```

#### Usage Examples:
```tsx
// Toasts and modals
<Toast className="fade-in">Registration Failed</Toast>

// Popup containers
<div className="animate-fade-in">
  <Card>Modal content</Card>
</div>

// Dynamic content
{isVisible && (
  <div className="fade-in-up">
    <p>Content that appears with upward motion</p>
  </div>
)}
```

### 2. Slide Animations

#### CSS Classes:
```css
.slide-up       /* Slide in from bottom */
.slide-down     /* Slide in from top */
```

#### Tailwind Classes:
```css
animate-slide-up
animate-slide-down
animate-slide-in-bottom
animate-slide-in-right
```

#### Usage Examples:
```tsx
// Registration forms sliding up from bottom
<form className="slide-up">
  <input placeholder="Hospital name" />
  <button>Register</button>
</form>

// Location drawer sliding down from top
<div className="animate-slide-down">
  <LocationPermissionDialog />
</div>

// Mobile sheets/drawers
<Sheet>
  <SheetContent className="animate-slide-in-right">
    Sheet content
  </SheetContent>
</Sheet>
```

### 3. Pulse Animations

#### CSS Classes:
```css
.pulse            /* Soft scale and opacity pulse */
.pulse-emergency  /* Emergency button with red shadow pulse */
```

#### Usage Examples:
```tsx
// Emergency/SOS button (automatically applied)
<Button className="pulse-emergency bg-red-600">
  🆘 Emergency Alert
</Button>

// Attention-grabbing elements
<Badge className="pulse">New</Badge>

// Loading indicators
<div className="pulse">
  <Skeleton className="h-4 w-32" />
</div>
```

### 4. Map Marker Drop Animation

#### CSS Classes:
```css
.marker-drop     /* Drop animation for map markers */
.marker-bounce   /* Bounce effect for pins */
.drop-in         /* Direct drop-in animation */
```

#### JavaScript Implementation:
```tsx
import { animateMarkerDrop, animateMarkersStaggered } from '@/utils/mapAnimations';

// For single hospital marker
const hospitalMarker = L.marker([lat, lng]).addTo(map);
animateMarkerDrop(hospitalMarker);

// For multiple markers with stagger effect (100ms delay between each)
const allMarkers = hospitals.map(hospital => 
  L.marker([hospital.lat, hospital.lng]).addTo(map)
);
animateMarkersStaggered(allMarkers, 150); // 150ms stagger

// Apply CSS class directly
marker.getElement()?.classList.add('marker-drop');
```

#### Leaflet Integration Example:
```tsx
// In LeafletMap component
useEffect(() => {
  if (hospitals && map) {
    const markers = hospitals.map((hospital, index) => {
      const marker = L.marker([hospital.lat, hospital.lng]).addTo(map);
      
      // Animate with staggered delay
      setTimeout(() => {
        animateMarkerDrop(marker);
      }, index * 100);
      
      return marker;
    });
    
    return () => {
      markers.forEach(marker => map.removeLayer(marker));
    };
  }
}, [hospitals, map]);
```

### 5. Shimmer Loading Skeletons

#### CSS Classes:
```css
.shimmer          /* Linear gradient shimmer effect */
.skeleton         /* Basic skeleton with pulse */
.skeleton-shimmer /* Skeleton with shimmer effect */
```

#### Pre-built Component:
```tsx
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

// Hospital list loading
<LoadingSkeleton type="hospital-list" count={3} />

// Search results loading  
<LoadingSkeleton type="search-results" count={5} />

// Generic card loading
<LoadingSkeleton type="card" count={2} />
```

#### Custom Skeleton Usage:
```tsx
// Manual skeleton construction
<div className="space-y-3 fade-in">
  <Skeleton className="h-8 w-3/4 shimmer" />
  <Skeleton className="h-4 w-full shimmer" />
  <Skeleton className="h-4 w-2/3 shimmer" />
</div>

// List of shimmer cards
{isLoading && Array.from({ length: 5 }).map((_, i) => (
  <div key={i} className="p-4 border rounded space-y-2">
    <Skeleton className="h-6 w-1/2 skeleton-shimmer" />
    <Skeleton className="h-4 w-full skeleton-shimmer" />
    <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
  </div>
))}
```

## 🎯 Integration Examples

### Toast Notifications with Fade
```tsx
const { toast } = useToast();

toast({
  title: "Registration Failed",
  description: "Please check your details",
  variant: "destructive",
  className: "fade-in" // Smooth fade in
});
```

### Modal/Dialog with Slide
```tsx
<Dialog open={isOpen}>
  <DialogContent className="slide-up">
    <DialogHeader className="fade-in-up">
      <DialogTitle>Register as Organizer</DialogTitle>
    </DialogHeader>
    <form className="space-y-4 fade-in">
      {/* Form content */}
    </form>
  </DialogContent>
</Dialog>
```

### Search Results with Stagger
```tsx
{searchResults.map((result, index) => (
  <Card 
    key={result.id}
    className="fade-in-up"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* Result content */}
  </Card>
))}
```

### Loading States
```tsx
function HospitalList({ hospitals, isLoading }) {
  if (isLoading) {
    return <LoadingSkeleton type="hospital-list" count={3} />;
  }
  
  return (
    <div className="space-y-4">
      {hospitals.map((hospital, index) => (
        <HospitalCard 
          key={hospital.id}
          hospital={hospital}
          className="fade-in-up"
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  );
}
```

## ⚡ Performance Best Practices

1. **Use CSS animations** over JavaScript for better performance
2. **Apply animations conditionally** to avoid unnecessary DOM updates
3. **Stagger animations** for multiple elements (50-150ms delay)
4. **Prefer transform and opacity** over layout-affecting properties
5. **Use `will-change` sparingly** and remove after animation
6. **Test on mobile devices** for smooth 60fps performance

## 🔧 Animation Timing

- **Fade transitions**: 0.4s (as requested)
- **Slide animations**: 0.5s for forms, 0.3s for small elements  
- **Pulse effects**: 2s infinite for emergency elements
- **Map markers**: 0.6s with spring easing
- **Shimmer loading**: 2s linear infinite

## 🎨 Design Tokens Used

All animations use the design system colors defined in `index.css`:
- `--primary`: Medical blue for attention elements
- `--destructive`: Emergency red for critical actions
- `--muted`: Loading skeleton backgrounds
- `--accent`: Interactive highlights

This ensures consistent theming across light/dark modes and maintains the healthcare-focused aesthetic.