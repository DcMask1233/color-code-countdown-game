
import { useEffect, useState } from "react";
import { getCurrentPeriod } from "@/lib/periodUtils";
import { UserBet } from "@/types/UserBet";

export interface UniversalGameEngineProps {
  gameType: string;
  duration: number;
  gameMode: string;
  onRoundComplete: (period: string, number: number, gameType: string) => void;
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
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const generateWinningNumber = () => Math.floor(Math.random() * 10);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

      const startOfDay = new Date(istTime);
      startOfDay.setHours(0, 0, 0, 0);
      const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
      const secondsInCurrentRound = secondsSinceStart % duration;
      const remaining = duration - secondsInCurrentRound;

      const newPeriod = getCurrentPeriod(gameType, duration);
      setTimeLeft(remaining);
      setCurrentPeriod(newPeriod);

      const shouldCloseBetting = remaining <= 5;
      if (shouldCloseBetting !== isBettingClosed) {
        setIsBettingClosed(shouldCloseBetting);
        onBettingStateChange(shouldCloseBetting);
      }

      // When a new round starts (remaining equals duration), complete the previous round
      if (remaining === duration) {
        const winningNumber = generateWinningNumber();
        onRoundComplete(newPeriod, winningNumber, gameType);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [gameType, duration, onRoundComplete, onBettingStateChange, isBettingClosed]);

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
