
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

    console.log('🔄 Starting settlement of existing unsettled bets...');

    // Get all unsettled bets
    const { data: unsettledBets, error: betsError } = await supabaseClient
      .from('user_bets')
      .select('*')
      .eq('settled', false);

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

    console.log(`📊 Found ${unsettledBets.length} unsettled bets`);
    let settledCount = 0;

    // Group bets by period and game type for efficient processing
    const betGroups = new Map();
    unsettledBets.forEach(bet => {
      const key = `${bet.game_type}-${bet.period}`;
      if (!betGroups.has(key)) {
        betGroups.set(key, []);
      }
      betGroups.get(key).push(bet);
    });

    console.log(`🎯 Processing ${betGroups.size} unique game periods`);

    // Process each group
    for (const [key, bets] of betGroups) {
      const [gameType, period] = key.split('-');
      
      console.log(`🎮 Processing ${bets.length} bets for ${gameType} period ${period}`);

      // Get the result for this period and game type
      const { data: results, error: resultError } = await supabaseClient
        .from('game_results')
        .select('*')
        .eq('game_type', gameType)
        .eq('period', period)
        .limit(1);

      if (resultError) {
        console.error(`❌ Error fetching result for ${gameType} ${period}:`, resultError);
        continue;
      }

      if (!results || results.length === 0) {
        console.log(`⏳ No result found for ${gameType} ${period}, skipping`);
        continue;
      }

      const result = results[0];
      const winningNumber = result.number;
      const winningColors = result.result_color;

      console.log(`🎲 Result for ${gameType} ${period}: number=${winningNumber}, colors=${JSON.stringify(winningColors)}`);

      // Process each bet in this group
      for (const bet of bets) {
        let payout = 0;
        let isWin = false;

        console.log(`🎯 Processing bet: type=${bet.bet_type}, value=${bet.bet_value}, amount=${bet.amount}`);

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

        // Credit winnings to wallet if won
        if (payout > 0) {
          const { error: walletError } = await supabaseClient
            .from('wallets')
            .update({
              balance: supabaseClient.raw('balance + ?', [payout]),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', bet.user_id);

          if (walletError) {
            console.error(`❌ Error updating wallet for user ${bet.user_id}:`, walletError);
          } else {
            console.log(`💰 Credited ${payout} to user ${bet.user_id} wallet`);
          }
        }

        console.log(`✅ Bet ${bet.id} settled: win=${isWin}, payout=${payout}`);
        settledCount++;
      }
    }

    console.log(`🏁 Settlement complete: ${settledCount} bets settled out of ${unsettledBets.length} total`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Settlement complete: ${settledCount} bets settled`,
        settled_count: settledCount,
        total_unsettled: unsettledBets.length,
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
    console.error('💥 Critical error in settle-existing-bets function:', error);
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
