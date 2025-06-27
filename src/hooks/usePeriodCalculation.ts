
import { useEffect, useState } from "react";

export function usePeriodCalculation(durationSeconds: number) {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculatePeriodAndTimeLeft = () => {
    try {
      // Get current time in IST (UTC + 5.5 hours)
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      // Get start of day in IST
      const startOfDay = new Date(istTime);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Calculate seconds since start of day
      const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
      
      // Calculate current period number (1-based, like backend)
      const periodNumber = Math.floor(secondsSinceStart / durationSeconds) + 1;
      
      // Format date as YYYYMMDD
      const yearMonthDay = istTime.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Create period string with 3-digit padding (matching backend)
      const period = yearMonthDay + periodNumber.toString().padStart(3, '0');
      
      // Calculate time left in current period
      const secondsInCurrentPeriod = secondsSinceStart % durationSeconds;
      const timeLeftInPeriod = durationSeconds - secondsInCurrentPeriod;
      
      console.log(`🕐 Period calculation for ${durationSeconds}s:`, {
        istTime: istTime.toISOString(),
        secondsSinceStart,
        periodNumber,
        period,
        timeLeftInPeriod
      });
      
      setCurrentPeriod(period);
      setTimeLeft(timeLeftInPeriod);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error in period calculation:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Initial calculation
    calculatePeriodAndTimeLeft();
    setIsLoading(false);

    // Update every second
    const timer = setInterval(() => {
      calculatePeriodAndTimeLeft();
    }, 1000);

    return () => clearInterval(timer);
  }, [durationSeconds]);

  return { currentPeriod, timeLeft, isLoading, error };
}
