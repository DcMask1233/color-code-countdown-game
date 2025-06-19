
import { useEffect, useState } from "react";
import { useSupabasePeriod } from "@/hooks/useSupabasePeriod";
import { UserBet } from "@/types/UserBet";
import { useUserBets } from "@/hooks/useUserBets";

export interface UniversalGameEngineProps {
  gameType: string;
  duration: number;
  gameMode: string;
  onRoundComplete: (period: string, number: number, gameType: string) => void;
  onBettingStateChange: (state: boolean) => void;
  onBalanceUpdate: (amount: number) => void;
  userBalance: number;
}

export function UniversalGameEngine({
  gameType,
  duration,
  gameMode,
  onRoundComplete,
  onBettingStateChange,
  onBalanceUpdate,
  userBalance
}: UniversalGameEngineProps) {
  const { currentPeriod, timeLeft, isLoading, error } = useSupabasePeriod(duration);
  const [isBettingClosed, setIsBettingClosed] = useState(false);
  const [lastCompletedPeriod, setLastCompletedPeriod] = useState("");
  const { userBets, addBet, updateBetResult, getBetsByGameType } = useUserBets();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const generateWinningNumber = () => Math.floor(Math.random() * 10);

  useEffect(() => {
    if (isLoading || error) return;

    const shouldCloseBetting = timeLeft <= 5;
    if (shouldCloseBetting !== isBettingClosed) {
      setIsBettingClosed(shouldCloseBetting);
      onBettingStateChange(shouldCloseBetting);
    }

    // Complete round when time is up - complete the CURRENT period that was being displayed
    if (timeLeft <= 1 && lastCompletedPeriod !== currentPeriod) {
      const winningNumber = generateWinningNumber();
      
      // Complete the current period that users were betting on
      onRoundComplete(currentPeriod, winningNumber, gameType);
      setLastCompletedPeriod(currentPeriod);

      // Update bet results for this period
      const periodBets = getBetsByGameType(gameType).filter(bet => bet.period === currentPeriod);
      periodBets.forEach(bet => {
        const isWin = calculateWin(bet, winningNumber);
        const payout = isWin ? calculatePayout(bet) : 0;
        updateBetResult(bet.period, bet.gameType, isWin ? 'win' : 'lose', payout);
        
        // Update balance with winnings
        if (isWin && payout > 0) {
          onBalanceUpdate(payout);
        }
      });
    }
  }, [timeLeft, currentPeriod, isBettingClosed, lastCompletedPeriod, onRoundComplete, onBettingStateChange, gameType, isLoading, error]);

  const calculateWin = (bet: UserBet, winningNumber: number): boolean => {
    if (bet.betType === 'number') {
      return bet.betValue === winningNumber;
    } else {
      // Color logic
      const winningColors = getNumberColors(winningNumber);
      return winningColors.includes(bet.betValue as string);
    }
  };

  const calculatePayout = (bet: UserBet): number => {
    if (bet.betType === 'number') {
      return bet.amount * 9; // 9x payout for number bets
    } else {
      return bet.amount * 2; // 2x payout for color bets
    }
  };

  const getNumberColors = (num: number): string[] => {
    if (num === 0) return ["violet", "red"];
    if (num === 5) return ["violet", "green"];
    return num % 2 === 0 ? ["red"] : ["green"];
  };

  const placeBet = (
    betType: "color" | "number",
    betValue: string | number,
    amount: number
  ): boolean => {
    if (isBettingClosed || amount > userBalance || isLoading) return false;

    const newBet: UserBet = {
      betType,
      betValue,
      amount,
      period: currentPeriod,
      timestamp: new Date(),
      gameType,
      gameMode
    };

    addBet(newBet);
    // Fix: Pass negative amount to deduct from balance
    onBalanceUpdate(-amount);
    return true;
  };

  // Show loading or error states
  if (isLoading) {
    return {
      timeLeft: 0,
      currentPeriod: "Loading...",
      isBettingClosed: true,
      userBets: getBetsByGameType(gameType),
      formatTime,
      placeBet: () => false
    };
  }

  if (error) {
    console.error('Period fetch error:', error);
    // Fallback to prevent app crash
    return {
      timeLeft: 0,
      currentPeriod: "Error",
      isBettingClosed: true,
      userBets: getBetsByGameType(gameType),
      formatTime,
      placeBet: () => false
    };
  }

  return {
    timeLeft,
    currentPeriod,
    isBettingClosed,
    userBets: getBetsByGameType(gameType),
    formatTime,
    placeBet
  };
}
