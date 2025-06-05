
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GameHistoryProps {
  history: any[];
}

export const GameHistory = ({ history }: GameHistoryProps) => {
  const getNumberColor = (num: number): string[] => {
    if (num === 0) return ["violet", "red"];
    if (num === 5) return ["violet", "green"];
    return num % 2 === 0 ? ["red"] : ["green"];
  };

  const getColorDisplay = (colors: string[]) => {
    return colors.join(" + ");
  };

  if (history.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="pt-6">
          <div className="text-center text-white/60">
            <p>No games played yet</p>
            <p className="text-sm mt-2">Start playing to see your history!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white text-center mb-4">Game History</h2>
      
      {history.map((game) => (
        <Card key={game.id} className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white text-sm">
                {new Date(game.timestamp).toLocaleString()}
              </CardTitle>
              <Badge className={game.winAmount > 0 ? "bg-green-500" : "bg-red-500"}>
                {game.winAmount > 0 ? `+₹${game.winAmount}` : `-₹${game.betAmount}`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Game Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/60">Your Prediction</p>
                <p className="text-white font-semibold">
                  {game.selectedColor.toUpperCase()} • {game.selectedNumber}
                </p>
              </div>
              <div>
                <p className="text-white/60">Winning Result</p>
                <p className="text-white font-semibold">
                  {getColorDisplay(game.winningColors)} • {game.winningNumber}
                </p>
              </div>
            </div>

            {/* Win/Loss Details */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80">Color Match:</span>
                <Badge className={game.colorWin ? "bg-green-500" : "bg-red-500"}>
                  {game.colorWin ? "Won" : "Lost"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80">Number Match:</span>
                <Badge className={game.numberWin ? "bg-green-500" : "bg-red-500"}>
                  {game.numberWin ? "Won" : "Lost"}
                </Badge>
              </div>

              <div className="flex justify-between items-center text-sm pt-2 border-t border-white/20">
                <span className="text-white/80">Bet Amount:</span>
                <span className="text-white font-semibold">₹{game.betAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
