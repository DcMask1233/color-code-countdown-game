
import { useState, useEffect } from 'react';
import { UserBet } from '@/types/UserBet';

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
  }, []);

  // Save bets to localStorage whenever userBets changes
  useEffect(() => {
    localStorage.setItem(USER_BETS_STORAGE_KEY, JSON.stringify(userBets));
  }, [userBets]);

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

  return {
    userBets,
    addBet,
    updateBetResult,
    getBetsByGameType
  };
};
