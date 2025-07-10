
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
      // Get duration from game mode - normalize case
      let duration = 60;
      const normalizedGameMode = gameMode.toLowerCase();
      if (normalizedGameMode === 'wingo3min') duration = 180;
      if (normalizedGameMode === 'wingo5min') duration = 300;

      // Get current period info
      const { data: periodData, error: periodError } = await supabase.rpc('get_current_game_period', {
        p_duration: duration
      });

      if (periodError) {
        console.error('Error fetching current period:', periodError);
        setError(periodError.message);
        return;
      }

      if (periodData && Array.isArray(periodData) && periodData.length > 0) {
        const current = periodData[0];
        
        // Try to get existing period from database
        const { data: dbPeriod, error: dbError } = await supabase
          .from('game_periods')
          .select('*')
          .eq('game_type', gameType.toLowerCase())
          .eq('game_mode', normalizedGameMode)
          .eq('period', current.period)
          .maybeSingle();

        if (dbError) {
          console.error('Error fetching period from DB:', dbError);
        }

        // Use real period from DB if exists, otherwise create basic structure
        const realPeriod: GamePeriod = dbPeriod || {
          id: 0, // Will be updated when period is created
          period: current.period,
          game_type: gameType.toLowerCase(),
          game_mode: normalizedGameMode,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + current.time_left * 1000).toISOString(),
          is_locked: current.time_left <= 5,
          result: null
        };

        setCurrentPeriod(realPeriod);
        setTimeLeft(current.time_left);
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
