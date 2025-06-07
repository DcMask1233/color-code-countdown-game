
import { BetPopup } from "@/components/game/BetPopup";
import { ParityRecord } from "@/components/game/ParityRecord";
import { useState } from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface EmerdGameProps {
  timeLeft: number;
  currentPeriod: string;
  isBettingClosed: boolean;
  gameRecords: GameRecord[];
  onPlaceBet: (betType: 'single-digit', betValue: number, amount: number) => boolean;
  userBalance: number;
  formatTime: (seconds: number) => string;
}

export const EmerdGame = ({
  timeLeft,
  currentPeriod,
  isBettingClosed,
  gameRecords,
  onPlaceBet,
  userBalance,
  formatTime
}: EmerdGameProps) => {
  const [showBetPopup, setShowBetPopup] = useState(false);
  const [selectedBetValue, setSelectedBetValue] = useState<number>(0);

  const handleNumberSelect = (number: number) => {
    setSelectedBetValue(number);
    setShowBetPopup(true);
  };

  const handleConfirmBet = (amount: number) => {
    const success = onPlaceBet('single-digit', selectedBetValue, amount);
    if (success) {
      setShowBetPopup(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Period</span>
          <span className="text-sm font-semibold text-gray-800">{currentPeriod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Count Down</span>
          <span 
            className={`text-lg font-bold transition-all duration-300 ${
              isBettingClosed 
                ? 'text-black opacity-50 blur-[1px]' 
                : 'text-black'
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <button
            key={number}
            onClick={() => !isBettingClosed && handleNumberSelect(number)}
            disabled={isBettingClosed}
            className={`h-16 font-bold text-lg rounded-lg shadow-sm transition-all ${
              isBettingClosed 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {number}
          </button>
        ))}
      </div>

      <ParityRecord records={gameRecords} />

      <BetPopup
        isOpen={showBetPopup}
        onClose={() => setShowBetPopup(false)}
        selectedType={'number' as any}
        selectedValue={selectedBetValue}
        userBalance={userBalance}
        onConfirmBet={handleConfirmBet}
        disabled={isBettingClosed}
      />
    </>
  );
};
