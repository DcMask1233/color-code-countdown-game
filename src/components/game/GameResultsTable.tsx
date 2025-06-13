
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGameResults } from "@/hooks/useGameResults";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface GameResultsTableProps {
  gameType: string;
  duration: number;
}

export const GameResultsTable = ({ gameType, duration }: GameResultsTableProps) => {
  const { results, loading, currentPage, totalPages, totalCount, goToPage, nextPage, prevPage } = useGameResults(gameType, duration);

  const getColorCircles = (number: number, resultColors: string[]) => {
    if (resultColors.length === 1) {
      return (
        <div 
          className={`w-6 h-6 rounded-full shadow-md ${
            resultColors[0] === 'green' ? 'bg-green-500' : 
            resultColors[0] === 'red' ? 'bg-red-500' : 'bg-violet-500'
          }`}
        />
      );
    }
    
    // For numbers 0 and 5 that have dual colors - split circles
    if (number === 0) {
      return (
        <div className="relative w-6 h-6 rounded-full overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-violet-500" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}></div>
          <div className="absolute inset-0 bg-red-500" style={{ clipPath: 'polygon(0% 0%, 50% 100%, 0% 100%)' }}></div>
        </div>
      );
    }
    
    if (number === 5) {
      return (
        <div className="relative w-6 h-6 rounded-full overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-violet-500" style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)' }}></div>
          <div className="absolute inset-0 bg-green-500" style={{ clipPath: 'polygon(0% 0%, 50% 100%, 0% 100%)' }}></div>
        </div>
      );
    }

    return (
      <div className="w-6 h-6 rounded-full bg-gray-300 shadow-md" />
    );
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>
      );
    }
    
    return buttons;
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
                    {getColorCircles(record.number, record.result_color)}
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
      
      {totalPages > 1 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalCount)} of {totalCount} records
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              
              <div className="flex items-center gap-1">
                {renderPaginationButtons()}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
