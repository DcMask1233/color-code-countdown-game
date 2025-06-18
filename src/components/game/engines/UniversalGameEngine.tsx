import { useState, useEffect, Dispatch, SetStateAction } from "react";

export interface UserBet {
  betType: "number" | "color";
  betValue: string | number;
  amount: number;
  period: string;
  timestamp: number;
}

export interface UniversalGameEngineProps {
  gameType: string;
  duration: number;               // e.g. 60 seconds
  onPeriodChange: Dispatch<SetStateAction<string>>;
  onCountdownChange: Dispatch<SetStateAction<number>>;
  onBettingClosedChange: Dispatch<SetStateAction<boolean>>;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (amount: number) => void;
  userBalance: number;
}

export function UniversalGameEngine({
  gameType,
  duration,
  onPeriodChange,
  onCountdownChange,
  onBettingClosedChange,
  onRoundComplete,
  onBalanceUpdate,
  userBalance,
}: UniversalGameEngineProps) {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isBettingClosed, setIsBettingClosed] = useState<boolean>(false);
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  // Generate period string, e.g. date + gameType + sequence number
  const generatePeriod = (): string => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const timestamp = Date.now();
    return `${dateStr}-${gameType}-${timestamp}`;
  };

  // Countdown timer effect
  useEffect(() => {
    setCurrentPeriod(generatePeriod());
    onPeriodChange(generatePeriod());
    setTimeLeft(duration);
    setIsBettingClosed(false);
    onBettingClosedChange(false);
  }, [gameType, duration, onPeriodChange, onBettingClosedChange]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsBettingClosed(true);
      onBettingClosedChange(true);

      // Generate winning number (0-9) randomly
      const winningNumber = Math.floor(Math.random() * 10);

      onRoundComplete(currentPeriod, winningNumber, gameType);

      // Reset bets for new round
      setUserBets([]);

      // Reset for next round
      const nextPeriod = generatePeriod();
      setCurrentPeriod(nextPeriod);
      onPeriodChange(nextPeriod);
      setTimeLeft(duration);
      setIsBettingClosed(false);
      onBettingClosedChange(false);
    }

    // Countdown interval
    const timerId = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
      onCountdownChange((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, currentPeriod, gameType, duration, onRoundComplete, onPeriodChange, onBettingClosedChange, onCountdownChange]);

  // Place bet function
  const placeBet = (betType: "number" | "color", betValue: string | number, amount: number): boolean => {
    if (isBettingClosed) return false;
    if (amount > userBalance) return false;

    const newBet: UserBet = {
      betType,
      betValue,
      amount,
      period: currentPeriod,
      timestamp: Date.now(),
    };

    setUserBets((prev) => [...prev, newBet]);
    onBalanceUpdate(-amount);

    return true;
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return {
    currentPeriod,
    timeLeft,
    isBettingClosed,
    userBets,
    placeBet,
    formatTime,
  };
}
