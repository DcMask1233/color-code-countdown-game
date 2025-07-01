
import { useState, useEffect } from 'react';
import { UserBet } from '@/types/UserBet';
import { useAuth } from '@/hooks/useAuth';

export const useUserBets = () => {
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // Mock implementation for now
    if (user) {
      setUserBets([]);
    }
  }, [user]);

  return {
    userBets,
    refreshBets: () => {},
    isLoading: false
  };
};
