
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
          // Update local storage with settlement results
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
  }, [userBets]);

  const updateBetFromDatabase = (dbBet: any) => {
    console.log('📊 Updating bet from database:', dbBet);
    setUserBets(prev => prev.map(bet => {
      // Match by period and game type since we don't have database IDs in localStorage bets
      if (bet.period === dbBet.period && bet.gameType === dbBet.game_type) {
        console.log('✅ Found matching bet, updating result:', {
          period: bet.period,
          gameType: bet.gameType,
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
    setUserBets(prev => [newBet, ...prev]);
  };

  const updateBetResult = (period: string, gameType: string, result: 'win' | 'lose', payout?: number) => {
    console.log('🎯 Manually updating bet result:', { period, gameType, result, payout });
    setUserBets(prev => prev.map(bet => 
      bet.period === period && bet.gameType === gameType 
        ? { ...bet, result, payout }
        : bet
    ));
  };

  const getBetsByGameType = (gameType: string) => {
    return userBets.filter(bet => bet.gameType === gameType);
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
