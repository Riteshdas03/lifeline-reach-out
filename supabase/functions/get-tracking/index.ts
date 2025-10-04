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

    const url = new URL(req.url)
    const routeId = url.pathname.split('/').pop()

    if (!routeId) {
      throw new Error('Route ID required')
    }

    // Get route data
    const { data: routeData, error: routeError } = await supabaseClient
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .eq('user_id', user.id)
      .single()

    if (routeError) {
      throw routeError
    }

    // Get latest tracking
    const { data: trackingData, error: trackingError } = await supabaseClient
      .from('tracking')
      .select('*')
      .eq('route_id', routeId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (trackingError && trackingError.code !== 'PGRST116') { // Ignore "no rows" error
      throw trackingError
    }

    return new Response(
      JSON.stringify({
        route: routeData,
        tracking: trackingData || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error getting tracking:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
