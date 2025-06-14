
import { useState, useEffect, useRef } from "react";

interface UserBet {
  period: string;
  betType: 'color' | 'number';
  betValue: string | number;
  amount: number;
  result?: 'win' | 'lose';
  payout?: number;
  timestamp: Date;
}

interface GameEngineState {
  timeLeft: number;
  currentPeriod: string;
  isBettingClosed: boolean;
  userBets: UserBet[];
  formatTime: (seconds: number) => string;
  placeBet: (betType: 'color' | 'number', betValue: string | number, amount: number) => boolean;
}

interface Props {
  gameType: string;
  duration: number;
  gameMode: string;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBettingStateChange: () => void;
  onBalanceUpdate: (amount: number) => void;
  userBalance: number;
}

const UniversalGameEngine = ({ 
  gameType, 
  duration, 
  gameMode,
  onRoundComplete, 
  onBettingStateChange,
  onBalanceUpdate,
  userBalance 
}: Props): GameEngineState => {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [isBettingClosed, setIsBettingClosed] = useState<boolean>(false);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate period in YYYYMMDDRRR format
  const generatePeriod = (): string => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
    
    const yyyy = istTime.getFullYear();
    const mm = String(istTime.getMonth() + 1).padStart(2, "0");
    const dd = String(istTime.getDate()).padStart(2, "0");

    // Calculate rounds since start of day in IST
    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
    const durationInSeconds = duration;
    const roundNumber = Math.floor(secondsSinceStart / durationInSeconds) + 1;

    return `${yyyy}${mm}${dd}${String(roundNumber).padStart(3, "0")}`;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const placeBet = (betType: 'color' | 'number', betValue: string | number, amount: number): boolean => {
    if (isBettingClosed || amount > userBalance) {
      return false;
    }

    const newBet: UserBet = {
      period: currentPeriod,
      betType,
      betValue,
      amount,
      timestamp: new Date()
    };

    setUserBets(prev => [...prev, newBet]);
    onBalanceUpdate(-amount); // Deduct bet amount
    return true;
  };

  const generateWinningNumber = (): number => {
    return Math.floor(Math.random() * 10); // 0-9
  };

  useEffect(() => {
    const updateGame = () => {
      const now = new Date();
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      
      const startOfDay = new Date(istTime);
      startOfDay.setHours(0, 0, 0, 0);
      const secondsSinceStart = Math.floor((istTime.getTime() - startOfDay.getTime()) / 1000);
      const secondsInCurrentRound = secondsSinceStart % duration;
      const remaining = duration - secondsInCurrentRound;
      
      const newPeriod = generatePeriod();
      setCurrentPeriod(newPeriod);
      setTimeLeft(remaining);
      
      // Close betting in last 10 seconds
      setIsBettingClosed(remaining <= 10);
      
      // When countdown reaches 0, generate new result
      if (remaining === duration) {
        const winningNumber = generateWinningNumber();
        onRoundComplete(newPeriod, winningNumber, gameType);
      }
    };

    // Initial setup
    updateGame();

    // Set up interval
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(updateGame, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameType, duration, onRoundComplete]);

  return {
    timeLeft,
    currentPeriod,
    isBettingClosed,
    userBets,
    formatTime,
    placeBet
  };
};

export default UniversalGameEngine;
