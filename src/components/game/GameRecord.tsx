
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
  price?: number;
}

interface UserBet {
  period: string;
  betType: 'color' | 'number';
  betValue: string | number;
  amount: number;
  result?: 'win' | 'lose';
  payout?: number;
  timestamp: Date;
}

interface GameRecordProps {
  records: GameRecord[];
  userBets: UserBet[];
  gameType: string;
}

export const GameRecord = ({ records, userBets, gameType }: GameRecordProps) => {
  const [expandedBet, setExpandedBet] = useState<number | null>(null);
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

  const toggleBetExpansion = (index: number) => {
    setExpandedBet(expandedBet === index ? null : index);
  };

  // Pagination logic for records
  const totalPages = Math.ceil(records.length / recordsPerPage);
  const startIndex = currentPage * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const displayRecords = records.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Show only the latest 5 user bets
  const displayUserBets = userBets.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Past Records Section with Pagination */}
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t bg-gray-50 flex items-center justify-center gap-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                currentPage === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className={`flex items-center gap-1 px-3 py-1 rounded ${
                currentPage === totalPages - 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="p-3 border-t bg-gray-50 text-center">
          <span className="text-sm text-gray-500">
            {startIndex + 1}-{Math.min(endIndex, records.length)} of {records.length}
          </span>
        </div>
      </div>

      {/* My Betting Records Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-center gap-2">
          <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
            <span className="text-white text-xs">📋</span>
          </div>
          <h3 className="font-semibold text-gray-800 capitalize">My {gameType} Record</h3>
        </div>
        
        {displayUserBets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <div className="divide-y">
            {displayUserBets.map((bet, index) => (
              <div key={index} className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleBetExpansion(index)}
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Period: {bet.period.slice(-6)}</span>
                      <span className={`text-sm font-semibold ${
                        bet.result === 'win' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {bet.result === 'win' ? `+₹${bet.payout || 0}` : `-₹${bet.amount}`}
                      </span>
                    </div>
                    <div className="text-sm text-gray-800 mt-1">
                      {bet.betType}: {bet.betValue} • ₹{bet.amount}
                    </div>
                  </div>
                  <div className="ml-2">
                    {expandedBet === index ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedBet === index && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bet Type:</span>
                      <span className="font-medium">{bet.betType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bet Value:</span>
                      <span className="font-medium">{bet.betValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">₹{bet.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{bet.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Result:</span>
                      <span className={`font-medium ${
                        bet.result === 'win' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {bet.result === 'win' ? 'Win' : 'Lose'}
                      </span>
                    </div>
                    {bet.result === 'win' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payout:</span>
                        <span className="font-medium text-green-500">₹{bet.payout}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="p-3 border-t bg-gray-50 text-center">
          <span className="text-sm text-gray-500">1-{displayUserBets.length} of {displayUserBets.length}</span>
        </div>
      </div>
    </div>
  );
};
