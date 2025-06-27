
import { useState, useEffect, useCallback } from 'react';
import { UserBet } from '@/types/UserBet';
import { supabase } from '@/integrations/supabase/client';

const USER_BETS_STORAGE_KEY = 'userBets';

export const useUserBets = () => {
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  // Load bets from localStorage on mount (for backward compatibility)
  useEffect(() => {
    const savedBets = localStorage.getItem(USER_BETS_STORAGE_KEY);
    if (savedBets) {
      try {
        const parsedBets = JSON.parse(savedBets);
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
  }, []);

  // Save bets to localStorage whenever userBets changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (userBets.length > 0) {
        localStorage.setItem(USER_BETS_STORAGE_KEY, JSON.stringify(userBets));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userBets]);

  const addBet = useCallback((newBet: UserBet) => {
    const normalizedBet = {
      ...newBet,
      gameType: newBet.gameType?.toLowerCase() || 'unknown',
      timestamp: new Date()
    };
    
    setUserBets(prev => [normalizedBet, ...prev]);
  }, []);

  const updateBetResult = useCallback((period: string, gameType: string, result: 'win' | 'lose', payout?: number) => {
    setUserBets(prev => prev.map(bet => {
      const periodMatch = bet.period === period;
      const gameTypeMatch = bet.gameType?.toLowerCase() === gameType.toLowerCase();
      
      if (periodMatch && gameTypeMatch) {
        return { ...bet, result, payout };
      }
      return bet;
    }));
  }, []);

  const getBetsByGameType = useCallback((gameType: string) => {
    return userBets.filter(bet => 
      bet.gameType?.toLowerCase() === gameType.toLowerCase()
    );
  }, [userBets]);

  const syncBetsWithDatabase = useCallback(async () => {
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

      console.log('📊 Synced bets from database:', dbBets?.length || 0);
    } catch (error) {
      console.error('Error syncing bets with database:', error);
    }
  }, []);

  const triggerAutomatedSettlement = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('automated-game-engine');
      
      if (error) {
        console.error('Error calling automated engine:', error);
        return { success: false, error: error.message };
      }

      await syncBetsWithDatabase();
      return { success: true, data };
    } catch (error) {
      console.error('Error triggering automated settlement:', error);
      return { success: false, error: error.message };
    }
  }, [syncBetsWithDatabase]);

  const fixPeriodSync = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fix-period-sync');
      
      if (error) {
        console.error('Error calling period sync fix:', error);
        return { success: false, error: error.message };
      }

      await syncBetsWithDatabase();
      return { success: true, data };
    } catch (error) {
      console.error('Error fixing period sync:', error);
      return { success: false, error: error.message };
    }
  }, [syncBetsWithDatabase]);

  return {
    userBets,
    addBet,
    updateBetResult,
    getBetsByGameType,
    syncBetsWithDatabase,
    triggerAutomatedSettlement,
    fixPeriodSync
  };
};
