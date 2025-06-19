
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSupabasePeriodReturn {
  currentPeriod: string;
  timeLeft: number;
  isLoading: boolean;
  error: string | null;
}

export const useSupabasePeriod = (duration: number): UseSupabasePeriodReturn => {
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPeriod = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('generate_period', {
        game_duration: duration
      });

      if (error) {
        console.error('Error fetching period:', error);
        setError(error.message);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in fetchCurrentPeriod:', err);
      setError('Failed to fetch period');
      return null;
    }
  }, [duration]);

  const calculateTimeLeft = useCallback(() => {
    // Calculate time left using the same IST logic as Supabase
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
    const secondsInCurrentRound = secondsSinceStart % duration;
    const remaining = duration - secondsInCurrentRound;
    
    return remaining;
  }, [duration]);

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

    // Initial fetch
    updatePeriodAndTime();

    // Update time every second
    intervalId = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
    }, 1000);

    // Check for period changes every 10 seconds or when time is about to reset
    periodCheckInterval = setInterval(async () => {
      const remaining = calculateTimeLeft();
      // Check for new period when we're close to the end or at the beginning
      if (remaining <= 2 || remaining >= duration - 2) {
        const period = await fetchCurrentPeriod();
        if (period && period !== currentPeriod) {
          setCurrentPeriod(period);
        }
      }
    }, 10000);

    return () => {
      clearInterval(intervalId);
      clearInterval(periodCheckInterval);
    };
  }, [duration, fetchCurrentPeriod, calculateTimeLeft, currentPeriod]);

  return {
    currentPeriod,
    timeLeft,
    isLoading,
    error
  };
};
