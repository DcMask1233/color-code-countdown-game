
import React, { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "./PaginationControls";
import { UserBet } from "@/types/UserBet";

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

  // Filter bets by game type with better matching
  const filteredBets = useMemo(() => {
    console.log('🔍 Filtering bets for gameType:', gameType);
    console.log('📊 All user bets:', userBets);
    
    const filtered = userBets
      .filter(bet => {
        // Normalize game types for comparison (lowercase)
        const betGameType = bet.gameType?.toLowerCase();
        const filterGameType = gameType.toLowerCase();
        
        console.log(`🎯 Comparing bet gameType: "${betGameType}" with filter: "${filterGameType}"`);
        
        return betGameType === filterGameType;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    console.log(`✅ Filtered bets for ${gameType}:`, filtered);
    return filtered;
  }, [userBets, gameType]);

  const totalPages = Math.ceil(filteredBets.length / RECORDS_PER_PAGE);
  const startIndex = currentPage * RECORDS_PER_PAGE;
  const endIndex = Math.min(startIndex + RECORDS_PER_PAGE, filteredBets.length);
  const currentBets = filteredBets.slice(startIndex, endIndex);

  const formatPeriod = (period: string) => {
    console.log('🕐 Formatting period:', period);
    
    if (!period) return '';
    
    // Handle different period formats
    // Expected format: YYYYMMDDRRRR where RRRR is the round number
    if (period.length >= 11) {
      const year = period.substring(0, 4);
      const month = period.substring(4, 6);
      const day = period.substring(6, 8);
      const round = period.substring(8);
      const formatted = `${day}/${month}/${year}-${round}`;
      console.log(`📅 Formatted period from ${period} to ${formatted}`);
      return formatted;
    } else if (period.length >= 8) {
      // Fallback for shorter periods
      const year = period.substring(0, 4);
      const month = period.substring(4, 6);
      const day = period.substring(6, 8);
      const round = period.substring(8) || '001';
      const formatted = `${day}/${month}/${year}-${round}`;
      console.log(`📅 Formatted short period from ${period} to ${formatted}`);
      return formatted;
    }
    
    console.log(`⚠️ Unable to format period: ${period}`);
    return period;
  };

  const getResultDisplay = (betValue: string | number, betType: 'color' | 'number') => {
    if (betType === 'number') {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold">
          {betValue}
        </span>
      );
    } else {
      const color = betValue as string;
      return (
        <div
          className={`w-6 h-6 rounded-full ${
            color === 'green' ? 'bg-green-500' :
            color === 'red' ? 'bg-red-500' :
            color === 'violet' ? 'bg-purple-500' :
            'bg-gray-500'
          }`}
        />
      );
    }
  };

  const getResultBadge = (bet: UserBet) => {
    console.log('🏷️ Getting result badge for bet:', bet);
    
    if (bet.result === 'win') {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Win (+₹{bet.payout || (bet.amount * 2)})
        </Badge>
      );
    } else if (bet.result === 'lose') {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white">
          Loss (-₹{bet.amount})
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
          Pending
        </Badge>
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
        <p className="text-gray-500">No betting history found for {gameType}.</p>
        <p className="text-sm text-gray-400 mt-2">
          Total bets in system: {userBets.length}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">
          {filteredBets.length} bet{filteredBets.length !== 1 ? 's' : ''} found
        </span>
      </div>
      
      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700">Period</TableHead>
              <TableHead className="font-semibold text-gray-700">Bet</TableHead>
              <TableHead className="font-semibold text-gray-700">Amount</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBets.map((bet, index) => (
              <TableRow key={`${bet.period}-${index}`} className="hover:bg-gray-50">
                <TableCell className="font-medium">{formatPeriod(bet.period)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getResultDisplay(bet.betValue, bet.betType)}
                    <span className="text-sm text-gray-600">
                      {bet.betType === 'color' ? 
                        `${bet.betValue}`.charAt(0).toUpperCase() + `${bet.betValue}`.slice(1) : 
                        `Number ${bet.betValue}`
                      }
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">₹{bet.amount}</TableCell>
                <TableCell>{getResultBadge(bet)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
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
      )}
    </div>
  );
};
