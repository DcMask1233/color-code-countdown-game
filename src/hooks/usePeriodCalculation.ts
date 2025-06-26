
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePeriodCalculation(durationSeconds: number) {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculatePeriodAndTimeLeft = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
    
    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    
    const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
    const periodNumber = Math.floor(secondsSinceStart / durationSeconds) + 1;
    
    const yearMonthDay = istTime.toISOString().slice(0, 10).replace(/-/g, '');
    const period = yearMonthDay + periodNumber.toString().padStart(3, '0');
    
    // Calculate time left in current period
    const secondsInCurrentPeriod = secondsSinceStart % durationSeconds;
    const timeLeftInPeriod = durationSeconds - secondsInCurrentPeriod;
    
    setCurrentPeriod(period);
    setTimeLeft(timeLeftInPeriod);
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
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
