
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

interface PlaceBetResult {
  success: boolean;
  message: string;
  newBalance?: number;
}

export function useOptimizedGameEngine(gameType: string, gameMode: string) {
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const { user, refreshUserProfile } = useAuth();

  const placeBet = useCallback(async (
    betType: "color" | "number",
    betValue: string | number,
    amount: number,
    period: string
  ): Promise<PlaceBetResult> => {
    if (!user || !period) {
      toast({
        title: "Error",
        description: "Please login to place bets",
        variant: "destructive"
      });
      return { success: false, message: "Authentication required" };
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('place_bet_with_wallet', {
        p_game_type: gameType.toLowerCase(),
        p_game_mode: gameMode,
        p_period: period,
        p_bet_type: betType,
        p_bet_value: betValue.toString(),
        p_amount: amount
      });

      if (error) {
        console.error("Failed to place bet:", error);
        toast({
          title: "Error", 
          description: "Failed to place bet. Please try again.",
          variant: "destructive"
        });
        return { success: false, message: error.message };
      }

      if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          toast({
            title: "Success",
            description: "Bet placed successfully!",
          });
          
          // Refresh user profile and bets
          await Promise.all([
            refreshUserProfile(),
            fetchUserBets()
          ]);
          
          setRetryCount(0); // Reset retry count on success
          return { 
            success: true, 
            message: "Bet placed successfully",
            newBalance: result.new_balance 
          };
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to place bet",
            variant: "destructive"
          });
          return { success: false, message: result.message || "Failed to place bet" };
        }
      }

      return { success: false, message: "No response from server" };
    } catch (error: any) {
      console.error("Error placing bet:", error);
      
      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
        
        toast({
          title: "Retrying...",
          description: `Attempt ${retryCount + 1} failed, retrying in ${delay/1000}s`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to place bet after multiple attempts",
          variant: "destructive"
        });
      }
      
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user, gameType, gameMode, retryCount, toast, refreshUserProfile]);

  const fetchUserBets = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_bets")
        .select("*")
        .eq("user_id", user.id)
        .eq("game_type", gameType.toLowerCase())
        .eq("game_mode", gameMode)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Failed to fetch user bets:", error);
        return;
      }

      if (data) {
        const mappedBets: UserBet[] = data.map((bet: any) => ({
          id: bet.id,
          period: bet.period,
          betType: bet.bet_type,
          betValue: bet.bet_value,
          amount: bet.amount,
          timestamp: new Date(bet.created_at),
          result: bet.win === true ? "win" : bet.win === false ? "lose" : undefined,
          payout: bet.payout || 0,
          settled: bet.settled,
          gameType: bet.game_type,
          gameMode: bet.game_mode
        }));
        
        setUserBets(mappedBets);
      }
    } catch (error) {
      console.error("Error fetching user bets:", error);
    }
  }, [user, gameType, gameMode]);

  useEffect(() => {
    if (user && gameType && gameMode) {
      fetchUserBets();
      
      // Set up real-time subscription for bet updates
      const channel = supabase
        .channel('user_bets_changes')
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
            refreshUserProfile(); // Refresh balance on bet updates
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, gameType, gameMode, fetchUserBets, refreshUserProfile]);

  return {
    userBets,
    placeBet,
    isLoading,
    refreshBets: fetchUserBets,
    retryCount
  };
}
