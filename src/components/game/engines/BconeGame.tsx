
import { ColorButtons } from "@/components/game/ColorButtons";
import { NumberGrid } from "@/components/game/NumberGrid";
import { BetPopup } from "@/components/game/BetPopup";
import { GameRecord } from "@/components/game/GameRecord";
import { useState } from "react";

interface UserBet {
  period: string;
  betType: 'color' | 'number';
  betValue: string | number;
  amount: number;
  result?: 'win' | 'lose';
  payout?: number;
  timestamp: Date;
}

interface BconeGameProps {
  timeLeft: number;
  currentPeriod: string;
  isBettingClosed: boolean;
  userBets: UserBet[];
  onPlaceBet: (betType: 'color' | 'number', betValue: string | number, amount: number) => boolean;
  userBalance: number;
  formatTime: (seconds: number) => string;
  duration: number;
}

export const BconeGame = ({
  timeLeft,
  currentPeriod,
  isBettingClosed,
  userBets,
  onPlaceBet,
  userBalance,
  formatTime,
  duration
}: BconeGameProps) => {
  const [showBetPopup, setShowBetPopup] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState<'color' | 'number'>('color');
  const [selectedBetValue, setSelectedBetValue] = useState<string | number>('');

  const handleColorSelect = (color: string) => {
    setSelectedBetType('color');
    setSelectedBetValue(color);
    setShowBetPopup(true);
  };

  const handleNumberSelect = (number: number) => {
    setSelectedBetType('number');
    setSelectedBetValue(number);
    setShowBetPopup(true);
  };

  const handleConfirmBet = (amount: number) => {
    const success = onPlaceBet(selectedBetType, selectedBetValue, amount);
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

      <ColorButtons 
        onColorSelect={handleColorSelect}
        disabled={isBettingClosed}
      />

      <NumberGrid 
        onNumberSelect={handleNumberSelect}
        disabled={isBettingClosed}
      />

      <GameRecord 
        userBets={userBets}
        gameType="bcone"
        duration={duration}
      />

      <BetPopup
        isOpen={showBetPopup}
        onClose={() => setShowBetPopup(false)}
        selectedType={selectedBetType}
        selectedValue={selectedBetValue}
        userBalance={userBalance}
        onConfirmBet={handleConfirmBet}
        disabled={isBettingClosed}
      />
    </>
  );
};
