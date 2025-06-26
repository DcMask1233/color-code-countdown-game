
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
          console.log('Bet settlement update:', payload.new);
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
    setUserBets(prev => prev.map(bet => {
      // Match by period and game type since we don't have database IDs in localStorage bets
      if (bet.period === dbBet.period && bet.gameType === dbBet.game_type) {
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
    setUserBets(prev => [newBet, ...prev]);
  };

  const updateBetResult = (period: string, gameType: string, result: 'win' | 'lose', payout?: number) => {
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
    try {
      const { data: dbBets, error } = await supabase
        .from('user_bets')
        .select('*')
        .eq('settled', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error syncing bets:', error);
        return;
      }

      if (dbBets) {
        dbBets.forEach(updateBetFromDatabase);
      }
    } catch (error) {
      console.error('Error syncing bets with database:', error);
    }
  };

  return {
    userBets,
    addBet,
    updateBetResult,
    getBetsByGameType,
    syncBetsWithDatabase
  };
};
