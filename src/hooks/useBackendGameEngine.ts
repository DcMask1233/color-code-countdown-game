
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserBet {
  id: string;
  period: string;
  betType: "color" | "number";
  betValue: string | number;
  amount: number;
  timestamp: Date;
  result?: "win" | "lose";
  payout?: number;
  settled: boolean;
  gameType: string;
  gameMode: string;
}

export const useBackendGameEngine = (gameType: string, gameMode: string) => {
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get current user from localStorage
  const getCurrentUserId = (): string | null => {
    const savedUser = localStorage.getItem('colorGameUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      return userData.userId;
    }
    return null;
  };

  // Fetch user bets from backend only
  const fetchUserBets = async () => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      console.log('📊 Fetching user bets for:', { gameType, gameMode, userId });
      
      const { data, error } = await supabase
        .from('user_bets')
        .select('*')
        .eq('user_id', userId)
        .eq('game_type', gameType.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user bets:', error);
        return;
      }

      console.log('📈 Fetched bets:', data?.length || 0);

      if (data) {
        const mappedBets: UserBet[] = data.map((bet: any) => ({
          id: bet.id,
          period: bet.period, // Use exactly what backend provides
          betType: bet.bet_type as "color" | "number",
          betValue: bet.bet_value,
          amount: bet.amount,
          timestamp: new Date(bet.created_at),
          result: bet.settled ? (bet.win ? "win" : "lose") : undefined,
          payout: bet.payout || 0,
          settled: bet.settled,
          gameType: bet.game_type,
          gameMode: bet.game_mode
        }));
        
        setUserBets(mappedBets);
      }
    } catch (error) {
      console.error('💥 Error in fetchUserBets:', error);
    }
  };

  // Place bet function
  const placeBet = async (
    betType: "color" | "number",
    betValue: string | number,
    amount: number,
    period: string
  ): Promise<boolean> => {
    const userId = getCurrentUserId();
    if (!userId) {
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🎯 Placing bet:', { betType, betValue, amount, period, gameType, gameMode });

      const { data, error } = await supabase.rpc('place_user_bet', {
        p_user_id: userId,
        p_game_type: gameType.toLowerCase(),
        p_game_mode: gameMode,
        p_period: period,
        p_bet_type: betType,
        p_bet_value: betValue.toString(),
        p_amount: amount
      });

      if (error) {
        console.error('❌ Error placing bet:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Bet placed successfully');
      toast({
        title: "Success",
        description: `Bet placed: ${betType} ${betValue} - ₹${amount}`,
      });

      // Refresh bets
      fetchUserBets();
      return true;

    } catch (error) {
      console.error('💥 Error in placeBet:', error);
      toast({
        title: "Error",
        description: "Failed to place bet",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates for user bets
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) return;

    fetchUserBets();

    const channelName = `backend_user_bets_${gameType}_${gameMode}_${userId}`;
    console.log('🔔 Setting up realtime subscription:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_bets',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 Real-time update received:', payload);
          fetchUserBets();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, [gameType, gameMode]);

  return {
    userBets,
    placeBet,
    isLoading
  };
};
