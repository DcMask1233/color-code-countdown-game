import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserBet {
  period: string;
  betType: "color" | "number";
  betValue: string | number;
  amount: number;
  timestamp: Date;
  result?: "win" | "lose";
  payout?: number;
}

export function useGameEngine(gameType: string, gameMode: string, userId: string) {
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  const placeBet = async (
    betType: "color" | "number",
    betValue: string | number,
    amount: number,
    period: string
  ) => {
    if (!period || !userId) return false;

    const { error } = await supabase.from("bets").insert({
      user_id: userId,
      period,
      game_type: gameType,
      game_mode: gameMode,
      bet_type: betType,
      bet_value: betValue,
      amount,
    });

    if (error) {
      console.error("❌ Failed to place bet:", error);
      return false;
    }

    // Refresh bets
    fetchUserBets();

    return true;
  };

  const fetchUserBets = async () => {
    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", userId)
      .eq("game_type", gameType)
      .eq("game_mode", gameMode)
      .order("created_at", { ascending: false });

    if (data) {
      setUserBets(
        data.map((b: any) => ({
          period: b.period,
          betType: b.bet_type,
          betValue: b.bet_value,
          amount: b.amount,
          timestamp: new Date(b.created_at),
          result: b.result,
          payout: b.payout,
        }))
      );
    }
  };

  useEffect(() => {
    if (userId && gameType && gameMode) {
      fetchUserBets();
    }
  }, [userId, gameType, gameMode]);

  return {
    userBets,
    placeBet,
  };
}
