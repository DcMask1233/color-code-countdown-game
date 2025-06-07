
import { BetPopup } from "@/components/game/BetPopup";
import { ParityRecord } from "@/components/game/ParityRecord";
import { useState } from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface BconeGameProps {
  timeLeft: number;
  currentPeriod: string;
  isBettingClosed: boolean;
  gameRecords: GameRecord[];
  onPlaceBet: (betType: 'big-small', betValue: string, amount: number) => boolean;
  userBalance: number;
  formatTime: (seconds: number) => string;
}

export const BconeGame = ({
  timeLeft,
  currentPeriod,
  isBettingClosed,
  gameRecords,
  onPlaceBet,
  userBalance,
  formatTime
}: BconeGameProps) => {
  const [showBetPopup, setShowBetPopup] = useState(false);
  const [selectedBetValue, setSelectedBetValue] = useState<string>('');

  const handleBigSmallSelect = (type: string) => {
    setSelectedBetValue(type);
    setShowBetPopup(true);
  };

  const handleConfirmBet = (amount: number) => {
    const success = onPlaceBet('big-small', selectedBetValue, amount);
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

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => !isBettingClosed && handleBigSmallSelect('small')}
          disabled={isBettingClosed}
          className={`font-semibold py-8 rounded-lg shadow-sm transition-all ${
            isBettingClosed 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          Small (0-4)
        </button>
        <button
          onClick={() => !isBettingClosed && handleBigSmallSelect('big')}
          disabled={isBettingClosed}
          className={`font-semibold py-8 rounded-lg shadow-sm transition-all ${
            isBettingClosed 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
              : 'bg-teal-500 hover:bg-teal-600 text-white'
          }`}
        >
          Big (5-9)
        </button>
      </div>

      <ParityRecord records={gameRecords} />

      <BetPopup
        isOpen={showBetPopup}
        onClose={() => setShowBetPopup(false)}
        selectedType={'color' as any}
        selectedValue={selectedBetValue}
        userBalance={userBalance}
        onConfirmBet={handleConfirmBet}
        disabled={isBettingClosed}
      />
    </>
  );
};
