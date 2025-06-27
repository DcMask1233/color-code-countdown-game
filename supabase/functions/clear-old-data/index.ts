
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

    console.log('🧹 Starting data cleanup...');

    // Delete old game results with unformatted periods (not containing dashes)
    const { data: deletedResults, error: deleteError } = await supabaseClient
      .from('game_results')
      .delete()
      .not('period', 'like', '%-%-%')
      .select('period');

    if (deleteError) {
      console.error('❌ Error deleting old results:', deleteError);
      throw deleteError;
    }

    const deletedCount = deletedResults?.length || 0;
    console.log(`🗑️ Deleted ${deletedCount} old game results with unformatted periods`);

    // Also clean up any unsettled bets with old period format
    const { data: deletedBets, error: deleteBetsError } = await supabaseClient
      .from('user_bets')
      .delete()
      .not('period', 'like', '%-%-%')
      .eq('settled', false)
      .select('period');

    if (deleteBetsError) {
      console.error('❌ Error deleting old bets:', deleteBetsError);
    } else {
      const deletedBetsCount = deletedBets?.length || 0;
      console.log(`🗑️ Deleted ${deletedBetsCount} old unsettled bets with unformatted periods`);
    }

    console.log('✅ Data cleanup complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleanup complete: ${deletedCount} old results and ${deletedBets?.length || 0} old bets deleted`,
        deletedResults: deletedCount,
        deletedBets: deletedBets?.length || 0,
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
    console.error('💥 Critical error in data cleanup:', error);
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
