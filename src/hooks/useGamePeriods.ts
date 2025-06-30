
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GamePeriod {
  id: number;
  period: string;
  game_type: string;
  game_mode: string;
  start_time: string;
  end_time: string;
  is_locked: boolean;
  result?: any;
}

export const useGamePeriods = (gameType: string, gameMode: string) => {
  const [currentPeriod, setCurrentPeriod] = useState<GamePeriod | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPeriod = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_current_game_period', {
        p_game_type: gameType,
        p_game_mode: gameMode
      });

      if (error) {
        console.error('Error fetching current period:', error);
        setError(error.message);
        return;
      }

      if (data && data.length > 0) {
        const periodData = data[0];
        
        // Fetch full period details
        const { data: periodDetails, error: periodError } = await supabase
          .from('game_periods')
          .select('*')
          .eq('id', periodData.period_id)
          .single();

        if (periodError) {
          console.error('Error fetching period details:', periodError);
          setError(periodError.message);
          return;
        }

        setCurrentPeriod(periodDetails);
        setTimeLeft(periodData.time_left);
        setError(null);
      }
    } catch (err) {
      console.error('Error in fetchCurrentPeriod:', err);
      setError('Failed to fetch current period');
    } finally {
      setIsLoading(false);
    }
  }, [gameType, gameMode]);

  useEffect(() => {
    fetchCurrentPeriod();
    
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
      
      // Refetch when time is up
      if (timeLeft <= 1) {
        fetchCurrentPeriod();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchCurrentPeriod, timeLeft]);

  return {
    currentPeriod,
    timeLeft,
    isLoading,
    error,
    refreshPeriod: fetchCurrentPeriod
  };
};
