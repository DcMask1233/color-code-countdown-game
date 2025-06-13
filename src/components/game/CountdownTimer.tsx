
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  onRoundComplete: (newPeriod: string, winningNumber: number) => void;
  onBettingStateChange: (isBettingClosed: boolean) => void;
  gameMode?: string;
}

export const CountdownTimer = ({ onRoundComplete, onBettingStateChange, gameMode = 'wingo-1min' }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [isBettingClosed, setIsBettingClosed] = useState(false);

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

  const generatePeriod = () => {
    // Get current IST time (UTC + 5:30)
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Format date as YYYYMMDD
    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const day = String(istTime.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Calculate seconds since start of IST day (12:00 AM IST)
    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    const secondsSinceStartOfDay = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
    
    // Calculate round number based on duration
    const duration = getGameDuration();
    const roundNumber = Math.floor(secondsSinceStartOfDay / duration) + 1;
    
    // Format as YYYYMMDDRRR
    return `${dateStr}${String(roundNumber).padStart(3, '0')}`;
  };

  const generateWinningNumber = () => {
    return Math.floor(Math.random() * 10);
  };

  useEffect(() => {
    setCurrentPeriod(generatePeriod());
    
    const timer = setInterval(() => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const duration = getGameDuration();
      
      // Calculate seconds since start of IST day
      const startOfDay = new Date(istTime);
      startOfDay.setHours(0, 0, 0, 0);
      const secondsSinceStartOfDay = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
      
      const secondsInCurrentRound = secondsSinceStartOfDay % duration;
      const remaining = duration - secondsInCurrentRound;
      
      setTimeLeft(remaining);
      
      const shouldCloseBetting = remaining <= 10;
      if (shouldCloseBetting !== isBettingClosed) {
        setIsBettingClosed(shouldCloseBetting);
        onBettingStateChange(shouldCloseBetting);
      }
      
      if (remaining === duration) {
        const newPeriod = generatePeriod();
        const winningNumber = generateWinningNumber();
        setCurrentPeriod(newPeriod);
        onRoundComplete(newPeriod, winningNumber);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onRoundComplete, onBettingStateChange, isBettingClosed, gameMode]);

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
            isBettingClosed 
              ? 'text-gray-800 opacity-50 blur-[1px]' 
              : 'text-gray-800'
          }`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
};
