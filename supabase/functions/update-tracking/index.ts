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

    const { routeId, lat, lng, speed, heading, remainingDistanceKm, remainingEtaMinutes, currentStepIndex } = await req.json()

    if (!routeId || !lat || !lng) {
      throw new Error('Missing required fields')
    }

    // Insert new tracking record
    const { data: trackingData, error: trackingError } = await supabaseClient
      .from('tracking')
      .insert({
        route_id: routeId,
        user_id: user.id,
        lat,
        lng,
        speed,
        heading,
        remaining_distance_km: remainingDistanceKm,
        remaining_eta_minutes: remainingEtaMinutes,
        current_step_index: currentStepIndex,
        status: 'active'
      })
      .select()
      .single()

    if (trackingError) {
      throw trackingError
    }

    return new Response(
      JSON.stringify({ success: true, tracking: trackingData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error updating tracking:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
