import { useEffect, useState } from "react";
import { getCurrentPeriod } from "@/lib/periodUtils";

export interface UniversalGameEngineProps {
  gameType: string;
  duration: number;
  gameMode: string;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBettingStateChange: (state: boolean) => void;
  onBalanceUpdate: (amount: number) => void;
  userBalance: number;
}

export function UniversalGameEngine({
  gameType,
  duration,
  gameMode,
  onRoundComplete,
  onBettingStateChange,
  onBalanceUpdate,
  userBalance
}: UniversalGameEngineProps) {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [userBets, setUserBets] = useState<
    { betType: "number" | "color"; value: string | number; amount: number }[]
  >([]);

  useEffect(() => {
    const updatePeriodAndCountdown = () => {
      const period = getCurrentPeriod(gameType, duration);
      const countdown = calculateCountdown();
      setCurrentPeriod(period);
      setTimeLeft(countdown);
      setIsBettingClosed(countdown <= 3);
      onBettingStateChange(countdown <= 3);
    };

    updatePeriodAndCountdown();
    const interval = setInterval(updatePeriodAndCountdown, 1000);
    return () => clearInterval(interval);
  }, [gameType, duration]);

  const calculateCountdown = () => {
    const now = new Date();
    const seconds = now.getMinutes() * 60 + now.getSeconds();
    const totalSeconds = duration * 60;
    return totalSeconds - (seconds % totalSeconds);
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const placeBet = (
    betType: "number" | "color",
    betValue: string | number,
    amount: number
  ): boolean => {
    if (userBalance < amount || isBettingClosed) return false;

    setUserBets((prev) => [...prev, { betType, value: betValue, amount }]);
    onBalanceUpdate(-amount);
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
