
import { useState, useEffect } from 'react';
import { UserBet } from '@/types/UserBet';
import { supabase } from '@/integrations/supabase/client';

const USER_BETS_STORAGE_KEY = 'userBets';

export const useUserBets = () => {
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  // Load bets from localStorage on mount
  useEffect(() => {
    const savedBets = localStorage.getItem(USER_BETS_STORAGE_KEY);
    if (savedBets) {
      try {
        const parsedBets = JSON.parse(savedBets);
        // Convert timestamp strings back to Date objects
        const betsWithDates = parsedBets.map((bet: any) => ({
          ...bet,
          timestamp: new Date(bet.timestamp)
        }));
        setUserBets(betsWithDates);
        console.log('📦 Loaded bets from localStorage:', betsWithDates);
      } catch (error) {
        console.error('Failed to parse saved bets:', error);
        setUserBets([]);
      }
    }

    // Subscribe to real-time bet settlement updates
    const channel = supabase
      .channel('user_bet_settlements')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_bets'
        },
        (payload) => {
          console.log('🔄 Bet settlement update received:', payload.new);
          updateBetFromDatabase(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save bets to localStorage whenever userBets changes
  useEffect(() => {
    localStorage.setItem(USER_BETS_STORAGE_KEY, JSON.stringify(userBets));
    console.log('💾 Saved bets to localStorage:', userBets);
  }, [userBets]);

  const updateBetFromDatabase = (dbBet: any) => {
    console.log('📊 Updating bet from database:', dbBet);
    setUserBets(prev => prev.map(bet => {
      // Enhanced matching: try multiple approaches
      const periodMatch = bet.period === dbBet.period;
      const gameTypeMatch = bet.gameType?.toLowerCase() === dbBet.game_type?.toLowerCase();
      const betTypeMatch = bet.betType === dbBet.bet_type;
      const betValueMatch = bet.betValue?.toString() === dbBet.bet_value?.toString();
      
      if (periodMatch && gameTypeMatch && betTypeMatch && betValueMatch) {
        console.log('✅ Found exact matching bet:', {
          period: bet.period,
          gameType: bet.gameType,
          betType: bet.betType,
          betValue: bet.betValue,
          oldResult: bet.result,
          newResult: dbBet.win ? 'win' : 'lose',
          payout: dbBet.payout || 0
        });
        return {
          ...bet,
          result: dbBet.win ? 'win' : 'lose',
          payout: dbBet.payout || 0
        };
      }
      return bet;
    }));
  };

  const addBet = (newBet: UserBet) => {
    console.log('➕ Adding new bet:', newBet);
    
    // Ensure gameType is properly set and normalized
    const normalizedBet = {
      ...newBet,
      gameType: newBet.gameType?.toLowerCase() || 'unknown',
      timestamp: new Date()
    };
    
    console.log('📝 Normalized bet before adding:', normalizedBet);
    setUserBets(prev => [normalizedBet, ...prev]);
  };

  const updateBetResult = (period: string, gameType: string, result: 'win' | 'lose', payout?: number) => {
    console.log('🎯 Manually updating bet result:', { period, gameType, result, payout });
    setUserBets(prev => prev.map(bet => {
      const periodMatch = bet.period === period;
      const gameTypeMatch = bet.gameType?.toLowerCase() === gameType.toLowerCase();
      
      if (periodMatch && gameTypeMatch) {
        console.log('✅ Updated bet result:', { bet, result, payout });
        return { ...bet, result, payout };
      }
      return bet;
    }));
  };

  const getBetsByGameType = (gameType: string) => {
    const filtered = userBets.filter(bet => 
      bet.gameType?.toLowerCase() === gameType.toLowerCase()
    );
    console.log(`🎮 Getting bets for gameType "${gameType}":`, filtered);
    return filtered;
  };

  // Function to sync bets with database for settlement status
  const syncBetsWithDatabase = async () => {
    console.log('🔄 Syncing bets with database...');
    try {
      const { data: dbBets, error } = await supabase
        .from('user_bets')
        .select('*')
        .eq('settled', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error syncing bets:', error);
        return;
      }

      if (dbBets && dbBets.length > 0) {
        console.log(`📊 Found ${dbBets.length} settled bets from database`);
        dbBets.forEach(updateBetFromDatabase);
      } else {
        console.log('🔍 No settled bets found in database');
      }
    } catch (error) {
      console.error('💥 Error syncing bets with database:', error);
    }
  };

  // Function to manually settle unsettled bets
  const settlePendingBets = async () => {
    console.log('🔧 Attempting to settle pending bets...');
    try {
      const { data, error } = await supabase.functions.invoke('settle-existing-bets');
      
      if (error) {
        console.error('❌ Error calling settle function:', error);
        return;
      }

      console.log('✅ Settlement function response:', data);
      
      // Refresh bets after settlement
      await syncBetsWithDatabase();
    } catch (error) {
      console.error('💥 Error settling pending bets:', error);
    }
  };

  return {
    userBets,
    addBet,
    updateBetResult,
    getBetsByGameType,
    syncBetsWithDatabase,
    settlePendingBets
  };
};
