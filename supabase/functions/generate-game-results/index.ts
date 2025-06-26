
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

    console.log('🎮 Starting automated game result generation...');

    // Generate results for all game types and durations
    const gameTypes = ['parity', 'sapre', 'bcone', 'emerd'];
    const durations = [60, 180, 300]; // 1min, 3min, 5min in seconds

    const results = [];

    for (const gameType of gameTypes) {
      for (const duration of durations) {
        console.log(`🎯 Generating result for ${gameType} ${duration}s`);
        
        try {
          const { data, error } = await supabaseClient.rpc('insert_game_result', {
            p_game_type: gameType,
            p_duration: duration
          });

          if (error) {
            console.error(`❌ Error for ${gameType} ${duration}s:`, error);
            continue;
          }

          if (data && data.length > 0) {
            const result = data[0];
            console.log(`✅ Result for ${gameType} ${duration}s:`, result);
            results.push({
              gameType,
              duration,
              period: result.period,
              number: result.number,
              colors: result.result_color
            });
          }
        } catch (funcError) {
          console.error(`💥 Function error for ${gameType} ${duration}s:`, funcError);
        }
      }
    }

    console.log(`🏁 Generated ${results.length} results successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Generated ${results.length} game results and settled bets`,
        results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('💥 Critical error in generate-game-results function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
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
