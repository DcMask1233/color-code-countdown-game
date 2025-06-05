
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface GameBoardProps {
  userBalance: number;
  onBalanceUpdate: (amount: number) => void;
  onGameResult: (result: any) => void;
}

export const GameBoard = ({ userBalance, onBalanceUpdate, onGameResult }: GameBoardProps) => {
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<"betting" | "countdown" | "result">("betting");
  const [lastResult, setLastResult] = useState<any>(null);
  const { toast } = useToast();

  const colors = ["red", "green", "violet"];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const getNumberColor = (num: number): string[] => {
    if (num === 0) return ["violet", "red"];
    if (num === 5) return ["violet", "green"];
    return num % 2 === 0 ? ["red"] : ["green"];
  };

  const getColorDisplay = (colors: string[]) => {
    return colors.join(" + ");
  };

  const startGame = () => {
    if (!selectedColor || selectedNumber === null || !betAmount) {
      toast({
        title: "Incomplete Selection",
        description: "Please select color, number, and bet amount",
        variant: "destructive",
      });
      return;
    }

    const bet = parseInt(betAmount);
    if (bet <= 0 || bet > userBalance) {
      toast({
        title: "Invalid Bet Amount",
        description: "Bet amount must be between 1 and your balance",
        variant: "destructive",
      });
      return;
    }

    // Deduct bet amount
    onBalanceUpdate(-bet);

    setGamePhase("countdown");
    setCountdown(10);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Game finished, generate result
      const winningNumber = Math.floor(Math.random() * 10);
      const winningColors = getNumberColor(winningNumber);
      
      let winAmount = 0;
      let colorWin = false;
      let numberWin = false;

      // Check color win
      if (winningColors.includes(selectedColor)) {
        colorWin = true;
        winAmount += parseInt(betAmount) * 2; // 2x for color win
      }

      // Check number win
      if (winningNumber === selectedNumber) {
        numberWin = true;
        winAmount += parseInt(betAmount) * 9; // 9x for number win
      }

      if (winAmount > 0) {
        onBalanceUpdate(winAmount);
      }

      const result = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        selectedColor,
        selectedNumber,
        betAmount: parseInt(betAmount),
        winningNumber,
        winningColors,
        winAmount,
        colorWin,
        numberWin,
      };

      setLastResult(result);
      onGameResult(result);
      setGamePhase("result");

      if (winAmount > 0) {
        toast({
          title: "Congratulations! 🎉",
          description: `You won ₹${winAmount}!`,
        });
      } else {
        toast({
          title: "Better luck next time!",
          description: "Try again with a new prediction",
        });
      }

      // Reset after 5 seconds
      setTimeout(() => {
        setGamePhase("betting");
        setSelectedColor("");
        setSelectedNumber(null);
        setBetAmount("10");
        setLastResult(null);
      }, 5000);
    }
  }, [countdown]);

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-white/80 text-sm">Your Balance</p>
            <p className="text-3xl font-bold text-white">₹{userBalance}</p>
          </div>
        </CardContent>
      </Card>

      {gamePhase === "betting" && (
        <>
          {/* Color Selection */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Select Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {colors.map((color) => (
                  <Button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-16 text-white font-semibold transition-all duration-300 ${
                      selectedColor === color
                        ? "ring-4 ring-white/50 scale-105"
                        : "hover:scale-105"
                    } ${
                      color === "red" 
                        ? "bg-red-500 hover:bg-red-600" 
                        : color === "green"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-violet-500 hover:bg-violet-600"
                    }`}
                  >
                    {color.toUpperCase()}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Number Selection */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Select Number</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {numbers.map((num) => {
                  const numColors = getNumberColor(num);
                  return (
                    <div key={num} className="text-center">
                      <Button
                        onClick={() => setSelectedNumber(num)}
                        className={`w-full h-12 text-white font-bold transition-all duration-300 ${
                          selectedNumber === num
                            ? "ring-4 ring-white/50 scale-105"
                            : "hover:scale-105"
                        } bg-gray-700 hover:bg-gray-600`}
                      >
                        {num}
                      </Button>
                      <p className="text-xs text-white/60 mt-1">
                        {getColorDisplay(numColors)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Bet Amount */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">Bet Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="number"
                placeholder="Enter bet amount"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                min="1"
                max={userBalance}
              />
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => setBetAmount(amount.toString())}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    disabled={amount > userBalance}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Start Game Button */}
          <Button
            onClick={startGame}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg transition-all duration-300 transform hover:scale-105"
            disabled={!selectedColor || selectedNumber === null || !betAmount}
          >
            Start Game
          </Button>
        </>
      )}

      {gamePhase === "countdown" && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-white animate-pulse">
                {countdown}
              </div>
              <p className="text-white/80">Game starting...</p>
              <div className="space-y-2">
                <Badge className="bg-white/20 text-white">
                  Color: {selectedColor?.toUpperCase()}
                </Badge>
                <Badge className="bg-white/20 text-white">
                  Number: {selectedNumber}
                </Badge>
                <Badge className="bg-white/20 text-white">
                  Bet: ₹{betAmount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {gamePhase === "result" && lastResult && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Game Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {lastResult.winningNumber}
              </div>
              <p className="text-white/80">
                Colors: {getColorDisplay(lastResult.winningColors)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Your Color:</span>
                <Badge className={lastResult.colorWin ? "bg-green-500" : "bg-red-500"}>
                  {lastResult.selectedColor} {lastResult.colorWin ? "✓" : "✗"}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/80">Your Number:</span>
                <Badge className={lastResult.numberWin ? "bg-green-500" : "bg-red-500"}>
                  {lastResult.selectedNumber} {lastResult.numberWin ? "✓" : "✗"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/80">Win Amount:</span>
                <span className="text-xl font-bold text-white">
                  ₹{lastResult.winAmount}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-white/60 text-sm">
                New game starts in a moment...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
