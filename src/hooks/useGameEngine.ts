
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface BetResult {
  success: boolean;
  message: string;
}

export function useGameEngine(gameType: string, gameMode: string, userId: string) {
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const placeBet = async (
    betType: "color" | "number",
    betValue: string | number,
    amount: number,
    period: string
  ) => {
    if (!period || !userId) {
      toast({
        title: "Error",
        description: "Missing period or user ID",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      // Use the RPC function with proper typing
      const { data, error } = await (supabase.rpc as any)('place_user_bet', {
        p_user_id: userId,
        p_game_type: gameType.toLowerCase(),
        p_game_mode: gameMode,
        p_period: period,
        p_bet_type: betType,
        p_bet_value: betValue.toString(),
        p_amount: amount
      }) as { data: BetResult[] | null, error: any };

      if (error) {
        console.error("❌ Failed to place bet:", error);
        toast({
          title: "Error",
          description: "Failed to place bet. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      if (data && data.length > 0 && data[0].success) {
        toast({
          title: "Success",
          description: "Bet placed successfully!",
        });
        
        // Refresh bets
        await fetchUserBets();
        return true;
      } else {
        const message = data?.[0]?.message || "Failed to place bet";
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("❌ Error placing bet:", error);
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
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("user_bets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("❌ Failed to fetch user bets:", error);
        return;
      }

      if (data) {
        const mappedBets: UserBet[] = data.map((bet: any) => ({
          id: bet.id,
          period: bet.period_id?.toString() || '',
          betType: bet.bet_type as "color" | "number",
          betValue: bet.bet_value,
          amount: bet.amount,
          timestamp: new Date(bet.created_at),
          result: bet.result === 'win' ? "win" : bet.result === 'lose' ? "lose" : undefined,
          payout: bet.payout || 0,
          settled: bet.result !== null,
          gameType: gameType,
          gameMode: gameMode
        }));
        
        setUserBets(mappedBets);
      }
    } catch (error) {
      console.error("❌ Error fetching user bets:", error);
    }
  };

  useEffect(() => {
    if (userId && gameType && gameMode) {
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
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('🔄 Bet update received:', payload);
            fetchUserBets();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, gameType, gameMode]);

  return {
    userBets,
    placeBet,
    isLoading,
    refreshBets: fetchUserBets
  };
}
