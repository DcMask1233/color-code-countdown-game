
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

    console.log('🔧 Starting period synchronization fix...');

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

    console.log(`📊 Found ${unsettledBets.length} unsettled bets`);
    
    // Group bets by game type for processing
    const betsByGame = new Map();
    unsettledBets.forEach(bet => {
      const key = `${bet.game_type}`;
      if (!betsByGame.has(key)) {
        betsByGame.set(key, []);
      }
      betsByGame.get(key).push(bet);
    });

    let totalSettled = 0;

    // Process each game type
    for (const [gameType, bets] of betsByGame) {
      console.log(`🎮 Processing ${bets.length} bets for ${gameType}`);

      // Get unique periods for this game type
      const uniquePeriods = [...new Set(bets.map(bet => bet.period))];
      
      for (const period of uniquePeriods) {
        console.log(`📅 Processing period ${period} for ${gameType}`);

        // Get game results for this period and game type (check all durations)
        const { data: results, error: resultError } = await supabaseClient
          .from('game_results')
          .select('*')
          .eq('game_type', gameType)
          .eq('period', period);

        if (resultError) {
          console.error(`❌ Error fetching results for ${gameType} ${period}:`, resultError);
          continue;
        }

        if (!results || results.length === 0) {
          console.log(`⏳ No results found for ${gameType} ${period}, skipping`);
          continue;
        }

        // Use the first result (they should all have same number/colors for same period)
        const result = results[0];
        const winningNumber = result.number;
        const winningColors = result.result_color;

        console.log(`🎲 Found result for ${gameType} ${period}: number=${winningNumber}, colors=${JSON.stringify(winningColors)}`);

        // Get bets for this specific period
        const periodBets = bets.filter(bet => bet.period === period);

        // Settle each bet
        for (const bet of periodBets) {
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
                balance: supabaseClient.raw(`balance + ${payout}`),
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
          totalSettled++;
        }
      }
    }

    console.log(`🏁 Period sync fix complete: ${totalSettled} bets settled`);

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
