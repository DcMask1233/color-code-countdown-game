
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
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

  const getColorDot = (colors: string[]) => {
    if (colors.length === 1) {
      return (
        <div 
          className={`w-4 h-4 rounded-full ${
            colors[0] === 'green' ? 'bg-green-500' : 
            colors[0] === 'red' ? 'bg-red-500' : 'bg-violet-500'
          }`}
        />
      );
    }
    
    return (
      <div className="flex gap-1">
        {colors.map((color, index) => (
          <div 
            key={index}
            className={`w-3 h-3 rounded-full ${
              color === 'green' ? 'bg-green-500' : 
              color === 'red' ? 'bg-red-500' : 'bg-violet-500'
            }`}
          />
        ))}
      </div>
    );
  };

  const generatePrice = (period: string) => {
    // Generate a consistent price based on period
    const hash = period.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 50000) + 10000;
  };

  const toggleBetExpansion = (index: number) => {
    setExpandedBet(expandedBet === index ? null : index);
  };

  // Show only the latest 10 records
  const displayRecords = records.slice(0, 10);
  const displayUserBets = userBets.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Past 10 Records Section */}
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
                <TableHead className="text-center text-xs font-medium text-gray-500 uppercase">Price</TableHead>
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
                  <TableCell className="text-center text-sm text-gray-900 py-3">
                    {record.price || generatePrice(record.period)}
                  </TableCell>
                  <TableCell className="text-center text-sm py-3">
                    <span className={`font-semibold ${
                      record.number % 2 === 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {record.number}
                    </span>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <div className="flex justify-center">
                      {getColorDot(record.color)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-3 border-t bg-gray-50 text-center">
          <span className="text-sm text-gray-500">1-10 of {displayRecords.length}</span>
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
