import React from "react";
import { useSupabasePeriod } from "@/hooks/useSupabasePeriod";
import { useGameEngine } from "@/hooks/useGameEngine";

import { getNumberColor } from "@/lib/gameUtils";

type GameType = string;
type GameMode = "Wingo1min" | "Wingo3min" | "Wingo5min";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface WingoGamePageProps {
  gameType: GameType;
  gameMode: GameMode;
  userId: string;
  userBalance: number;
  onBackToHome: () => void;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (amount: number) => void;
  onGameRecordsUpdate: (records: GameRecord[]) => void;
}

const durationMap: Record<GameMode, number> = {
  Wingo1min: 60,
  Wingo3min: 180,
  Wingo5min: 300,
};

export default function WingoGamePage({
  gameType,
  gameMode,
  userId,
  userBalance,
  onBackToHome,
  onRoundComplete,
  onBalanceUpdate,
  onGameRecordsUpdate,
}: WingoGamePageProps) {
  const { currentPeriod, timeLeft, isLoading, error } = useSupabasePeriod(durationMap[gameMode]);
  const { userBets, placeBet } = useGameEngine(gameType, gameMode, userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleBet = async () => {
    if (!currentPeriod) {
      alert("Period not available, try again.");
      return;
    }

    const betAmount = 100;

    if (userBalance < betAmount) {
      alert("Insufficient balance");
      return;
    }

    const success = await placeBet("color", "red", betAmount, currentPeriod);
    if (!success) {
      alert("Failed to place bet");
    } else {
      alert("Bet placed! Waiting for result...");
      onBalanceUpdate(-betAmount);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <button onClick={onBackToHome} className="text-blue-600 underline mb-4">← Back</button>

      <h1 className="text-2xl font-bold mb-4">{gameType} - {gameMode}</h1>
      <p><strong>Balance:</strong> ₹{userBalance}</p>
      <p>Current Period: {currentPeriod}</p>
      <p>Time Left: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</p>

      <button
        onClick={handleBet}
        disabled={timeLeft <= 5}
        className="mt-4 p-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        Place Bet
      </button>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Your Bets:</h2>
        {userBets.length === 0 ? (
          <p>No bets placed yet.</p>
        ) : (
          <ul>
            {userBets.map((bet, idx) => (
              <li key={idx}>
                Period: {bet.period}, Type: {bet.betType}, Value: {bet.betValue}, Amount: {bet.amount}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
