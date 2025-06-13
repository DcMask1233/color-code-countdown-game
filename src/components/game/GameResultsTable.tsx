
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGameResults } from "@/hooks/useGameResults";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface GameResultsTableProps {
  gameType: string;
  duration: number;
}

export const GameResultsTable = ({ gameType, duration }: GameResultsTableProps) => {
  const { results, loading, loadingMore, hasMore, loadMore } = useGameResults(gameType, duration);

  const getColorBubbles = (number: number, resultColors: string[]) => {
    if (resultColors.length === 1) {
      return (
        <div 
          className={`w-6 h-6 rounded border-2 border-white shadow-md ${
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
            className={`w-5 h-5 rounded border-2 border-white shadow-md ${
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
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading results...</p>
        </div>
      </div>
    );
  }

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
              <TableHead className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 w-1/3">
                Period
              </TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 w-1/3">
                Number
              </TableHead>
              <TableHead className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider py-3 w-1/3">
                Result
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((record, index) => (
              <TableRow key={record.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
              }`}>
                <TableCell className="text-center text-sm text-gray-900 py-4 font-medium px-2">
                  <div className="truncate">{record.period}</div>
                </TableCell>
                <TableCell className="text-center py-4 px-2">
                  <span className={`font-bold text-xl ${
                    [1, 3, 7, 9].includes(record.number) ? 'text-green-600' :
                    [2, 4, 6, 8].includes(record.number) ? 'text-red-600' :
                    'text-violet-600'
                  }`}>
                    {record.number}
                  </span>
                </TableCell>
                <TableCell className="text-center py-4 px-2">
                  <div className="flex justify-center items-center">
                    {getColorBubbles(record.number, record.result_color)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {results.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                  No records available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {hasMore && (
        <div className="p-4 border-t bg-gray-50 flex justify-center">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
      
      {!hasMore && results.length > 0 && (
        <div className="p-4 border-t bg-gray-50 text-center">
          <span className="text-sm text-gray-500">
            All records loaded ({results.length} total)
          </span>
        </div>
      )}
    </div>
  );
};
