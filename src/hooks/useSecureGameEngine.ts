
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserBet {
  id: string;
  period_id: number;
  bet_type: 'color' | 'number';
  bet_value: string;
  amount: number;
  result: 'win' | 'lose' | null;
  payout: number;
  created_at: string;
}

interface BetResponse {
  success: boolean;
  message: string;
  new_balance: number;
}

export const useSecureGameEngine = (gameType: string, gameMode: string) => {
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const placeBet = async (
    periodId: number,
    betType: 'color' | 'number',
    betValue: string | number,
    amount: number
  ) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('place_bet_secure', {
        p_period_id: periodId,
        p_bet_type: betType,
        p_bet_value: betValue.toString(),
        p_amount: amount
      });

      if (error) {
        console.error('Failed to place bet:', error);
        toast({
          title: "Error",
          description: "Failed to place bet. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      // Handle the response array from the RPC function
      if (data && Array.isArray(data) && data.length > 0) {
        const result = data[0] as BetResponse;
        if (result.success) {
          toast({
            title: "Success",
            description: "Bet placed successfully!",
          });
          
          // Refresh bets
          await fetchUserBets();
          return true;
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to place bet",
            variant: "destructive"
          });
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBets = async () => {
    try {
      const { data, error } = await supabase
        .from('user_bets')
        .select(`
          *,
          game_periods!inner(game_type, game_mode)
        `)
        .eq('game_periods.game_type', gameType.toLowerCase())
        .eq('game_periods.game_mode', gameMode.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to fetch user bets:', error);
        return;
      }

      if (data) {
        // Transform the data to match UserBet interface
        const transformedBets: UserBet[] = data.map((bet: any) => ({
          id: bet.id,
          period_id: bet.period_id,
          bet_type: bet.bet_type as 'color' | 'number',
          bet_value: bet.bet_value,
          amount: bet.amount,
          result: bet.result as 'win' | 'lose' | null,
          payout: bet.payout || 0,
          created_at: bet.created_at
        }));
        
        setUserBets(transformedBets);
      }
    } catch (error) {
      console.error('Error fetching user bets:', error);
    }
  };

  useEffect(() => {
    fetchUserBets();
    
    // Set up real-time subscription for bet updates
    const channel = supabase
      .channel('user_bets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_bets'
        },
        (payload) => {
          console.log('Bet update received:', payload);
          fetchUserBets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType, gameMode]);

  return {
    userBets,
    placeBet,
    isLoading,
    refreshBets: fetchUserBets
  };
};
