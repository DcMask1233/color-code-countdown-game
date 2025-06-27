
import { useEffect, useState } from "react";
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

  const calculatePeriod = () => {
    try {
      const info = getCurrentPeriod(durationSeconds);
      setPeriodInfo(info);
      setError(null);
      
      console.log(`🕐 Period calculation for ${durationSeconds}s:`, {
        period: info.period,
        timeLeft: info.timeLeft,
        periodNumber: info.periodNumber
      });
    } catch (err: any) {
      console.error('❌ Error in period calculation:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Initial calculation
    calculatePeriod();
    setIsLoading(false);

    // Update every second
    const timer = setInterval(() => {
      calculatePeriod();
    }, 1000);

    return () => clearInterval(timer);
  }, [durationSeconds]);

  return { 
    currentPeriod: periodInfo.period, 
    timeLeft: periodInfo.timeLeft, 
    isLoading, 
    error,
    periodNumber: periodInfo.periodNumber,
    dateString: periodInfo.dateString
  };
}
