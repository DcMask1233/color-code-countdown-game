
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  onRoundComplete: (newPeriod: string) => void;
}

export const CountdownTimer = ({ onRoundComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentPeriod, setCurrentPeriod] = useState("");

  const generatePeriod = () => {
    const now = new Date();
    // Convert to IST (UTC+5:30)
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const day = String(istTime.getDate()).padStart(2, '0');
    
    // Calculate round number (each round is 1 minute, so we get the current minute of the day)
    const totalMinutes = istTime.getHours() * 60 + istTime.getMinutes();
    const roundNumber = String(totalMinutes % 1000).padStart(3, '0');
    
    return `${year}${month}${day}${roundNumber}`;
  };

  useEffect(() => {
    // Initialize period
    setCurrentPeriod(generatePeriod());

    const timer = setInterval(() => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const secondsInCurrentMinute = istTime.getSeconds();
      const remaining = 60 - secondsInCurrentMinute;
      
      setTimeLeft(remaining);
      
      if (remaining === 60) {
        const newPeriod = generatePeriod();
        setCurrentPeriod(newPeriod);
        onRoundComplete(newPeriod);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onRoundComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Period</span>
        <span className="text-sm font-semibold text-gray-800">{currentPeriod}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Count Down</span>
        <span className="text-lg font-bold text-red-500">{formatTime(timeLeft)}</span>
      </div>
    </div>
  );
};
