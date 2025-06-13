
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const RECORDS_PER_PAGE = 10;

  const fetchResults = async (page: number = 1) => {
    try {
      setLoading(true);
      const offset = (page - 1) * RECORDS_PER_PAGE;
      
      // First get total count
      const { count, error: countError } = await supabase
        .from('game_results')
        .select('*', { count: 'exact', head: true })
        .eq('game_type', gameType)
        .eq('duration', duration);

      if (countError) {
        console.error('Error counting records:', countError);
        toast({
          title: "Error",
          description: "Failed to count game results",
          variant: "destructive"
        });
        return;
      }

      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / RECORDS_PER_PAGE));
      
      // Then get the actual data
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
      } else {
        setResults(data || []);
      }
    } catch (error) {
      console.error('Error in fetchResults:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      fetchResults(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchResults(1);

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
          // If we're on page 1, add the new result to the top
          if (currentPage === 1) {
            setResults(prev => [payload.new as GameResult, ...prev.slice(0, RECORDS_PER_PAGE - 1)]);
            setTotalCount(prev => prev + 1);
            setTotalPages(prev => Math.ceil((totalCount + 1) / RECORDS_PER_PAGE));
          }
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
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    nextPage,
    prevPage,
    refetch: () => fetchResults(currentPage)
  };
};
