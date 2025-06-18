import { useEffect, useState } from "react";
import { getCurrentPeriod } from "@/lib/periodUtils";
import { UserBet } from "@/types/gameTypes";

interface UniversalGameEngineProps {
  gameType: string;
  duration: number;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (amount: number) => void;
  userBalance: number;
}

export function UniversalGameEngine({
  gameType,
  duration,
  onRoundComplete,
  onBalanceUpdate,
  userBalance,
}: UniversalGameEngineProps) {
  const [currentPeriod, setCurrentPeriod] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [isBettingClosed, setIsBettingClosed] = useState<boolean>(false);
  const [userBets, setUserBets] = useState<UserBet[]>([]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const seconds = now.getMinutes() * 60 + now.getSeconds();
      const totalSeconds = duration * 60;
      const remaining = totalSeconds - (seconds % totalSeconds);
      setCountdown(remaining);
      setCurrentPeriod(getCurrentPeriod(gameType, duration));

      if (remaining <= 3) {
        setIsBettingClosed(true);
      } else {
        setIsBettingClosed(false);
      }

      if (remaining === totalSeconds) {
        const winningNumber = Math.floor(Math.random() * 10);
        onRoundComplete(getCurrentPeriod(gameType, duration), winningNumber, gameType);
        settleBets(winningNumber);
        setUserBets([]);
      }
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, [gameType, duration]);

  const settleBets = (winningNumber: number) => {
    const newBets = userBets.map((bet) => {
      const isWin =
        (bet.betType === "number" && bet.betValue === winningNumber) ||
        (bet.betType === "color" && getNumberColor(winningNumber).includes(bet.betValue as string));

      if (isWin) {
        const payout = bet.betType === "number" ? bet.amount * 9 : bet.amount * 2;
        onBalanceUpdate(payout);
        return { ...bet, result: "win", payout };
      } else {
        return { ...bet, result: "lose", payout: 0 };
      }
    });
    setUserBets(newBets);
  };

  const placeBet = (
    betType: "color" | "number",
    betValue: string | number,
    amount: number
  ): boolean => {
    if (isBettingClosed || amount > userBalance) return false;

    const newBet: UserBet = {
      period: currentPeriod,
      betType,
      betValue,
      amount,
      timestamp: new Date(),
    };

    setUserBets((prev) => [...prev, newBet]);
    onBalanceUpdate(-amount);
    return true;
  };

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return {
    currentPeriod,
    timeLeft: countdown,
    isBettingClosed,
    userBets,
    formatTime,
    placeBet,
  };
}

const getNumberColor = (num: number): string[] => {
  if (num === 0) return ["violet", "red"];
  if (num === 5) return ["violet", "green"];
  return num % 2 === 0 ? ["red"] : ["green"];
};
