
import { useEffect, useState } from "react";
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

export function useBackendGameEngine(gameType: string, gameMode: string) {
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, refreshUserProfile } = useAuth();

  const placeBet = async (
    betType: "color" | "number",
    betValue: string | number,
    amount: number,
    period: string
  ) => {
    if (!user || !period) {
      toast({
        title: "Error",
        description: "Please login to place bets",
        variant: "destructive"
      });
      return false;
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
        return false;
      }

      if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          toast({
            title: "Success",
            description: "Bet placed successfully!",
          });
          
          // Refresh user profile to update balance
          await refreshUserProfile();
          
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
      console.error("Error placing bet:", error);
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
  };

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
            console.log('Bet update received:', payload);
            fetchUserBets();
            refreshUserProfile(); // Refresh balance on bet updates
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, gameType, gameMode]);

  return {
    userBets,
    placeBet,
    isLoading,
    refreshBets: fetchUserBets
  };
}
