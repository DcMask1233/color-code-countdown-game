
import React, { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "./PaginationControls";
import { useGameResults } from "@/hooks/useGameResults";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  gameType: string;
  duration: number;
}

export const GameResultsTable: React.FC<Props> = ({ gameType, duration }) => {
  // Convert duration to game mode
  const gameMode = duration === 60 ? 'wingo1min' : 
                   duration === 180 ? 'wingo3min' : 
                   duration === 300 ? 'wingo5min' : 'wingo1min';

  const { 
    results, 
    loading, 
    currentPage, 
    totalPages, 
    totalCount, 
    nextPage, 
    prevPage,
    goToFirstPage,
    goToLastPage,
    refetch
  } = useGameResults(gameType, gameMode);

  // Set up real-time subscription for new results with unique identifier
  useEffect(() => {
    const channelName = `${gameType}_results_realtime_${gameMode}_${Date.now()}_${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_periods',
          filter: `game_type=eq.${gameType.toLowerCase()} AND game_mode=eq.${gameMode}`
        },
        (payload) => {
          console.log('🔄 New result received:', payload.new);
          refetch(); // Refresh when new data comes in
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType, gameMode, refetch]);

  const getResultBadge = (colors: string[] | null) => {
    if (!colors || colors.length === 0) return null;
    
    return (
      <div className="flex gap-1">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`w-6 h-6 rounded-full ${
              color === 'green' ? 'bg-green-500' :
              color === 'red' ? 'bg-red-500' :
              color === 'violet' ? 'bg-purple-500' :
              'bg-gray-500'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading records...</p>
        </div>
      </div>
    );
  }

  if (!loading && results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data found.</p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * 10;
  const endIndex = Math.min(startIndex + 10, totalCount);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Period</TableHead>
              <TableHead className="font-semibold text-gray-700">Number</TableHead>
              <TableHead className="font-semibold text-gray-700">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((record) => {
              console.log('📊 Displaying period:', record.period);
              return (
                <TableRow key={record.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {record.period}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold">
                      {record.result?.number || 0}
                    </span>
                  </TableCell>
                  <TableCell>{getResultBadge(record.result?.colors || null)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={() => {}}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={totalCount}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        onFirstPage={goToFirstPage}
        onLastPage={goToLastPage}
      />
    </div>
  );
};
