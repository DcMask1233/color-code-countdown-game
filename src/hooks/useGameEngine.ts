import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  generatePeriod,
  getPeriodEndTime,
  GameMode,
} from "@/lib/periodUtils";

interface UserBet {
  period: string;
  betType: "color" | "number";
  betValue: string | number;
  amount: number;
  timestamp: Date;
  result?: "win" | "lose";
  payout?: number;
}

export function useGameEngine(gameMode: GameMode) {
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Handle timer and period updates
  useEffect(() => {
    const updatePeriod = () => {
      const now = new Date();
      const period = generatePeriod(gameMode, now);
      const end = getPeriodEndTime(gameMode, now);

      setCurrentPeriod(period);
      setTimeLeft(Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000)));
    };

    updatePeriod();

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          updatePeriod();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [gameMode]);

  const placeBet = async (
    betType: "color" | "number",
    betValue: string | number,
    amount: number
  ) => {
    if (!currentPeriod) return false;

    const { error } = await supabase.from("user_bets").insert({
      period: currentPeriod,
      game_type: gameMode,
      bet_type: betType,
      bet_value: betValue,
      amount,
    });

    if (error) {
      console.error("Failed to place bet:", error);
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
