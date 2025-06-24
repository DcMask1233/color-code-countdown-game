import { useState } from "react";
import { ColorButtons } from "@/components/game/ColorButtons";
import { NumberGrid } from "@/components/game/NumberGrid";
import { ModernGameRecords } from "@/components/game/ModernGameRecords";
import { BetPopup } from "@/components/game/BetPopup";
import { useGameEngine } from "@/hooks/useGameEngine";
import { getDurationFromGameMode } from "@/lib/gameUtils";


interface ParityGameProps {
  userBalance: number;
  gameMode: "Wingo1min" | "Wingo3min" | "Wingo5min";
}

export const ParityGame = ({ userBalance, gameMode }: ParityGameProps) => {
  const {
    currentPeriod,
    timeLeft,
    userBets,
    placeBet,
    isBettingClosed,
    formatTime,
  } = useGameEngine("Parity", gameMode); // ✅ Pass gameMode into engine

  const [showBetPopup, setShowBetPopup] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState<"color" | "number">("color");
  const [selectedBetValue, setSelectedBetValue] = useState<string | number>("");

  const handleColorSelect = (color: string) => {
    setSelectedBetType("color");
    setSelectedBetValue(color);
    setShowBetPopup(true);
  };

  const handleNumberSelect = (number: number) => {
    setSelectedBetType("number");
    setSelectedBetValue(number);
    setShowBetPopup(true);
  };

  const handleConfirmBet = async (amount: number) => {
    const success = await placeBet(selectedBetType, selectedBetValue, amount);
    if (success) setShowBetPopup(false);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-950 font-semibold">Period</span>
          <span className="text-sm font-semibold text-gray-800">{currentPeriod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-950 font-semibold">Count Down</span>
          <span
            className={`text-lg font-bold transition-all duration-300 ${
              isBettingClosed ? "text-black opacity-50 blur-[1px]" : "text-black"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Betting UI */}
      <ColorButtons onColorSelect={handleColorSelect} disabled={isBettingClosed} />
      <NumberGrid onNumberSelect={handleNumberSelect} disabled={isBettingClosed} />

      {/* Bet Records */}
      <ModernGameRecords userBets={userBets} gameType="Parity" />

      {/* Bet Popup */}
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
