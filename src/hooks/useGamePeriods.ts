
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GamePeriod {
  id: number;
  game_type: string;
  game_mode: string;
  period: string;
  result: any;
  start_time: string;
  end_time: string;
  is_locked: boolean;
  created_at: string;
}

export const useGamePeriods = (gameType: string, gameMode: string) => {
  const [currentPeriod, setCurrentPeriod] = useState<GamePeriod | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentPeriod = async () => {
    try {
      const { data, error } = await supabase
        .from('game_periods')
        .select('*')
        .eq('game_type', gameType.toLowerCase())
        .eq('game_mode', gameMode.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching current period:', error);
        setError('Failed to fetch current period');
        return;
      }

      if (data) {
        setCurrentPeriod(data);
        
        // Calculate time left
        const endTime = new Date(data.end_time).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);
        setError(null);
      }
    } catch (err) {
      console.error('Error in fetchCurrentPeriod:', err);
      setError('Failed to fetch current period');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentPeriod();

    // Update time left every second
    const interval = setInterval(() => {
      if (currentPeriod) {
        const endTime = new Date(currentPeriod.end_time).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);
        
        // Refresh period if time is up
        if (remaining === 0) {
          fetchCurrentPeriod();
        }
      }
    }, 1000);

    // Subscribe to real-time updates
    const channel = supabase
      .channel('game_periods_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_periods',
          filter: `game_type=eq.${gameType.toLowerCase()} AND game_mode=eq.${gameMode.toLowerCase()}`
        },
        (payload) => {
          console.log('Game period update:', payload);
          fetchCurrentPeriod();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [gameType, gameMode]);

  return {
    currentPeriod,
    timeLeft,
    isLoading,
    error,
    refetch: fetchCurrentPeriod
  };
};
