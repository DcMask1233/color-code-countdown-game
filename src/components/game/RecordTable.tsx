
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { PaginationControls } from "./PaginationControls";

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
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10;

  const getColorBubble = (colors: string[]) => {
    if (colors.length === 1) {
      return (
        <div 
          className={`w-5 h-5 rounded-full border-2 border-white shadow-sm ${
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
            className={`w-4 h-4 rounded-full border border-white shadow-sm ${
              color === 'green' ? 'bg-green-500' : 
              color === 'red' ? 'bg-red-500' : 'bg-violet-500'
            }`}
          />
        ))}
      </div>
    );
  };

  // Pagination logic for records
  const totalPages = Math.ceil(records.length / recordsPerPage);
  const startIndex = currentPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const displayRecords = records.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center justify-center gap-2">
        <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
          <span className="text-white text-xs">🏆</span>
        </div>
        <h3 className="font-semibold text-gray-800 capitalize">{gameType} Record</h3>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-center text-xs font-medium text-gray-500 uppercase">Period</TableHead>
              <TableHead className="text-center text-xs font-medium text-gray-500 uppercase">Number</TableHead>
              <TableHead className="text-center text-xs font-medium text-gray-500 uppercase">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRecords.map((record, index) => (
              <TableRow key={record.period} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <TableCell className="text-center text-sm text-gray-900 py-3">
                  {record.period.slice(-10)}
                </TableCell>
                <TableCell className="text-center text-sm py-3">
                  <span className={`font-bold text-lg ${
                    record.number % 2 === 0 ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {record.number}
                  </span>
                </TableCell>
                <TableCell className="text-center py-3">
                  <div className="flex justify-center">
                    {getColorBubble(record.color)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        startIndex={startIndex}
        endIndex={endIndex}
        totalItems={records.length}
      />
    </div>
  );
};
