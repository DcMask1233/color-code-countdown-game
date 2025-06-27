
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
    return 1000; // Update every second for accurate countdown
  }, []);

  useEffect(() => {
    setIsLoading(true);
    
    // Initial calculation
    calculatePeriod();
    setIsLoading(false);

    // Update every second for accurate countdown
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
