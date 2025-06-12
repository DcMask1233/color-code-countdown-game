
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { PaginationControls } from "./PaginationControls";
import { useGameResults } from "@/hooks/useGameResults";

interface GameResultsTableProps {
  gameType: string;
  duration: number;
}

export const GameResultsTable = ({ gameType, duration }: GameResultsTableProps) => {
  const { results, loading } = useGameResults(gameType, duration);
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10;

  const getColorBubbles = (number: number, resultColors: string[]) => {
    if (resultColors.length === 1) {
      return (
        <div 
          className={`w-6 h-6 rounded-full border-2 border-white shadow-md ${
            resultColors[0] === 'green' ? 'bg-green-500' : 
            resultColors[0] === 'red' ? 'bg-red-500' : 'bg-violet-500'
          }`}
        />
      );
    }
    
    // For numbers 0 and 5 that have dual colors
    return (
      <div className="flex gap-1">
        {resultColors.map((color, index) => (
          <div 
            key={index}
            className={`w-5 h-5 rounded-full border-2 border-white shadow-md ${
              color === 'green' ? 'bg-green-500' : 
              color === 'red' ? 'bg-red-500' : 'bg-violet-500'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">📊</span>
          </div>
          <h3 className="font-semibold text-gray-800 capitalize">{gameType} Record</h3>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500">Loading results...</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(results.length / recordsPerPage);
  const startIndex = currentPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const displayRecords = results.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b bg-gray-50 flex items-center justify-center gap-2">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">📊</span>
        </div>
        <h3 className="font-semibold text-gray-800 capitalize">{gameType} Record</h3>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                Period
              </TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                Number
              </TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider py-3">
                Result
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRecords.map((record, index) => (
              <TableRow key={record.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
              }`}>
                <TableCell className="text-center text-sm text-gray-900 py-4 font-medium">
                  {record.period}
                </TableCell>
                <TableCell className="text-center py-4">
                  <span className={`font-bold text-xl ${
                    [1, 3, 7, 9].includes(record.number) ? 'text-green-600' :
                    [2, 4, 6, 8].includes(record.number) ? 'text-red-600' :
                    'text-violet-600'
                  }`}>
                    {record.number}
                  </span>
                </TableCell>
                <TableCell className="text-center py-4">
                  <div className="flex justify-center items-center">
                    {getColorBubbles(record.number, record.result_color)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {displayRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No records available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={results.length}
      />
    </div>
  );
};
