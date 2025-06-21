import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { generatePeriod, getPeriodEndTime, GameType } from "@/lib/periodUtils";

interface UserBet {
  period: string;
  betType: "color" | "number";
  betValue: string | number;
  amount: number;
  timestamp: Date;
  result?: "win" | "lose";
  payout?: number;
}

export function useGameEngine(gameType: GameType) {
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // ⏳ Period and countdown logic
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const period = generatePeriod(gameType, now);
      const end = getPeriodEndTime(gameType, now);
      const left = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));

      setCurrentPeriod(period);
      setTimeLeft(left);
    };

    update();

    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          update();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [gameType]);

  // 🎰 Place bet using secure RPC
  const placeBet = async (
    betType: "color" | "number",
    betValue: string | number,
    amount: number
  ) => {
    if (!currentPeriod) {
      console.error("⛔ Current period not available yet");
      return false;
    }

    const { error } = await supabase.rpc("place_bet_secure", {
      p_game_type: gameType,
      p_period: currentPeriod,
      p_bet_type: betType,
      p_bet_value: String(betValue),
      p_amount: amount,
    });

    if (error) {
      console.error("❌ Failed to place bet:", error.message);
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
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
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
