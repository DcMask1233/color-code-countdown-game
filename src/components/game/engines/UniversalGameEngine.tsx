import { useEffect } from "react";
import { getCurrentPeriod } from "@/lib/periodUtils";

interface UniversalGameEngineProps {
  gameType: string;
  duration: number; // e.g. 1, 3, 5 (minutes)
  onPeriodChange: (period: string) => void;
  onCountdownChange: (countdown: number) => void;
  onBettingClosedChange: (isClosed: boolean) => void;
}

const UniversalGameEngine: React.FC<UniversalGameEngineProps> = ({
  gameType,
  duration,
  onPeriodChange,
  onCountdownChange,
  onBettingClosedChange,
}) => {
  const calculateCountdown = () => {
    const now = new Date();
    const seconds = now.getMinutes() * 60 + now.getSeconds();
    const totalSeconds = duration * 60;
    return totalSeconds - (seconds % totalSeconds);
  };

  useEffect(() => {
    const updatePeriodAndCountdown = () => {
      const period = getCurrentPeriod(gameType, duration);
      const countdown = calculateCountdown();
      const isBettingClosed = countdown <= 3; // Customize the lock time

      onPeriodChange(period);
      onCountdownChange(countdown);
      onBettingClosedChange(isBettingClosed);
    };

    updatePeriodAndCountdown(); // initial
    const interval = setInterval(updatePeriodAndCountdown, 1000);

    return () => clearInterval(interval);
  }, [gameType, duration, onPeriodChange, onCountdownChange, onBettingClosedChange]);

  return null; // This component is logic-only, no UI
};

export default UniversalGameEngine;
