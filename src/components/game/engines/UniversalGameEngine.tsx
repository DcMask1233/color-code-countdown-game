import { useEffect, useState } from "react";
import { getCurrentPeriod } from "@/lib/periodUtils";
import { ParityGame } from "./ParityGame"; // 👈 Make sure correct path
import { useToast } from "@/hooks/use-toast";

interface UniversalGameEngineProps {
  gameType: string;
  duration: number; // e.g. 1, 3, 5 (minutes)
}

const UniversalGameEngine: React.FC<UniversalGameEngineProps> = ({ gameType, duration }) => {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [userBets, setUserBets] = useState<any[]>([]);
  const [userBalance, setUserBalance] = useState<number>(1000); // temp default

  const calculateCountdown = () => {
    const now = new Date();
    const seconds = now.getMinutes() * 60 + now.getSeconds();
    const totalSeconds = duration * 60;
    return totalSeconds - (seconds % totalSeconds);
  };

  const updatePeriodAndCountdown = () => {
    const period = getCurrentPeriod(gameType, duration);
    const countdownValue = calculateCountdown();
    setCurrentPeriod(period);
    setCountdown(countdownValue);
  };

  useEffect(() => {
    updatePeriodAndCountdown(); // Initial
    const interval = setInterval(updatePeriodAndCountdown, 1000);
    return () => clearInterval(interval);
  }, [gameType, duration]);

  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handlePlaceBet = (
    betType: "color" | "number",
    betValue: string | number,
    amount: number
  ): boolean => {
    if (amount > userBalance) return false;

    const newBet = {
      period: currentPeriod,
      betType,
      betValue,
      amount,
      timestamp: new Date(),
    };

    setUserBets((prev) => [...prev, newBet]);
    setUserBalance((prev) => prev - amount);
    return true;
  };

  const isBettingClosed = countdown <= 3; // Prevent bets in last 3 seconds

  return (
    <ParityGame
      timeLeft={countdown}
      currentPeriod={currentPeriod}
      isBettingClosed={isBettingClosed}
      userBets={userBets}
      onPlaceBet={handlePlaceBet}
      userBalance={userBalance}
      formatTime={formatCountdown}
      duration={duration}
    />
  );
};

export default UniversalGameEngine;
