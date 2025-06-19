
import { useState, useEffect } from "react";
import { useSupabasePeriod } from "@/hooks/useSupabasePeriod";

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

  const duration = getGameDuration();
  const { currentPeriod, timeLeft, isLoading, error } = useSupabasePeriod(duration);

  const generateWinningNumber = () => Math.floor(Math.random() * 10);

  useEffect(() => {
    if (isLoading || error) return;

    const shouldCloseBetting = timeLeft <= 10;
    if (shouldCloseBetting !== isBettingClosed) {
      setIsBettingClosed(shouldCloseBetting);
      onBettingStateChange(shouldCloseBetting);
    }

    // Complete round when time is up - complete the CURRENT period that was being displayed
    if (timeLeft <= 1 && lastCompletedPeriod !== currentPeriod) {
      const winningNumber = generateWinningNumber();
      
      // Complete the current period that users were betting on
      onRoundComplete(currentPeriod, winningNumber);
      setLastCompletedPeriod(currentPeriod);
    }
  }, [timeLeft, currentPeriod, isBettingClosed, lastCompletedPeriod, onRoundComplete, onBettingStateChange, isLoading, error]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle loading and error states
  const displayPeriod = isLoading ? "Loading..." : error ? "Error" : currentPeriod;
  const displayTime = isLoading || error ? 0 : timeLeft;

  return (
    <div className="flex justify-between items-center mb-6 px-4">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-500 text-lg">🏆</span>
          <span className="text-sm text-gray-600 font-medium">Period</span>
        </div>
        <span className="text-2xl font-bold text-gray-800">{displayPeriod}</span>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-sm text-gray-600 font-medium mb-1">Count Down</span>
        <span
          className={`text-2xl font-bold transition-all duration-300 ${
            isBettingClosed ? 'text-gray-800 opacity-50 blur-[1px]' : 'text-gray-800'
          }`}
        >
          {formatTime(displayTime)}
        </span>
      </div>
    </div>
  );
};
