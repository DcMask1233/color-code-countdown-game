
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  new_balance?: number;
}

export const useBackendGameEngine = (gameType: string, gameMode: string) => {
  // Normalize game mode to lowercase for consistency
  const normalizedGameMode = gameMode.toLowerCase();
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();

  const fetchUserBets = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_bets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to fetch user bets:', error);
        return;
      }

      if (data) {
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
  }, [user]);

  const placeBet = useCallback(async (
    betType: 'color' | 'number',
    betValue: string | number,
    amount: number,
    periodId: number
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to place bets",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('place_bet_secure', {
        p_period_id: periodId,
        p_bet_type: betType,
        p_bet_value: betValue.toString(),
        p_amount: amount
      }) as { data: BetResponse[] | null, error: any };

      if (error) {
        console.error('Failed to place bet:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to place bet. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      // Handle the response properly
      if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          toast({
            title: "Success",
            description: "Bet placed successfully!",
          });
          
          // Refresh user profile and bets
          await Promise.all([
            refreshProfile(),
            fetchUserBets()
          ]);
          
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
    } catch (error: any) {
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
  }, [user, toast, refreshProfile, fetchUserBets]);

  useEffect(() => {
    if (user && gameType && normalizedGameMode) {
      fetchUserBets();
      
      // Create unique channel name to prevent subscription conflicts
      const channelName = `user_bets_${gameType}_${normalizedGameMode}_${user.id}`;
      
      // Set up real-time subscription for bet updates
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_bets',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔄 Bet update received:', payload);
            fetchUserBets();
            refreshProfile();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, gameType, normalizedGameMode, fetchUserBets, refreshProfile]);

  return {
    userBets,
    placeBet,
    isLoading,
    refreshBets: fetchUserBets
  };
};
