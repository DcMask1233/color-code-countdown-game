import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseSupabasePeriodReturn {
  currentPeriod: string;
  timeLeft: number;
  isLoading: boolean;
  error: string | null;
}

export const useSupabasePeriod = (duration: number): UseSupabasePeriodReturn => {
  const [currentPeriod, setCurrentPeriod] = useState('');
  const currentPeriodRef = useRef(currentPeriod);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPeriod = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc('generate_period', {
        game_duration: duration
      });

      if (error) {
        console.error('Error fetching period:', error);
        setError(error.message);
        return null;
      }

      return data as string; // Adjust type if needed
    } catch (err) {
      console.error('Error in fetchCurrentPeriod:', err);
      setError('Failed to fetch period');
      return null;
    }
  }, [duration]);

  const calculateTimeLeft = useCallback(() => {
    const nowUTC = new Date();
    const startOfDayUTC = new Date(Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate()
    ));
    const secondsSinceStart = Math.floor((nowUTC.getTime() - startOfDayUTC.getTime()) / 1000);
    const secondsInCurrentRound = secondsSinceStart % duration;
    const remaining = duration - secondsInCurrentRound;
    return remaining;
  }, [duration]);

  useEffect(() => {
    currentPeriodRef.current = currentPeriod;
  }, [currentPeriod]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let periodCheckInterval: NodeJS.Timeout;

    const updatePeriodAndTime = async () => {
      const period = await fetchCurrentPeriod();
      if (period) {
        setCurrentPeriod(period);
        setIsLoading(false);
        setError(null);
      }

      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    };

    updatePeriodAndTime();

    intervalId = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    }, 1000);

    periodCheckInterval = setInterval(async () => {
      const remaining = calculateTimeLeft();
      if (remaining <= 2 || remaining >= duration - 2) {
        const period = await fetchCurrentPeriod();
        if (period && period !== currentPeriodRef.current) {
          setCurrentPeriod(period);
        }
      }
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearInterval(periodCheckInterval);
    };
  }, [duration, fetchCurrentPeriod, calculateTimeLeft]);

  return {
    currentPeriod,
    timeLeft,
    isLoading,
    error
  };
};
