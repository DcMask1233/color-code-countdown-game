
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBackendPeriod = (duration: number) => {
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPeriod = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_period_info', {
        p_duration: duration
      });

      if (error) {
        console.error('Error fetching current period:', error);
        setError(error.message);
        return;
      }

      if (data && data.length > 0) {
        const periodData = data[0];
        setCurrentPeriod(periodData.period);
        setTimeLeft(periodData.time_left);
        setError(null);
      }
    } catch (err) {
      console.error('Error in fetchCurrentPeriod:', err);
      setError('Failed to fetch current period');
    } finally {
      setIsLoading(false);
    }
  }, [duration]);

  useEffect(() => {
    fetchCurrentPeriod();
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
        
        // Refetch when time is up
        if (newTime <= 0) {
          fetchCurrentPeriod();
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchCurrentPeriod]);

  return {
    currentPeriod,
    timeLeft,
    isLoading,
    error,
    refreshPeriod: fetchCurrentPeriod
  };
};
