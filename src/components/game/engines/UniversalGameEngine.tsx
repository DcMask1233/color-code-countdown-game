
import { useEffect, useState } from "react";
import { useSupabasePeriod } from "@/hooks/useSupabasePeriod";
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
  const { currentPeriod, timeLeft, isLoading, error } = useSupabasePeriod(duration);
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
    if (isLoading || error) return;

    const shouldCloseBetting = timeLeft <= 5;
    if (shouldCloseBetting !== isBettingClosed) {
      setIsBettingClosed(shouldCloseBetting);
      onBettingStateChange(shouldCloseBetting);
    }

    // Complete round when time is up - complete the CURRENT period that was being displayed
    if (timeLeft <= 1 && lastCompletedPeriod !== currentPeriod) {
      const winningNumber = generateWinningNumber();
      
      // Complete the current period that users were betting on
      onRoundComplete(currentPeriod, winningNumber, gameType);
      setLastCompletedPeriod(currentPeriod);
    }
  }, [timeLeft, currentPeriod, isBettingClosed, lastCompletedPeriod, onRoundComplete, onBettingStateChange, gameType, isLoading, error]);

  const placeBet = (
    betType: "color" | "number",
    betValue: string | number,
    amount: number
  ): boolean => {
    if (isBettingClosed || amount > userBalance || isLoading) return false;

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

  // Show loading or error states
  if (isLoading) {
    return {
      timeLeft: 0,
      currentPeriod: "Loading...",
      isBettingClosed: true,
      userBets,
      formatTime,
      placeBet: () => false
    };
  }

  if (error) {
    console.error('Period fetch error:', error);
    // Fallback to prevent app crash
    return {
      timeLeft: 0,
      currentPeriod: "Error",
      isBettingClosed: true,
      userBets,
      formatTime,
      placeBet: () => false
    };
  }

  return {
    timeLeft,
    currentPeriod,
    isBettingClosed,
    userBets,
    formatTime,
    placeBet
  };
}
