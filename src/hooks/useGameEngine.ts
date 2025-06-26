import { useEffect, useState } from "react";
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
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  // Duration map from gameMode
  const durationMap: Record<GameMode, number> = {
    Wingo1min: 60,
    Wingo3min: 180,
    Wingo5min: 300,
  };

  const fetchPeriodInfo = async () => {
    const { data, error } = await supabase.rpc("generate_period_info", {
      p_game_type: gameType,
      p_duration: durationMap[gameMode],
    });

    if (error || !data) {
      console.error("❌ Failed to fetch period info:", error);
      return;
    }

    setCurrentPeriod(data.current_period);
    setTimeLeft(data.time_left_seconds);
  };

  useEffect(() => {
    fetchPeriodInfo();

    const interval = setInterval(() => {
      fetchPeriodInfo();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [gameType, gameMode]);

  const placeBet = async (
    betType: "color" | "number",
    betValue: string | number,
    amount: number
  ) => {
    if (!currentPeriod) return false;

    const { error } = await supabase.from("user_bets").insert({
      period: currentPeriod,
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
        period: currentPeriod,
        betType,
        betValue,
        amount,
        timestamp: new Date(),
      },
    ]);

    return true;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return {
    currentPeriod,
    timeLeft,
    userBets,
    placeBet,
    isBettingClosed: timeLeft <= 5,
    formatTime,
  };
}
