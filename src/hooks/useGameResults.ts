
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  const RECORDS_PER_PAGE = 10;

  const fetchResults = async (page: number = 0, reset: boolean = true) => {
    try {
      if (page === 0) setLoading(true);
      else setLoadingMore(true);

      const offset = page * RECORDS_PER_PAGE;
      
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('game_type', gameType)
        .eq('duration', duration)
        .order('period', { ascending: false })
        .range(offset, offset + RECORDS_PER_PAGE - 1);

      if (error) {
        console.error('Error fetching game results:', error);
        toast({
          title: "Error",
          description: "Failed to fetch game results",
          variant: "destructive"
        });
        setHasMore(false);
      } else {
        const newResults = data || [];
        
        if (reset) {
          setResults(newResults);
        } else {
          setResults(prev => [...prev, ...newResults]);
        }
        
        // Check if there are more records
        setHasMore(newResults.length === RECORDS_PER_PAGE);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error in fetchResults:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchResults(currentPage + 1, false);
    }
  };

  const resetPagination = () => {
    setCurrentPage(0);
    setHasMore(true);
    fetchResults(0, true);
  };

  useEffect(() => {
    resetPagination();

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

  return { 
    results, 
    loading, 
    loadingMore,
    hasMore,
    loadMore,
    refetch: () => resetPagination()
  };
};
