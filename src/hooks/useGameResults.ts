
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameResult {
  id: string;
  period: string;
  number: number;
  result_color: string[];
  game_type: string;
  duration: number;
  created_at: string;
}

export const useGameResults = (gameType: string, duration: number) => {
  const [results, setResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('game_type', gameType)
        .eq('duration', duration)
        .order('created_at', { ascending: false })
        .limit(50); // Get more for pagination

      if (error) {
        console.error('Error fetching game results:', error);
        toast({
          title: "Error",
          description: "Failed to fetch game results",
          variant: "destructive"
        });
      } else {
        setResults(data || []);
      }
    } catch (error) {
      console.error('Error in fetchResults:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('game_results_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_results',
          filter: `game_type=eq.${gameType} AND duration=eq.${duration}`
        },
        (payload) => {
          console.log('New game result:', payload.new);
          setResults(prev => [payload.new as GameResult, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType, duration]);

  return { results, loading, refetch: fetchResults };
};
