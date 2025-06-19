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
  const [lastCompletedPeriod, setLastCompletedPeriod] = useState("");

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

      // When time is up (remaining is 0 or very close to duration), complete the previous round
      // This ensures we complete the round that just ended, not the new one starting
      if (remaining >= duration - 1 && lastCompletedPeriod !== newPeriod) {
        const winningNumber = generateWinningNumber();
        // Complete the previous period, not the current one
        const prevPeriodNum = Math.floor(secondsSinceStart / duration);
        const yyyy = istTime.getFullYear();
        const mm = String(istTime.getMonth() + 1).padStart(2, "0");
        const dd = String(istTime.getDate()).padStart(2, "0");
        const prevPeriod = `${yyyy}${mm}${dd}${String(prevPeriodNum).padStart(3, "0")}`;
        
        if (prevPeriodNum > 0) { // Only complete if not the first period of the day
          onRoundComplete(prevPeriod, winningNumber, gameType);
          setLastCompletedPeriod(prevPeriod);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [gameType, duration, onRoundComplete, onBettingStateChange, isBettingClosed, lastCompletedPeriod]);

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
