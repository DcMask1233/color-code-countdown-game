import { useState, useEffect } from "react";

interface CountdownTimerProps {
  onRoundComplete: (newPeriod: string, winningNumber: number) => void;
  onBettingStateChange: (isBettingClosed: boolean) => void;
  gameMode?: string;
}

export const CountdownTimer = ({
  onRoundComplete,
  onBettingStateChange,
  gameMode = "wingo-1min",
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [isBettingClosed, setIsBettingClosed] = useState(false);

  const getGameDuration = () => {
    switch (gameMode) {
      case "wingo-1min":
        return 60;
      case "wingo-3min":
        return 180;
      case "wingo-5min":
        return 300;
      default:
        return 60;
    }
  };

  const generatePeriod = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, "0");
    const day = String(istTime.getDate()).padStart(2, "0");
    const dateStr = `${year}${month}${day}`;

    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    const secondsSinceStartOfDay = Math.floor(
      (istTime.getTime() - startOfDay.getTime()) / 1000
    );

    const duration = getGameDuration();
    const roundNumber = Math.floor(secondsSinceStartOfDay / duration) + 1;

    return `${dateStr}${String(roundNumber).padStart(3, "0")}`;
  };

  const generateWinningNumber = () => {
    return Math.floor(Math.random() * 10);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const duration = getGameDuration();

      const startOfDay = new Date(istTime);
      startOfDay.setHours(0, 0, 0, 0);
      const secondsSinceStartOfDay = Math.floor(
        (istTime.getTime() - startOfDay.getTime()) / 1000
      );

      const secondsInCurrentRound = secondsSinceStartOfDay % duration;
      const remaining = duration - secondsInCurrentRound;

      setTimeLeft(remaining);

      const newPeriod = generatePeriod();
      setCurrentPeriod(newPeriod); // ✅ Always update to the accurate current period

      const shouldCloseBetting = remaining <= 10;
      if (shouldCloseBetting !== isBettingClosed) {
        setIsBettingClosed(shouldCloseBetting);
        onBettingStateChange(shouldCloseBetting);
      }

      if (remaining === duration) {
        const winningNumber = generateWinningNumber();
        onRoundComplete(newPeriod, winningNumber);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onRoundComplete, onBettingStateChange, isBettingClosed, gameMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex justify-between items-center mb-6 px-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-500 text-lg">🏆</span>
