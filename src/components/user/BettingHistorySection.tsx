
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserBets } from "@/hooks/useUserBets";

interface BettingHistorySectionProps {
  gameRecords: any[];
}

export const BettingHistorySection = ({ gameRecords }: BettingHistorySectionProps) => {
  const { userBets } = useUserBets();

  // Sort bets by timestamp (newest first)
  const sortedBets = [...userBets].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getGameDisplayName = (gameType: string, gameMode?: string) => {
    const baseName = gameType.charAt(0).toUpperCase() + gameType.slice(1);
    if (gameMode) {
      const duration = gameMode.split('-')[1];
      return `${baseName} ${duration}`;
    }
    return baseName;
  };

  const getResultBadge = (bet: any) => {
    if (bet.result === 'win') {
      return (
        <Badge className="bg-green-500">
          +₹{bet.payout || (bet.amount * 2)}
        </Badge>
      );
    } else if (bet.result === 'lose') {
      return (
        <Badge className="bg-red-500">
          -₹{bet.amount}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-500">
          Pending
        </Badge>
      );
    }
  };

  const getBetValueDisplay = (bet: any) => {
    if (bet.betType === 'color') {
      return (
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full ${
              bet.betValue === 'green' ? 'bg-green-500' :
              bet.betValue === 'red' ? 'bg-red-500' :
              bet.betValue === 'violet' ? 'bg-purple-500' :
              'bg-gray-500'
            }`}
          />
          <span className="capitalize">{bet.betValue}</span>
        </div>
      );
    } else {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
          {bet.betValue}
        </span>
      );
    }
  };

  if (sortedBets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No betting history found</p>
        <p className="text-sm mt-1">Start playing to see your betting history!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-800 mb-4">Betting History</h3>
      {sortedBets.slice(0, 10).map((bet, index) => (
        <Card key={`${bet.period}-${index}`} className="border border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">
                {getGameDisplayName(bet.gameType, bet.gameMode)}
              </CardTitle>
              {getResultBadge(bet)}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Period:</span>
                <p className="font-medium">{bet.period}</p>
              </div>
              <div>
                <span className="text-gray-500">Bet:</span>
                <div className="font-medium">
                  {getBetValueDisplay(bet)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <p className="font-medium">₹{bet.amount}</p>
              </div>
              <div>
                <span className="text-gray-500">Time:</span>
                <p className="font-medium">{new Date(bet.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {sortedBets.length > 10 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Showing latest 10 bets out of {sortedBets.length} total
        </p>
      )}
    </div>
  );
};
