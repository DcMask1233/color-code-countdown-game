
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { gameType, gameMode, action } = await req.json()

    if (action === 'create_period') {
      // Create new game period
      const duration = gameMode === 'wingo1min' ? 60 : 
                     gameMode === 'wingo3min' ? 180 : 
                     gameMode === 'wingo5min' ? 300 : 60

      const { data, error } = await supabase.rpc('create_new_period', {
        p_game_type: gameType.toLowerCase(),
        p_game_mode: gameMode.toLowerCase(),
        p_duration: duration
      })

      if (error) {
        console.error('Error creating period:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, periodId: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'settle_period') {
      // Generate result and settle bets
      const { periodId } = await req.json()

      const { error } = await supabase.rpc('generate_and_settle_result', {
        p_period_id: periodId
      })

      if (error) {
        console.error('Error settling period:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Error in game-period-manager:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
