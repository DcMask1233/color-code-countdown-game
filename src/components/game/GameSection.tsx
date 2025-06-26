import React from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface GameSectionProps {
  activeGameTab: string;
  onGameTabChange: (tab: string) => void;
  onRoundComplete: (newPeriod: string, winningNumber: number) => void;
  onBettingStateChange: (isClosed: boolean) => void;
  onColorSelect: (color: string) => void;
  onNumberSelect: (number: number) => void;
  isBettingClosed: boolean;
  gameRecords: GameRecord[];
  gameMode: string;
}

export const GameSection = ({
  activeGameTab,
  onGameTabChange,
  onRoundComplete,
  onBettingStateChange,
  onColorSelect,
  onNumberSelect,
  isBettingClosed,
  gameRecords,
  gameMode,
}: GameSectionProps) => {
  const colors = ["red", "green", "blue"];
  const numbers = Array.from({ length: 10 }, (_, i) => i);

  const simulateResult = () => {
    const winningNumber = Math.floor(Math.random() * 10);
    const winningColor = ["red", "green", "blue"][winningNumber % 3];

    const newRecord: GameRecord = {
      period: Date.now().toString(),
      number: winningNumber,
      color: [winningColor],
    };

    onRoundComplete(newRecord.period, newRecord.number);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Game Mode: {gameMode}</h2>

      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Select Color:</h3>
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color}
              className={`px-4 py-2 rounded text-white bg-${color}-500`}
              onClick={() => onColorSelect(color)}
              disabled={isBettingClosed}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Select Number:</h3>
        <div className="flex gap-2 flex-wrap">
          {numbers.map((num) => (
            <button
              key={num}
              className="px-3 py-1 rounded border"
              onClick={() => onNumberSelect(num)}
              disabled={isBettingClosed}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={simulateResult}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Simulate Round Complete
        </button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Game History:</h3>
        <ul className="text-sm mt-2">
          {gameRecords.map((record, idx) => (
            <li key={idx}>
              Period: {record.period} — Number: {record.number} — Color: {record.color.join(", ")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
