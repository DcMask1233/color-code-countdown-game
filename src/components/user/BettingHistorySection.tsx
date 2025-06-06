
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BettingHistorySectionProps {
  gameRecords: any[];
}

export const BettingHistorySection = ({ gameRecords }: BettingHistorySectionProps) => {
  // Mock betting history data since we need to track actual bets
  const bettingHistory = [
    {
      id: 1,
      gameType: "WinGo 1min",
      period: "20240106001",
      betType: "Color",
      betValue: "Green",
      betAmount: 100,
      result: "Win",
      winAmount: 200,
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      gameType: "WinGo 1min", 
      period: "20240106002",
      betType: "Number",
      betValue: "5",
      betAmount: 50,
      result: "Loss",
      winAmount: 0,
      timestamp: new Date(Date.now() - 300000).toISOString()
    }
  ];

  if (bettingHistory.length === 0) {
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
      {bettingHistory.map((bet) => (
        <Card key={bet.id} className="border border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium">{bet.gameType}</CardTitle>
              <Badge className={bet.result === 'Win' ? "bg-green-500" : "bg-red-500"}>
                {bet.result === 'Win' ? `+₹${bet.winAmount}` : `-₹${bet.betAmount}`}
              </Badge>
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
                <p className="font-medium">{bet.betType} - {bet.betValue}</p>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <p className="font-medium">₹{bet.betAmount}</p>
              </div>
              <div>
                <span className="text-gray-500">Time:</span>
                <p className="font-medium">{new Date(bet.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
