// hooks/useGameEngine.ts
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { generatePeriod, getPeriodEndTime, GameType } from "@/lib/periodUtils";

export function useGameEngine(gameType: GameType, duration: number) {
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [userBets, setUserBets] = useState<any[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // ⏳ Period and countdown logic
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const period = generatePeriod(duration, now);
      const end = getPeriodEndTime(duration, now);
      const left = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      setCurrentPeriod(period);
      setTimeLeft(left);
    };

    update();

    if (countdownRef.current) clearInterval(countdownRef.current);

    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
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
  }, [gameType, duration]);

  // 🎰 Bet placement logic
  const placeBet = async (
    betType: 'color' | 'number',
    betValue: string | number,
    amount: number
  ) => {
    const { error } = await supabase.from("user_bets").insert({
      period: currentPeriod,
      game_type: gameType,
      bet_type: betType,
      bet_value: betValue,
      amount,
    });

    if (error) {
      console.error("❌ Failed to place bet:", error);
      return false;
    }

    setUserBets(prev => [
      ...prev,
      {
        period: currentPeriod,
        betType,
        betValue,
        amount,
        timestamp: new Date(),
      }
    ]);

    return true;
  };

  // Format time (optional, can be moved to utils)
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
