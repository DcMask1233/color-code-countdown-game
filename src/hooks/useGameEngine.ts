import { useEffect, useRef, useState } from "react";
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

interface GameResult {
  period: string;
  created_at: string;
  duration: number;
}

export function useGameEngine(gameType: GameType, gameMode: GameMode) {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Duration map from gameMode
  const durationMap: Record<GameMode, number> = {
    Wingo1min: 60,
    Wingo3min: 180,
    Wingo5min: 300,
  };

  const fetchLatestPeriod = async () => {
    const { data, error } = await supabase
      .from("game_results")
      .select("period, created_at")
      .eq("game_type", gameType)
      .eq("duration", durationMap[gameMode])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error("⚠️ Failed to fetch current period:", error);
      return;
    }

    const startTime = new Date(data.created_at).getTime();
    const endTime = startTime + durationMap[gameMode] * 1000;
    const now = Date.now();

    setCurrentPeriod(data.period);
    setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
  };

  useEffect(() => {
    fetchLatestPeriod(); // Initial load

    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchLatestPeriod(); // Refresh next period
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
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
