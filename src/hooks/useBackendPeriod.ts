
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBackendPeriod = (durationSeconds: number) => {
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPeriod = async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_period', {
        p_duration: durationSeconds
      });

      if (error) {
        console.error('Error fetching current period:', error);
        setError(error.message);
        return;
      }

      if (data && data.length > 0) {
        const result = data[0];
        setCurrentPeriod(result.period);
        setTimeLeft(result.time_left);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error in fetchCurrentPeriod:', err);
      setError(err.message || 'Failed to fetch period');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCurrentPeriod();

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          fetchCurrentPeriod();
          return durationSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [durationSeconds]);

  return { currentPeriod, timeLeft, isLoading, error };
};
