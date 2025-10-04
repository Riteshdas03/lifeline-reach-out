# MediReach Navigation Setup Guide

## Overview
This guide will help you set up the complete Google Maps navigation system for MediReach, including real-time tracking, turn-by-turn voice instructions, and route storage.

## Prerequisites
- Google Cloud Platform account
- Supabase project (already configured)
- Google Maps API keys

## 1. Google Cloud Setup

### Enable Required APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project or create a new one
3. Enable the following APIs:
   - **Maps JavaScript API** (for map rendering)
   - **Places API** (for search autocomplete)
   - **Directions API** (for routing)
   - **Distance Matrix API** (for ETA calculations)
   - **Geocoding API** (optional, for address lookups)

### Create API Keys

#### Client-Side Key (Browser)
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Name it: `MediReach Client Key`
4. Click **Restrict Key**:
   - **Application restrictions**: HTTP referrers
   - Add your domains:
     ```
     https://adc8c2f3-0270-409f-9f2d-bd3ae0c8dee4.lovableproject.com/*
     https://yourdomain.com/*
     localhost:5173/*
     ```
   - **API restrictions**: Select these APIs only:
     - Maps JavaScript API
     - Places API
5. Save the key

#### Server-Side Key (Edge Functions)
1. Create another API key
2. Name it: `MediReach Server Key`
3. Click **Restrict Key**:
   - **Application restrictions**: None (or IP if you know Supabase IPs)
   - **API restrictions**: Select these APIs only:
     - Directions API
     - Distance Matrix API
4. Save the key

### Set Usage Quotas (Optional but Recommended)
1. Go to **APIs & Services > Quotas**
2. Set daily request limits to prevent unexpected charges
3. Recommended limits for development:
   - Maps JavaScript API: 10,000/day
   - Directions API: 1,000/day
   - Places API: 1,000/day

## 2. Configure Supabase

### Add Server API Key Secret
The system has already prompted you to add `GOOGLE_MAPS_SERVER_KEY`. Make sure to:
1. Go to your Supabase project
2. Navigate to **Project Settings > Edge Functions**
3. Add the secret:
   - Name: `GOOGLE_MAPS_SERVER_KEY`
   - Value: [Your server-side API key from step 1]

### Verify Database Migration
The database tables (`routes` and `tracking`) have been created. Verify by:
1. Go to Supabase **SQL Editor**
2. Run: `SELECT * FROM routes LIMIT 1;`
3. Should return empty result or existing data

## 3. Update Frontend Configuration

### Add Client API Key
Update `index.html` to load Google Maps:
```html
<script async defer
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_CLIENT_KEY&libraries=places,geometry&callback=initMap">
</script>
```

Replace `YOUR_CLIENT_KEY` with your client-side API key.

## 4. Test the Navigation System

### Manual Testing Steps

#### 1. Test User Location
- Open the navigation page
- Browser should prompt for location permission
- Allow location access
- Map should center on your location
- Blue dot marker should appear

#### 2. Test Search
- Type "hospital" in the search box
- Autocomplete suggestions should appear
- Select a hospital
- Map should pan to that location

#### 3. Test Route Calculation
- Click on a hospital marker
- Click "Navigate" button
- Blue route should appear on map
- Grey alternate routes should display
- Turn-by-turn instructions should show in panel

#### 4. Test Voice Instructions
- Toggle voice button ON (speaker icon)
- Start navigation
- First instruction should be spoken
- Note: May not work in all browsers (Chrome recommended)

#### 5. Test Live Tracking
- Start navigation
- If on mobile, walk/drive
- Blue dot should move with you
- Current step should update automatically
- Distance and ETA should decrease

#### 6. Test Vehicle Modes
- Select different vehicle types (car/bike/walk)
- Routes should recalculate based on mode
- ETA should adjust accordingly

### Simulating GPS Movement (Desktop Testing)

#### Chrome DevTools
1. Open Developer Tools (F12)
2. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
3. Type "sensors" and select "Show Sensors"
4. In Sensors tab:
   - Select "Custom location"
   - Enter coordinates
   - Click "Manage" to add multiple points
5. Navigate between saved locations to simulate movement

#### Firefox
1. Open about:config
2. Search for: `geo.enabled`
3. Use extensions like "Location Guard" to override location

## 5. Production Deployment

### Security Checklist
- [ ] Client key restricted to your domains only
- [ ] Server key has no referrer restrictions but limited APIs
- [ ] Supabase RLS policies are active
- [ ] Edge functions verify JWT tokens
- [ ] API keys are not in source code
- [ ] Usage quotas are set

### Environment Variables
For production deployment, ensure:
```bash
# Supabase (auto-configured)
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]

# Edge Function Secrets (configured in Supabase)
GOOGLE_MAPS_SERVER_KEY=[your-server-key]
```

### Update Routes in App
Add navigation route to your router:
```tsx
import Navigation from './pages/Navigation';

// In your routes
<Route path="/navigate" element={<Navigation />} />
```

## 6. Troubleshooting

### Common Issues

#### "Google Maps failed to load"
- Check API key is correct
- Verify domains are whitelisted
- Check browser console for specific error
- Ensure Maps JavaScript API is enabled

#### "Failed to create route"
- Check server API key is configured in Supabase
- Verify Directions API is enabled
- Check edge function logs in Supabase
- Ensure coordinates are valid

#### Voice not working
- Only works in Chrome, Edge, Safari (not Firefox)
- Check browser settings allow speech synthesis
- Verify voice toggle is ON
- Try refreshing page

#### Location not updating
- Check browser location permissions
- Verify HTTPS (required for geolocation)
- On mobile, ensure location services are ON
- Check cellular/WiFi connection

#### Route deviation not triggering reroute
- Increase `OFF_ROUTE_THRESHOLD` in code
- Verify GPS accuracy (needs < 30m typically)
- Check console for geolocation errors

### Edge Function Logs
View logs in Supabase:
1. Go to **Edge Functions**
2. Click on function name
3. View **Logs** tab
4. Filter by error level

## 7. Cost Optimization

### Google Maps Pricing (as of 2024)
- **Maps JavaScript API**: $7 per 1,000 loads (first 28,000 free/month)
- **Directions API**: $5 per 1,000 requests (first 40,000 free/month)
- **Places API**: $17 per 1,000 requests (first 28,000 free/month)

### Tips to Reduce Costs
1. **Cache routes** in Supabase (already implemented)
2. **Batch requests** when possible
3. **Use clustering** for markers (already implemented)
4. **Implement debouncing** on search autocomplete
5. **Set up billing alerts** in Google Cloud
6. **Use static maps** for thumbnails instead of dynamic maps

## 8. Feature Enhancements (Optional)

### Planned Features
- [ ] Traffic overlay
- [ ] Multi-stop routing
- [ ] Route history
- [ ] Share route with others
- [ ] Offline maps (PWA)
- [ ] Incident reporting
- [ ] Speed limit warnings

### Customization Options
- Adjust marker icons (edit vehicle icons in code)
- Change route colors (modify polyline styles)
- Customize voice pitch/rate (edit voice settings)
- Add custom map styles (provide mapStyleArray)

## 9. Support Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps)
- [Supabase Documentation](https://supabase.com/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)

## 10. Next Steps

1. ✅ Complete Google Cloud setup
2. ✅ Add API keys
3. ✅ Test on desktop
4. ✅ Test on mobile device
5. ✅ Enable production domains
6. ✅ Set up monitoring
7. ✅ Deploy to production

---

For questions or issues, check the console logs and edge function logs first. Most issues are related to API key restrictions or missing permissions.
