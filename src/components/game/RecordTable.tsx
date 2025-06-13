
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
  const [displayCount, setDisplayCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const getCorrectColors = (number: number): string[] => {
    // Correct color mapping based on specifications
    if (number === 0) return ["red", "violet"];
    if (number === 5) return ["green", "violet"];
    if ([1, 3, 7, 9].includes(number)) return ["green"];
    if ([2, 4, 6, 8].includes(number)) return ["red"];
    return ["green"]; // fallback
  };

  const getColorBubbles = (number: number) => {
    const colors = getCorrectColors(number);
    
    if (colors.length === 1) {
      return (
        <div 
          className={`w-6 h-6 rounded border-2 border-white shadow-md ${
            colors[0] === 'green' ? 'bg-green-500' : 
            colors[0] === 'red' ? 'bg-red-500' : 'bg-violet-500'
          }`}
        />
      );
    }
    
    // For numbers 0 and 5 that have dual colors
    return (
      <div className="flex gap-1">
        {colors.map((color, index) => (
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

  const loadMore = () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setDisplayCount(prev => prev + 10);
      setLoading(false);
    }, 500);
  };

  // Sort records by period in descending order
  const sortedRecords = [...records].sort((a, b) => b.period.localeCompare(a.period));
  const displayRecords = sortedRecords.slice(0, displayCount);
  const hasMore = displayCount < sortedRecords.length;

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
            {displayRecords.map((record, index) => (
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
                    {getColorBubbles(record.number)}
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
      
      {hasMore && (
        <div className="p-4 border-t bg-gray-50 flex justify-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
      
      {!hasMore && displayRecords.length > 0 && (
        <div className="p-4 border-t bg-gray-50 text-center">
          <span className="text-sm text-gray-500">
            All records loaded ({displayRecords.length} total)
          </span>
        </div>
      )}
    </div>
  );
};
