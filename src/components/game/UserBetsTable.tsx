
import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "./PaginationControls";

interface UserBet {
  period: string;
  betType: 'color' | 'number';
  betValue: string | number;
  amount: number;
  result?: 'win' | 'lose';
  payout?: number;
  timestamp: Date;
}

interface UserBetsTableProps {
  userBets: UserBet[];
  gameType: string;
  title: string;
}

export const UserBetsTable: React.FC<UserBetsTableProps> = ({
  userBets,
  gameType,
  title
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const RECORDS_PER_PAGE = 10;

  // Filter bets by game type (this would need to be enhanced based on how you track game types in bets)
  const filteredBets = useMemo(() => {
    // For now, showing all user bets - you might want to add game type filtering
    return userBets.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [userBets]);

  const totalPages = Math.ceil(filteredBets.length / RECORDS_PER_PAGE);
  const startIndex = currentPage * RECORDS_PER_PAGE;
  const endIndex = Math.min(startIndex + RECORDS_PER_PAGE, filteredBets.length);
  const currentBets = filteredBets.slice(startIndex, endIndex);

  const getResultBadge = (betValue: string | number, betType: 'color' | 'number') => {
    if (betType === 'color') {
      const color = betValue as string;
      return (
        <Badge
          className={`text-white text-xs px-2 py-1 ${
            color === 'green' ? 'bg-green-500' :
            color === 'red' ? 'bg-red-500' :
            color === 'violet' ? 'bg-purple-500' :
            'bg-gray-500'
          }`}
        >
          {color}
        </Badge>
      );
    } else {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold">
          {betValue}
        </span>
      );
    }
  };

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

  if (filteredBets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Period</TableHead>
              <TableHead className="font-semibold text-gray-700">Bet</TableHead>
              <TableHead className="font-semibold text-gray-700">Amount</TableHead>
              <TableHead className="font-semibold text-gray-700">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBets.map((bet, index) => (
              <TableRow key={`${bet.period}-${index}`} className="hover:bg-gray-50">
                <TableCell className="font-medium">{bet.period}</TableCell>
                <TableCell>{getResultBadge(bet.betValue, bet.betType)}</TableCell>
                <TableCell>
                  <span className="text-gray-700">₹{bet.amount}</span>
                </TableCell>
                <TableCell>
                  {bet.result ? (
                    <Badge
                      className={`text-white text-xs px-2 py-1 ${
                        bet.result === 'win' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {bet.result}
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-400 text-white text-xs px-2 py-1">
                      pending
                    </Badge>
                  )}
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
        totalItems={filteredBets.length}
        onNextPage={nextPage}
        onPrevPage={prevPage}
      />
    </div>
  );
};
