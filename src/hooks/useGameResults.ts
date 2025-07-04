
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GameResult {
  id: number;
  game_type: string;
  game_mode: string;
  period: string;
  result: {
    number: number;
    colors: string[];
  } | null;
  created_at: string;
}

export const useGameResults = (gameType: string, gameMode: string) => {
  const [results, setResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const RECORDS_PER_PAGE = 10;
  const MAX_RESULTS = 2500;

  const fetchResults = async (page: number = 1) => {
    try {
      setLoading(true);
      const offset = (page - 1) * RECORDS_PER_PAGE;
      
      // Get total count (limited to MAX_RESULTS)
      const { count, error: countError } = await supabase
        .from('game_periods')
        .select('*', { count: 'exact', head: true })
        .eq('game_type', gameType.toLowerCase())
        .eq('game_mode', gameMode.toLowerCase())
        .not('result', 'is', null)
        .order('created_at', { ascending: false })
        .limit(MAX_RESULTS);

      if (countError) {
        console.error('Error counting records:', countError);
        return;
      }

      const limitedCount = Math.min(count || 0, MAX_RESULTS);
      setTotalCount(limitedCount);
      setTotalPages(Math.ceil(limitedCount / RECORDS_PER_PAGE));
      
      // Get the actual data
      const { data, error } = await supabase
        .from('game_periods')
        .select('*')
        .eq('game_type', gameType.toLowerCase())
        .eq('game_mode', gameMode.toLowerCase())
        .not('result', 'is', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + RECORDS_PER_PAGE - 1);

      if (error) {
        console.error('Error fetching game results:', error);
      } else {
        // Transform the data to match the expected interface
        const transformedResults: GameResult[] = (data || []).map(period => ({
          id: period.id,
          game_type: period.game_type,
          game_mode: period.game_mode,
          period: period.period,
          result: period.result as { number: number; colors: string[] } | null,
          created_at: period.created_at || ''
        }));
        setResults(transformedResults);
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

  const goToFirstPage = () => {
    if (currentPage !== 1) {
      goToPage(1);
    }
  };

  const goToLastPage = () => {
    if (currentPage !== totalPages) {
      goToPage(totalPages);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchResults(1);

    // Subscribe to real-time updates with unique channel name
    const channelName = `game_results_${gameType}_${gameMode}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_periods',
          filter: `game_type=eq.${gameType.toLowerCase()} AND game_mode=eq.${gameMode.toLowerCase()}`
        },
        (payload) => {
          console.log('New game result:', payload.new);
          // If we're on page 1, refresh to show new result
          if (currentPage === 1) {
            fetchResults(1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType, gameMode]);

  return { 
    results, 
    loading,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    refetch: () => fetchResults(currentPage)
  };
};
