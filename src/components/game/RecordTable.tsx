
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
  price?: number;
}

interface RecordTableProps {
  records: GameRecord[];
  gameType: string;
}

export const RecordTable = ({ records, gameType }: RecordTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const recordsPerPage = 10;

  const getCorrectColors = (number: number): string[] => {
    // Correct color mapping based on specifications
    if (number === 0) return ["red", "violet"];
    if (number === 5) return ["green", "violet"];
    if ([1, 3, 7, 9].includes(number)) return ["green"];
    if ([2, 4, 6, 8].includes(number)) return ["red"];
    return ["green"]; // fallback
  };

  const getColorCircles = (number: number) => {
    const colors = getCorrectColors(number);
    
    if (colors.length === 1) {
      return (
        <div 
          className={`w-6 h-6 rounded-full shadow-md ${
            colors[0] === 'green' ? 'bg-green-500' : 
            colors[0] === 'red' ? 'bg-red-500' : 'bg-violet-500'
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

  // Sort records by period in descending order
  const sortedRecords = [...records].sort((a, b) => b.period.localeCompare(a.period));
  const totalPages = Math.ceil(sortedRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = sortedRecords.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setLoading(true);
      // Simulate loading delay
      setTimeout(() => {
        setCurrentPage(page);
        setLoading(false);
      }, 300);
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500">Loading...</p>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {currentRecords.map((record, index) => (
                  <TableRow key={record.period} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
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
                        {getColorCircles(record.number)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {currentRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      No records available
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedRecords.length)} of {sortedRecords.length} records
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
