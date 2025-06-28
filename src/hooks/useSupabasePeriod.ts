
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSupabasePeriod = (duration: number) => {
  const [currentPeriod, setCurrentPeriod] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeriodInfo = async () => {
      try {
        const { data, error } = await supabase.rpc('get_current_period_info', {
          p_duration: duration
        });

        if (error) {
          console.error('Error fetching period info:', error);
          setError('Failed to fetch period information');
          return;
        }

        if (data && data.length > 0) {
          setCurrentPeriod(data[0].period);
          setTimeLeft(data[0].time_left);
          setError(null);
        }
      } catch (err) {
        console.error('Error in fetchPeriodInfo:', err);
        setError('Failed to fetch period information');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately
    fetchPeriodInfo();

    // Update every second
    const interval = setInterval(fetchPeriodInfo, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  return {
    currentPeriod,
    timeLeft,
    isLoading,
    error
  };
};
