import { useState, useEffect } from "react";
import { getCurrentPeriod } from "@/lib/periodUtils";

interface CountdownTimerProps {
  onRoundComplete: (newPeriod: string, winningNumber: number) => void;
  onBettingStateChange: (isBettingClosed: boolean) => void;
  gameMode?: string;
}

export const CountdownTimer = ({
  onRoundComplete,
  onBettingStateChange,
  gameMode = 'wingo-1min',
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [lastCompletedPeriod, setLastCompletedPeriod] = useState("");

  const getGameDuration = () => {
    switch (gameMode) {
      case 'wingo-1min':
        return 60;
      case 'wingo-3min':
        return 180;
      case 'wingo-5min':
        return 300;
      default:
        return 60;
    }
  };

  const generateWinningNumber = () => Math.floor(Math.random() * 10);

  useEffect(() => {
    const duration = getGameDuration();

    const updateTimer = () => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));

      const startOfDay = new Date(istTime);
      startOfDay.setHours(0, 0, 0, 0);
      const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
      const secondsInCurrentRound = secondsSinceStart % duration;
      const remaining = duration - secondsInCurrentRound;

      const newPeriod = getCurrentPeriod('parity', duration);
      setTimeLeft(remaining);
      setCurrentPeriod(newPeriod);

      const shouldCloseBetting = remaining <= 10;
      if (shouldCloseBetting !== isBettingClosed) {
        setIsBettingClosed(shouldCloseBetting);
        onBettingStateChange(shouldCloseBetting);
      }

      // Complete round when time is up
      if (remaining >= duration - 1 && lastCompletedPeriod !== newPeriod) {
        const winningNumber = generateWinningNumber();
        const prevPeriodNum = Math.floor(secondsSinceStart / duration);
        const yyyy = istTime.getFullYear();
        const mm = String(istTime.getMonth() + 1).padStart(2, "0");
        const dd = String(istTime.getDate()).padStart(2, "0");
        const prevPeriod = `${yyyy}${mm}${dd}${String(prevPeriodNum).padStart(3, "0")}`;
        
        if (prevPeriodNum > 0) {
          onRoundComplete(prevPeriod, winningNumber);
          setLastCompletedPeriod(prevPeriod);
        }
      }
    };

    updateTimer(); // Run immediately
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [onRoundComplete, onBettingStateChange, isBettingClosed, gameMode, lastCompletedPeriod]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between items-center mb-6 px-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-500 text-lg">🏆</span>
          <span className="text-sm text-gray-600 font-medium">Period</span>
        </div>
        <span className="text-2xl font-bold text-gray-800">{currentPeriod}</span>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-600 font-medium mb-1">Count Down</span>
        <span
          className={`text-2xl font-bold transition-all duration-300 ${
            isBettingClosed ? 'text-gray-800 opacity-50 blur-[1px]' : 'text-gray-800'
          }`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
};
