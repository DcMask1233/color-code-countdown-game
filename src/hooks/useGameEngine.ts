import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { GameMode, GameType } from "@/lib/periodUtils";

interface UserBet {
  period: string;
  betType: "color" | "number";
  betValue: string | number;
  amount: number;
  timestamp: Date;
  result?: "win" | "lose";
  payout?: number;
}

export function useGameEngine(gameType: GameType, gameMode: GameMode) {
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  const placeBet = async (
    betType: "color" | "number",
    betValue: string | number,
    amount: number,
    period: string
  ) => {
    if (!period) return false;

    const { error } = await supabase.from("user_bets").insert({
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

    setUserBets((prev) => [
      ...prev,
      {
        period,
        betType,
        betValue,
        amount,
        timestamp: new Date(),
      },
    ]);

    return true;
  };

  return {
    userBets,
    placeBet,
  };
}
