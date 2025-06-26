
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "./PaginationControls";
import { useGameResults } from "@/hooks/useGameResults";

interface Props {
  gameType: string;
  duration: number;
}

export const GameResultsTable: React.FC<Props> = ({ gameType, duration }) => {
  const { 
    results, 
    loading, 
    currentPage, 
    totalPages, 
    totalCount, 
    nextPage, 
    prevPage,
    goToFirstPage,
    goToLastPage
  } = useGameResults(gameType, duration);

  const formatPeriod = (period: string) => {
    // Period format is YYYYMMDDRR (e.g., 202406261234)
    if (period.length >= 11) {
      const year = period.substring(0, 4);
      const month = period.substring(4, 6);
      const day = period.substring(6, 8);
      const round = period.substring(8);
      return `${year}${month}${day}${round}`;
    }
    return period;
  };

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
            {results.map((record) => (
              <TableRow key={record.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{formatPeriod(record.period)}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    {record.number}
                  </span>
                </TableCell>
                <TableCell>{getResultBadge(record.result_color)}</TableCell>
              </TableRow>
            ))}
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
