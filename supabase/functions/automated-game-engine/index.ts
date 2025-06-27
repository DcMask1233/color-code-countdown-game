
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

    console.log('🎮 Starting automated game engine...');

    // Generate results for all game types and durations
    const gameTypes = ['parity', 'sapre', 'bcone', 'emerd'];
    const durations = [60, 180, 300]; // 1min, 3min, 5min in seconds

    const results = [];

    for (const gameType of gameTypes) {
      for (const duration of durations) {
        console.log(`🎯 Processing ${gameType} ${duration}s`);
        
        try {
          // Get current period using consistent calculation
          const currentPeriod = await getCurrentPeriodConsistent(duration);
          const timeLeft = await getTimeLeftInPeriod(duration);

          console.log(`📅 Current period for ${gameType} ${duration}s: ${currentPeriod}, time left: ${timeLeft}s`);

          // Only generate result if time is up (less than 5 seconds left)
          if (timeLeft > 5) {
            console.log(`⏰ Still ${timeLeft}s left for ${gameType} ${duration}s, skipping`);
            continue;
          }

          // Check if result already exists for this period
          const { data: existingResult, error: checkError } = await supabaseClient
            .from('game_results')
            .select('id')
            .eq('game_type', gameType)
            .eq('period', currentPeriod)
            .eq('duration', duration)
            .limit(1);

          if (checkError) {
            console.error(`❌ Error checking existing result:`, checkError);
            continue;
          }

          if (existingResult && existingResult.length > 0) {
            console.log(`✅ Result already exists for ${gameType} ${currentPeriod}`);
            continue;
          }

          // Generate new result
          const winningNumber = Math.floor(Math.random() * 10);
          let winningColors: string[] = [];

          // Determine colors based on number
          switch (winningNumber) {
            case 0:
              winningColors = ['red', 'violet'];
              break;
            case 5:
              winningColors = ['green', 'violet'];
              break;
            case 1:
            case 3:
            case 7:
            case 9:
              winningColors = ['green'];
              break;
            case 2:
            case 4:
            case 6:
            case 8:
              winningColors = ['red'];
              break;
          }

          // Insert the result
          const { data: insertData, error: insertError } = await supabaseClient
            .from('game_results')
            .insert({
              period: currentPeriod,
              number: winningNumber,
              result_color: winningColors,
              game_type: gameType,
              duration: duration
            })
            .select()
            .single();

          if (insertError) {
            console.error(`❌ Error inserting result for ${gameType} ${currentPeriod}:`, insertError);
            continue;
          }

          console.log(`🎲 Generated result for ${gameType} ${currentPeriod}: number=${winningNumber}, colors=${JSON.stringify(winningColors)}`);

          // Now settle bets for this result
          await settleBetsForResult(supabaseClient, gameType, currentPeriod, winningNumber, winningColors);

          results.push({
            gameType,
            duration,
            period: currentPeriod,
            number: winningNumber,
            colors: winningColors
          });

        } catch (funcError) {
          console.error(`💥 Function error for ${gameType} ${duration}s:`, funcError);
        }
      }
    }

    console.log(`🏁 Automated game engine complete: ${results.length} results generated`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Automated game engine complete: ${results.length} results generated`,
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
    console.error('💥 Critical error in automated game engine:', error);
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

// Consistent period calculation function
async function getCurrentPeriodConsistent(durationSeconds: number): Promise<string> {
  // Get current time in IST (UTC + 5.5 hours)
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  
  // Get start of day in IST
  const startOfDay = new Date(istTime);
  startOfDay.setHours(0, 0, 0, 0);
  
  // Calculate seconds since start of day
  const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
  
  // Calculate current period number (1-based)
  const periodNumber = Math.floor(secondsSinceStart / durationSeconds) + 1;
  
  // Format date as YYYYMMDD
  const yearMonthDay = istTime.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Create period string with 3-digit padding
  const period = yearMonthDay + periodNumber.toString().padStart(3, '0');
  
  return period;
}

// Get time left in current period
async function getTimeLeftInPeriod(durationSeconds: number): Promise<number> {
  // Get current time in IST (UTC + 5.5 hours)
  const now = new Date();
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  
  // Get start of day in IST
  const startOfDay = new Date(istTime);
  startOfDay.setHours(0, 0, 0, 0);
  
  // Calculate seconds since start of day
  const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
  
  // Calculate time left in current period
  const secondsInCurrentPeriod = secondsSinceStart % durationSeconds;
  const timeLeftInPeriod = durationSeconds - secondsInCurrentPeriod;
  
  return timeLeftInPeriod;
}

async function settleBetsForResult(
  supabaseClient: any, 
  gameType: string, 
  period: string, 
  winningNumber: number, 
  winningColors: string[]
) {
  console.log(`🎯 Settling bets for ${gameType} ${period}`);

  try {
    // Get all unsettled bets for this game type and period
    const { data: bets, error: betsError } = await supabaseClient
      .from('user_bets')
      .select('*')
      .eq('game_type', gameType)
      .eq('period', period)
      .eq('settled', false);

    if (betsError) {
      console.error(`❌ Error fetching bets for settlement:`, betsError);
      return;
    }

    if (!bets || bets.length === 0) {
      console.log(`📊 No unsettled bets found for ${gameType} ${period}`);
      return;
    }

    console.log(`🎮 Found ${bets.length} bets to settle for ${gameType} ${period}`);

    let settledCount = 0;
    let totalPayout = 0;

    // Process each bet
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
          totalPayout += payout;
        }
      }

      console.log(`✅ Bet ${bet.id} settled: win=${isWin}, payout=${payout}`);
      settledCount++;
    }

    console.log(`🏁 Settlement complete for ${gameType} ${period}: ${settledCount} bets settled, total payout: ${totalPayout}`);

  } catch (error) {
    console.error(`💥 Error in bet settlement for ${gameType} ${period}:`, error);
  }
}
