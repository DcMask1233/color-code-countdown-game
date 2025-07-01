
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
      // Get duration from game mode
      let duration = 60;
      if (gameMode === 'Wingo3min') duration = 180;
      if (gameMode === 'Wingo5min') duration = 300;

      // Use the correct function name that we just created
      const { data, error } = await supabase.rpc('get_current_game_period', {
        p_duration: duration
      });

      if (error) {
        console.error('Error fetching current period:', error);
        setError(error.message);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const periodData = data[0];
        
        // Create a mock period object for compatibility
        const mockPeriod: GamePeriod = {
          id: 1,
          period: periodData.period,
          game_type: gameType.toLowerCase(),
          game_mode: gameMode.toLowerCase(),
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + periodData.time_left * 1000).toISOString(),
          is_locked: periodData.time_left <= 5,
          result: null
        };

        setCurrentPeriod(mockPeriod);
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
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
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
