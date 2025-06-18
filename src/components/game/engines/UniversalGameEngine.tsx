import { useEffect, useState } from "react";
import { getCurrentPeriod } from "@/lib/periodUtils";
import { UserBet } from "@/types/UserBet";

export interface UniversalGameEngineProps {
  gameType: string;
  duration: number;
  gameMode: string; // ✅ ADD THIS
  onRoundComplete: (period: string, number: number, gameType: string) => void;
  onBettingStateChange: (state: boolean) => void;
  onBalanceUpdate: (amount: number) => void;
  userBalance: number;
}

export function UniversalGameEngine({
  gameType,
  duration,
  gameMode, // ✅ Accept here
  onRoundComplete,
  onBettingStateChange,
  onBalanceUpdate,
  userBalance
}: UniversalGameEngineProps) {
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const seconds = now.getMinutes() * 60 + now.getSeconds();
      const totalSeconds = duration;
      const countdown = totalSeconds - (seconds % totalSeconds);

      setTimeLeft(countdown);
      setIsBettingClosed(countdown <= 5);
      setCurrentPeriod(getCurrentPeriod(gameType, duration / 60)); // duration is in seconds
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [gameType, duration]);

  const placeBet = (
    betType: "color" | "number",
    betValue: string | number,
    amount: number
  ): boolean => {
    if (isBettingClosed || amount > userBalance) return false;

    const newBet: UserBet = {
      betType,
      betValue,
      amount,
      period: currentPeriod,
      timestamp: new Date(),
    };

    setUserBets((prev) => [...prev, newBet]);
    onBalanceUpdate(userBalance - amount);
    return true;
  };

  return {
    timeLeft,
    currentPeriod,
    isBettingClosed,
    userBets,
    formatTime,
    placeBet
  };
}
