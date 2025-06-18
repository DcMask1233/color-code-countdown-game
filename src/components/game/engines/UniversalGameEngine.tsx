import { useEffect, useState } from "react";
import { getCurrentPeriod } from "@/lib/periodUtils";
import { UserBet } from "@/types/gameTypes";

interface UniversalGameEngineProps {
  gameType: string;
  duration: number;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBettingStateChange: (state: boolean) => void;
  onBalanceUpdate: (amount: number) => void;
  userBalance: number;
}

export const UniversalGameEngine = ({
  gameType,
  duration,
  onRoundComplete,
  onBettingStateChange,
  onBalanceUpdate,
  userBalance
}: UniversalGameEngineProps) => {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isBettingClosed, setIsBettingClosed] = useState<boolean>(false);
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const updateCountdown = () => {
    const countdown = duration * 60 - ((new Date().getMinutes() * 60 + new Date().getSeconds()) % (duration * 60));
    setTimeLeft(countdown);
    setIsBettingClosed(countdown <= 3);
    onBettingStateChange(countdown <= 3);
  };

  useEffect(() => {
    const updatePeriodAndCountdown = () => {
      const period = getCurrentPeriod(gameType, duration);
      setCurrentPeriod(period);
      updateCountdown();
    };

    updatePeriodAndCountdown();
    const interval = setInterval(updatePeriodAndCountdown, 1000);
    return () => clearInterval(interval);
  }, [gameType, duration]);

  const placeBet = (betType: 'color' | 'number', betValue: string | number, amount: number): boolean => {
    if (isBettingClosed || amount > userBalance) return false;
    const newBet: UserBet = {
      period: currentPeriod,
      betType,
      betValue,
      amount,
      timestamp: new Date(),
    };
    setUserBets(prev => [...prev, newBet]);
    onBalanceUpdate(-amount);
    return true;
  };

  return {
    currentPeriod,
    timeLeft,
    isBettingClosed,
    userBets,
    formatTime,
    placeBet
  };
};
