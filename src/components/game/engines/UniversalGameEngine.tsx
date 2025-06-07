
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
  gameType: string;
  duration: number;
  period: string;
  betType: 'color' | 'number' | 'even-odd' | 'big-small' | 'single-digit';
  betValue: string | number;
  amount: number;
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
  const { toast } = useToast();

  const generatePeriod = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    
    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const day = String(istTime.getDate()).padStart(2, '0');
    
    const totalSeconds = istTime.getHours() * 3600 + istTime.getMinutes() * 60 + istTime.getSeconds();
    const roundNumber = String(Math.floor(totalSeconds / duration) % 1000).padStart(3, '0');
    
    return `${year}${month}${day}${gameName}${duration}${roundNumber}`;
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
    let multiplier = 0;

    switch (bet.gameType) {
      case 'parity':
        if (bet.betType === 'color') {
          const winningColors = getNumberColor(winningNumber);
          if (winningColors.includes(bet.betValue as string)) {
            multiplier = bet.betValue === 'violet' ? 4.5 : 2;
          }
        } else if (bet.betType === 'number') {
          if (winningNumber === bet.betValue) {
            multiplier = 9;
          }
        }
        break;

      case 'sapre':
        if (bet.betType === 'even-odd') {
          const isEven = winningNumber % 2 === 0;
          const prediction = bet.betValue as string;
          if ((prediction === 'even' && isEven) || (prediction === 'odd' && !isEven)) {
            multiplier = 1.98;
          }
        }
        break;

      case 'bcone':
        if (bet.betType === 'big-small') {
          const isBig = winningNumber >= 5;
          const prediction = bet.betValue as string;
          if ((prediction === 'big' && isBig) || (prediction === 'small' && !isBig)) {
            multiplier = 1.98;
          }
        }
        break;

      case 'emerd':
        if (bet.betType === 'single-digit') {
          if (winningNumber === bet.betValue) {
            multiplier = 9;
          }
        }
        break;
    }

    return bet.amount * multiplier;
  };

  const processBets = (winningNumber: number, period: string) => {
    const periodBets = activeBets.filter(bet => bet.period === period);
    let totalWinnings = 0;

    periodBets.forEach(bet => {
      const payout = calculatePayout(bet, winningNumber);
      if (payout > 0) {
        totalWinnings += payout;
        toast({
          title: "🎉 You Won!",
          description: `Won ₹${payout} on ${bet.gameType} ${bet.betType}: ${bet.betValue}`,
        });
      }
    });

    if (totalWinnings > 0) {
      onBalanceUpdate(totalWinnings);
    }

    // Remove processed bets
    setActiveBets(prev => prev.filter(bet => bet.period !== period));
  };

  const placeBet = (betType: ActiveBet['betType'], betValue: string | number, amount: number) => {
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

    const newBet: ActiveBet = {
      gameType: gameName.toLowerCase(),
      duration,
      period: currentPeriod,
      betType,
      betValue,
      amount
    };

    setActiveBets(prev => [...prev, newBet]);
    onBalanceUpdate(-amount);
    
    toast({
      title: "Bet Placed!",
      description: `₹${amount} bet placed on ${betType}: ${betValue}`,
    });

    return true;
  };

  useEffect(() => {
    setCurrentPeriod(generatePeriod());
    
    const timer = setInterval(() => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const totalSeconds = istTime.getHours() * 3600 + istTime.getMinutes() * 60 + istTime.getSeconds();
      const secondsInCurrentRound = totalSeconds % duration;
      const remaining = duration - secondsInCurrentRound;
      
      setTimeLeft(remaining);
      
      const shouldCloseBetting = remaining <= 10;
      if (shouldCloseBetting !== isBettingClosed) {
        setIsBettingClosed(shouldCloseBetting);
        onBettingStateChange(shouldCloseBetting);
      }
      
      if (remaining === duration) {
        const newPeriod = generatePeriod();
        const winningNumber = generateWinningNumber();
        
        // Process bets before updating period
        processBets(winningNumber, currentPeriod);
        
        setCurrentPeriod(newPeriod);
        onRoundComplete(newPeriod, winningNumber, gameName.toLowerCase());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [duration, gameName, currentPeriod, isBettingClosed, activeBets, onRoundComplete, onBettingStateChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    currentPeriod,
    isBettingClosed,
    activeBets,
    placeBet,
    formatTime
  };
};
