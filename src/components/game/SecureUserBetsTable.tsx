
import { Badge } from "@/components/ui/badge";

interface UserBet {
  id: string;
  period_id: number;
  bet_type: 'color' | 'number';
  bet_value: string;
  amount: number;
  result: 'win' | 'lose' | null;
  payout: number;
  created_at: string;
}

interface SecureUserBetsTableProps {
  userBets: UserBet[];
  gameType: string;
  title: string;
}

export const SecureUserBetsTable = ({ userBets, gameType, title }: SecureUserBetsTableProps) => {
  const getResultBadge = (bet: UserBet) => {
    if (bet.result === 'win') {
      return (
        <Badge className="bg-green-500">
          +₹{bet.payout}
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

  const getBetValueDisplay = (bet: UserBet) => {
    if (bet.bet_type === 'color') {
      return (
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full ${
              bet.bet_value === 'green' ? 'bg-green-500' :
              bet.bet_value === 'red' ? 'bg-red-500' :
              bet.bet_value === 'violet' ? 'bg-purple-500' :
              'bg-gray-500'
            }`}
          />
          <span className="capitalize">{bet.bet_value}</span>
        </div>
      );
    } else {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm">
          {bet.bet_value}
        </span>
      );
    }
  };

  if (userBets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No betting history found</p>
        <p className="text-sm mt-1">Start playing to see your betting history!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-2 font-medium text-gray-600">Bet</th>
              <th className="text-left p-2 font-medium text-gray-600">Amount</th>
              <th className="text-left p-2 font-medium text-gray-600">Result</th>
              <th className="text-left p-2 font-medium text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {userBets.slice(0, 10).map((bet) => (
              <tr key={bet.id} className="hover:bg-gray-50">
                <td className="p-2">
                  {getBetValueDisplay(bet)}
                </td>
                <td className="p-2 font-medium">₹{bet.amount}</td>
                <td className="p-2">
                  {getResultBadge(bet)}
                </td>
                <td className="p-2 text-xs text-gray-500">
                  {new Date(bet.created_at).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {userBets.length > 10 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Showing latest 10 bets out of {userBets.length} total
        </p>
      )}
    </div>
  );
};
