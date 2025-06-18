import { useEffect, useState } from "react";
import { getCurrentPeriod } from "@/lib/periodUtils";
import { useToast } from "@/hooks/use-toast";

interface UniversalGameEngineProps {
  gameType: string;
  duration: number; // e.g. 1, 3, 5 (minutes)
}

const UniversalGameEngine: React.FC<UniversalGameEngineProps> = ({ gameType, duration }) => {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);

  const calculateCountdown = () => {
    const now = new Date();
    const seconds = now.getMinutes() * 60 + now.getSeconds();
    const totalSeconds = duration * 60;
    return totalSeconds - (seconds % totalSeconds);
  };

  useEffect(() => {
    const updatePeriodAndCountdown = () => {
      const period = getCurrentPeriod(gameType, duration);
      const countdownValue = calculateCountdown();
      setCurrentPeriod(period);
      setCountdown(countdownValue);
    };

    updatePeriodAndCountdown(); // Initial
    const interval = setInterval(updatePeriodAndCountdown, 1000); // Every second

    return () => clearInterval(interval);
  }, [gameType, duration]);

  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="p-4 border rounded-md shadow-md bg-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm font-semibold">Period</p>
          <p className="text-lg font-bold text-blue-600">{currentPeriod}</p>
        </div>
        <div>
          <p className="text-sm font-semibold">Count Down</p>
          <p className="text-lg font-bold text-red-600">{formatCountdown(countdown)}</p>
        </div>
      </div>

      {/* Betting buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button className="bg-green-500 text-white py-2 rounded">Join Green</button>
        <button className="bg-purple-500 text-white py-2 rounded">Join Violet</button>
        <button className="bg-red-500 text-white py-2 rounded">Join Red</button>
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-5 gap-2">
        {[...Array(10).keys()].map((num) => (
          <div
            key={num}
            className={`text-white font-bold text-center py-2 rounded ${
              num === 0 || num === 5
                ? "bg-purple-600"
                : num % 2 === 0
                ? "bg-red-500"
                : "bg-green-500"
            }`}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UniversalGameEngine;
