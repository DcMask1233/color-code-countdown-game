
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

    console.log('🔧 Starting comprehensive period synchronization fix...');

    // Get all unsettled bets
    const { data: unsettledBets, error: betsError } = await supabaseClient
      .from('user_bets')
      .select('*')
      .eq('settled', false)
      .order('created_at', { ascending: false });

    if (betsError) {
      console.error('❌ Error fetching unsettled bets:', betsError);
      throw betsError;
    }

    if (!unsettledBets || unsettledBets.length === 0) {
      console.log('✅ No unsettled bets found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No unsettled bets found',
          settled_count: 0
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log(`📊 Found ${unsettledBets.length} unsettled bets to process`);
    
    // Get all available results for matching
    const { data: allResults, error: resultsError } = await supabaseClient
      .from('game_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (resultsError) {
      console.error('❌ Error fetching results:', resultsError);
      throw resultsError;
    }

    console.log(`🎲 Found ${allResults?.length || 0} results available for matching`);

    let totalSettled = 0;

    // Process each unsettled bet
    for (const bet of unsettledBets) {
      console.log(`🎯 Processing bet: ${bet.id}, game=${bet.game_type}, period=${bet.period}`);

      // Try to find exact period match first
      let matchingResult = allResults?.find(result => 
        result.game_type === bet.game_type && 
        result.period === bet.period
      );

      // If no exact match, try flexible matching for similar periods
      if (!matchingResult) {
        console.log(`🔍 No exact period match for ${bet.period}, trying flexible matching...`);
        
        // Extract date part from bet period (first 8 characters: YYYYMMDD)
        const betDatePart = bet.period.substring(0, 8);
        
        // Find results from the same date and game type
        const candidateResults = allResults?.filter(result => 
          result.game_type === bet.game_type && 
          result.period.startsWith(betDatePart)
        ) || [];

        if (candidateResults.length > 0) {
          // Use the closest period result
          matchingResult = candidateResults[0];
          console.log(`🔄 Using flexible match: bet period ${bet.period} → result period ${matchingResult.period}`);
        }
      }

      if (!matchingResult) {
        console.log(`⏳ No matching result found for bet ${bet.id} (${bet.game_type} ${bet.period}), skipping`);
        continue;
      }

      const winningNumber = matchingResult.number;
      const winningColors = matchingResult.result_color;

      console.log(`🎲 Found result: number=${winningNumber}, colors=${JSON.stringify(winningColors)}`);

      let payout = 0;
      let isWin = false;

      // Calculate payout based on bet type
      if (bet.bet_type === 'number' && parseInt(bet.bet_value) === winningNumber) {
        payout = bet.amount * 9;
        isWin = true;
        console.log(`🎊 Number bet WON! ${bet.bet_value} === ${winningNumber}, payout: ${payout}`);
      } else if (bet.bet_type === 'color' && winningColors.includes(bet.bet_value)) {
        payout = bet.amount * 2;
        isWin = true;
        console.log(`🎊 Color bet WON! ${bet.bet_value} in ${JSON.stringify(winningColors)}, payout: ${payout}`);
      } else {
        console.log(`❌ Bet LOST: ${bet.bet_type}=${bet.bet_value} vs winning ${winningNumber}/${JSON.stringify(winningColors)}`);
      }

      // Update the bet record
      const { error: updateError } = await supabaseClient
        .from('user_bets')
        .update({
          settled: true,
          win: isWin,
          payout: payout
        })
        .eq('id', bet.id);

      if (updateError) {
        console.error(`❌ Error updating bet ${bet.id}:`, updateError);
        continue;
      }

      // Credit winnings to wallet if won - FIXED: Use proper balance update
      if (payout > 0) {
        // Get current balance first
        const { data: currentWallet, error: walletFetchError } = await supabaseClient
          .from('wallets')
          .select('balance')
          .eq('user_id', bet.user_id)
          .single();

        if (walletFetchError) {
          console.error(`❌ Error fetching wallet for user ${bet.user_id}:`, walletFetchError);
          continue;
        }

        // Update balance with calculated amount
        const newBalance = (currentWallet.balance || 0) + payout;
        const { error: walletError } = await supabaseClient
          .from('wallets')
          .update({
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', bet.user_id);

        if (walletError) {
          console.error(`❌ Error updating wallet for user ${bet.user_id}:`, walletError);
        } else {
          console.log(`💰 Credited ${payout} to user ${bet.user_id} wallet (new balance: ${newBalance})`);
        }
      }

      console.log(`✅ Bet ${bet.id} settled: win=${isWin}, payout=${payout}`);
      totalSettled++;
    }

    console.log(`🏁 Period sync fix complete: ${totalSettled} bets settled out of ${unsettledBets.length} total`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Period sync fix complete: ${totalSettled} bets settled`,
        settled_count: totalSettled,
        total_processed: unsettledBets.length,
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
    console.error('💥 Critical error in period sync fix:', error);
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
