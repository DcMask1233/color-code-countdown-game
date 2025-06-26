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

  const fetchUserBets = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", userId)
      .eq("game_type", gameType)
      .eq("game_mode", gameMode)
      .order("created_at", { ascending: false })
      .limit(10); // last 10 bets

    if (error) {
      console.error("❌ Failed to fetch bets:", error);
    } else {
      const formatted = data.map((bet) => ({
        period: bet.period,
        betType: bet.bet_type,
        betValue: bet.bet_value,
        amount: bet.amount,
        timestamp: new Date(bet.created_at),
        result: bet.result,
        payout: bet.payout,
      }));

      setUserBets(formatted);
    }
  };

  const placeBet = async (
    betType: "color" | "number",
    betValue: string | number,
    amount: number,
    period: string
  ) => {
    if (!userId || !period) return false;

    const { error } = await supabase.from("bets").insert({
      user_id: userId,
      game_type: gameType,
      game_mode: gameMode,
      bet_type: betType,
      bet_value: betValue,
      amount,
      period,
    });

    if (error) {
      console.error("❌ Failed to place bet:", error);
      return false;
    }

    await fetchUserBets(); // refresh bet history after placing
    return true;
  };

  useEffect(() => {
    fetchUserBets();
  }, [userId, gameType, gameMode]);

  return {
    userBets,
    placeBet,
  };
}
