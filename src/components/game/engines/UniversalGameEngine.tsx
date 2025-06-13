
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
  gameType: string;
  duration: number;
}

interface ActiveBet {
  gameInstance: string;
  period: string;
  betType: 'color' | 'number';
  betValue: string | number;
  amount: number;
  netAmount: number;
}

interface UserBet {
  period: string;
  betType: 'color' | 'number';
  betValue: string | number;
  amount: number;
  result?: 'win' | 'lose';
  payout?: number;
  timestamp: Date;
  gameInstance: string;
}

interface UniversalGameEngineProps {
  gameName: string;
  duration: number;
  gameMode: string;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBettingStateChange: (isClosed: boolean) => void;
  onBalanceUpdate: (amount: number) => void;
  userBalance: number;
}

export const UniversalGameEngine = ({
  gameName,
  duration,
  gameMode,
  onRoundComplete,
  onBettingStateChange,
  onBalanceUpdate,
  userBalance
}: UniversalGameEngineProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [activeBets, setActiveBets] = useState<ActiveBet[]>([]);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const { toast } = useToast();

  const gameInstance = `${duration === 60 ? '1min' : duration === 180 ? '3min' : '5min'}-${gameName.toLowerCase()}`;

  const generatePeriod = () => {
    // Get current IST time (UTC + 5:30)
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Format date as YYYYMMDD
    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const day = String(istTime.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    
    // Calculate seconds since start of IST day (12:00 AM IST)
    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    const secondsSinceStartOfDay = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
    
    // Calculate round number based on duration
    const roundNumber = Math.floor(secondsSinceStartOfDay / duration) + 1;
    
    // Format as YYYYMMDDRRR
    return `${dateStr}${String(roundNumber).padStart(3, '0')}`;
  };

  const generateWinningNumber = () => {
    return Math.floor(Math.random() * 10);
  };

  const getNumberColor = (num: number): string[] => {
    if (num === 0) return ["violet", "red"];
    if (num === 5) return ["violet", "green"];
    return num % 2 === 0 ? ["red"] : ["green"];
  };

  const calculatePayout = (bet: ActiveBet, winningNumber: number): number => {
    if (bet.betType === 'color') {
      const winningColors = getNumberColor(winningNumber);
      const betColor = bet.betValue as string;
      
      if (winningColors.includes(betColor)) {
        if (betColor === 'violet') {
          return bet.netAmount * 4.5;
        } else {
          if (winningNumber === 5 && (betColor === 'green' || betColor === 'red')) {
            return bet.netAmount * 1.5;
          }
          return bet.netAmount * 2;
        }
      }
    } else if (bet.betType === 'number') {
      if (winningNumber === bet.betValue) {
        return bet.netAmount * 9;
      }
    }
    
    return 0;
  };

  const processBets = (winningNumber: number, period: string) => {
    const periodBets = activeBets.filter(bet => 
      bet.period === period && bet.gameInstance === gameInstance
    );
    let totalWinnings = 0;

    // Process each bet and update user bet history
    periodBets.forEach(bet => {
      const payout = calculatePayout(bet, winningNumber);
      const result = payout > 0 ? 'win' : 'lose';
      
      // Add to user bet history
      const userBet: UserBet = {
        period: bet.period,
        betType: bet.betType,
        betValue: bet.betValue,
        amount: bet.amount,
        result,
        payout: result === 'win' ? payout : 0,
        timestamp: new Date(),
        gameInstance: bet.gameInstance
      };
      
      setUserBets(prev => [userBet, ...prev].slice(0, 50)); // Keep last 50 bets
      
      if (payout > 0) {
        totalWinnings += payout;
        toast({
          title: "🎉 You Won!",
          description: `Won ₹${payout} on ${bet.betType}: ${bet.betValue}`,
        });
      }
    });

    if (totalWinnings > 0) {
      onBalanceUpdate(totalWinnings);
    }

    setActiveBets(prev => prev.filter(bet => 
      !(bet.period === period && bet.gameInstance === gameInstance)
    ));
  };

  const placeBet = (betType: 'color' | 'number', betValue: string | number, amount: number) => {
    if (isBettingClosed) {
      toast({
        title: "Betting Closed",
        description: "Please wait for the next round to place bets.",
        variant: "destructive"
      });
      return false;
    }

    if (amount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this bet.",
        variant: "destructive"
      });
      return false;
    }

    const netAmount = amount - 2;
    if (netAmount <= 0) {
      toast({
        title: "Invalid Bet Amount",
        description: "Minimum bet amount is ₹3 (₹2 service fee + ₹1 bet).",
        variant: "destructive"
      });
      return false;
    }

    const newBet: ActiveBet = {
      gameInstance,
      period: currentPeriod,
      betType,
      betValue,
      amount,
      netAmount
    };

    setActiveBets(prev => [...prev, newBet]);
    onBalanceUpdate(-amount);
    
    toast({
      title: "Bet Placed!",
      description: `₹${amount} bet placed (₹${netAmount} after fee) on ${betType}: ${betValue}`,
    });

    return true;
  };

  const getBettingCloseTime = () => {
    return duration === 60 ? 10 : 30;
  };

  useEffect(() => {
    setCurrentPeriod(generatePeriod());
    
    const timer = setInterval(() => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      // Calculate seconds since start of IST day
      const startOfDay = new Date(istTime);
      startOfDay.setHours(0, 0, 0, 0);
      const secondsSinceStartOfDay = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
      
      const secondsInCurrentRound = secondsSinceStartOfDay % duration;
      const remaining = duration - secondsInCurrentRound;
      
      setTimeLeft(remaining);
      
      const bettingCloseTime = getBettingCloseTime();
      const shouldCloseBetting = remaining <= bettingCloseTime;
      if (shouldCloseBetting !== isBettingClosed) {
        setIsBettingClosed(shouldCloseBetting);
        onBettingStateChange(shouldCloseBetting);
      }
      
      if (remaining === duration) {
        const newPeriod = generatePeriod();
        const winningNumber = generateWinningNumber();
        
        processBets(winningNumber, currentPeriod);
        
        setCurrentPeriod(newPeriod);
        onRoundComplete(newPeriod, winningNumber, `${gameInstance}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, gameInstance, currentPeriod, isBettingClosed, activeBets, onRoundComplete, onBettingStateChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getGameUserBets = () => {
    return userBets.filter(bet => bet.gameInstance === gameInstance);
  };

  return {
    timeLeft,
    currentPeriod,
    isBettingClosed,
    activeBets: activeBets.filter(bet => bet.gameInstance === gameInstance),
    userBets: getGameUserBets(),
    placeBet,
    formatTime,
    gameInstance
  };
};
