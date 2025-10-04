import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const { startLat, startLng, endLat, endLng, vehicleType = 'driving', destinationName, destinationAddress } = await req.json()

    if (!startLat || !startLng || !endLat || !endLng) {
      throw new Error('Missing required coordinates')
    }

    // Call Google Directions API
    const googleApiKey = Deno.env.get('GOOGLE_MAPS_SERVER_KEY')
    if (!googleApiKey) {
      throw new Error('Google Maps API key not configured')
    }

    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&mode=${vehicleType === 'car' ? 'driving' : vehicleType}&alternatives=true&key=${googleApiKey}`
    
    const directionsResponse = await fetch(directionsUrl)
    const directionsData = await directionsResponse.json()

    if (directionsData.status !== 'OK') {
      throw new Error(`Directions API error: ${directionsData.status}`)
    }

    const route = directionsData.routes[0]
    const leg = route.legs[0]

    // Store route in database
    const { data: routeData, error: routeError } = await supabaseClient
      .from('routes')
      .insert({
        user_id: user.id,
        start_lat: startLat,
        start_lng: startLng,
        end_lat: endLat,
        end_lng: endLng,
        vehicle_type: vehicleType,
        polyline: route.overview_polyline.points,
        distance_km: leg.distance.value / 1000,
        eta_minutes: Math.round(leg.duration.value / 60),
        destination_name: destinationName,
        destination_address: destinationAddress,
        status: 'created'
      })
      .select()
      .single()

    if (routeError) {
      throw routeError
    }

    return new Response(
      JSON.stringify({
        routeId: routeData.id,
        route: directionsData,
        storedRoute: routeData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating route:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
