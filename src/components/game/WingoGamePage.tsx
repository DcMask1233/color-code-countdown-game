import React, { useState } from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

type GameMode = "Wingo1min" | "Wingo3min" | "Wingo5min";

interface WingoGamePageProps {
  gameType: string;
  gameMode: GameMode;
  userBalance: number;
  currentPeriod: string;
  timeLeft: number; // in seconds
  gameRecords: GameRecord[];
  onBackToHome: () => void;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (newBalance: number) => void;
  onGameRecordsUpdate: (updatedRecords: GameRecord[]) => void;
}

export default function WingoGamePage({
  gameType,
  gameMode,
  userBalance,
  currentPeriod,
  timeLeft,
  gameRecords,
  onBackToHome,
  onRoundComplete,
  onBalanceUpdate,
  onGameRecordsUpdate,
}: WingoGamePageProps) {
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  const handleBet = async () => {
    if (timeLeft <= 5) {
      alert("Betting is closed for this round.");
      return;
    }
    setIsPlacingBet(true);
    try {
      const response = await fetch("/api/placeBet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameType,
          gameMode,
          period: currentPeriod,
          betType: "color",
          betValue: "red",
          amount: 100,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        alert("Bet failed: " + (data.message || "Unknown error"));
      } else {
        alert("Bet placed successfully!");
        onBalanceUpdate(data.newBalance);
        onGameRecordsUpdate(data.updatedGameRecords);
        if (data.winningNumber !== undefined) {
          onRoundComplete(currentPeriod, data.winningNumber, gameType);
        }
      }
    } catch (error) {
      alert("Error placing bet: " + error.message);
    } finally {
      setIsPlacingBet(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <button onClick={onBackToHome} className="text-blue-600 underline mb-4">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">
        {gameType} - {gameMode}
      </h1>

      <p>
        <strong>Balance:</strong> ₹{userBalance}
      </p>
      <p>
        <strong>Current Period:</strong> {currentPeriod}
      </p>
      <p>
        <strong>Time Left:</strong> {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
      </p>

      <button
        onClick={handleBet}
        disabled={timeLeft <= 5 || isPlacingBet}
        className="mt-4 p-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isPlacingBet ? "Placing Bet..." : "Place Bet"}
      </button>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Your Bets:</h2>
        {gameRecords.length === 0 ? (
          <p>No bets placed yet.</p>
        ) : (
          <ul>
            {gameRecords.map((record, idx) => (
              <li key={idx}>
                Period: {record.period}, Number: {record.number}, Color:{" "}
                {record.color.join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
