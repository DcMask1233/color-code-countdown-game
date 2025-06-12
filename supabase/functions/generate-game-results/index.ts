
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting game result generation...');

    // Generate results for all game types and durations
    const gameTypes = ['parity', 'sapre', 'bcone', 'emerd'];
    const durations = [60, 180, 300]; // 1min, 3min, 5min

    const results = [];

    for (const gameType of gameTypes) {
      for (const duration of durations) {
        console.log(`Generating result for ${gameType} ${duration}s`);
        
        const { data, error } = await supabaseClient.rpc('insert_game_result', {
          p_game_type: gameType,
          p_duration: duration
        });

        if (error) {
          console.error(`Error generating result for ${gameType} ${duration}s:`, error);
        } else {
          console.log(`Generated result for ${gameType} ${duration}s:`, data);
          results.push({
            gameType,
            duration,
            result: data[0]
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Game results generated successfully',
        results 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-game-results function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
