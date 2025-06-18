import React, { useEffect, useState } from "react";

export interface UniversalGameEngineProps {
  gameType: string;
  duration: number; // in seconds
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (amount: number) => void;
  userBalance: number;
  onBettingStateChange?: (isClosed: boolean) => void;
}

export function UniversalGameEngine({
  gameType,
  duration,
  onRoundComplete,
  onBalanceUpdate,
  userBalance,
  onBettingStateChange,
}: UniversalGameEngineProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [userBets, setUserBets] = useState<{ betType: string; betValue: string | number; amount: number }[]>([]);

  // Utility to format time in mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Simulate period calculation — Replace with your own period logic
  const generatePeriod = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const periodNumber = Math.floor(totalSeconds / duration);
    return `${yyyy}${mm}${dd}${periodNumber}`;
  };

  // Countdown timer logic
  useEffect(() => {
    setCurrentPeriod(generatePeriod());
    setTimeLeft(duration);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Round ended
          const newPeriod = generatePeriod();
          setCurrentPeriod(newPeriod);
          const winningNumber = Math.floor(Math.random() * 10); // Example: winning number 0-9
          onRoundComplete(newPeriod, winningNumber, gameType);
          return duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, gameType, onRoundComplete]);

  // Betting close state logic - e.g., close betting last 10 seconds
  useEffect(() => {
    const closed = timeLeft <= 10;
    setIsBettingClosed(closed);
    if (onBettingStateChange) onBettingStateChange(closed);
  }, [timeLeft, onBettingStateChange]);

  // Place a bet function
  const placeBet = (betType: "number" | "color", betValue: string | number, amount: number): boolean => {
    if (isBettingClosed) return false;
    if (amount > userBalance) return false;

    setUserBets((prev) => [...prev, { betType, betValue, amount }]);
    onBalanceUpdate(-amount);
    return true;
  };

  return {
    timeLeft,
    currentPeriod,
    isBettingClosed,
    userBets,
    formatTime,
    placeBet,
  };
}
