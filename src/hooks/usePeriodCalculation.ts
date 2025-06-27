
import { useEffect, useState, useCallback, useMemo } from "react";
import { getCurrentPeriod, type PeriodInfo } from "@/lib/periodUtils";

export function usePeriodCalculation(durationSeconds: number) {
  const [periodInfo, setPeriodInfo] = useState<PeriodInfo>({
    period: "",
    timeLeft: durationSeconds,
    periodNumber: 0,
    dateString: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculatePeriod = useCallback(() => {
    try {
      const info = getCurrentPeriod(durationSeconds);
      setPeriodInfo(info);
      setError(null);
    } catch (err: any) {
      console.error('Error in period calculation:', err);
      setError(err.message);
    }
  }, [durationSeconds]);

  // Memoize the timer interval to prevent unnecessary re-creation
  const timerInterval = useMemo(() => {
    return Math.min(1000, durationSeconds * 100); // Update every second, but not more frequently than needed
  }, [durationSeconds]);

  useEffect(() => {
    setIsLoading(true);
    
    // Initial calculation
    calculatePeriod();
    setIsLoading(false);

    // Update periodically
    const timer = setInterval(calculatePeriod, timerInterval);

    return () => clearInterval(timer);
  }, [calculatePeriod, timerInterval]);

  return { 
    currentPeriod: periodInfo.period, 
    timeLeft: periodInfo.timeLeft, 
    isLoading, 
    error,
    periodNumber: periodInfo.periodNumber,
    dateString: periodInfo.dateString
  };
}
