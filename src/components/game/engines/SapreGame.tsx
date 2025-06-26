import { useState } from "react";
import { ColorButtons } from "@/components/game/ColorButtons";
import { NumberGrid } from "@/components/game/NumberGrid";
import { ModernGameRecords } from "@/components/game/ModernGameRecords";
import { BetPopup } from "@/components/game/BetPopup";
import { useGameEngine } from "@/hooks/useGameEngine";
import { useSupabasePeriod } from "@/hooks/useSupabasePeriod";
import { getDurationFromGameMode } from "@/lib/gameUtils";

interface SapreGameProps {
  userBalance: number;
  gameMode: "Wingo1min" | "Wingo3min" | "Wingo5min"; // ✅ Now supports all
  userId: string;
}

export const SapreGame = ({ userBalance, gameMode, userId }: SapreGameProps) => {
  const duration = getDurationFromGameMode(gameMode);
  const { currentPeriod, timeLeft, isLoading, error } = useSupabasePeriod(duration);
  const { userBets, placeBet } = useGameEngine("Sapre", gameMode, userId);

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
    const success = await placeBet(selectedBetType, selectedBetValue, amount, currentPeriod);
    if (success) setShowBetPopup(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isBettingClosed = timeLeft <= 5;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
          <span className={`text-lg font-bold ${isBettingClosed ? "opacity-50 blur-[1px]" : ""}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* UI */}
      <ColorButtons onColorSelect={handleColorSelect} disabled={isBettingClosed} />
      <NumberGrid onNumberSelect={handleNumberSelect} disabled={isBettingClosed} />

      {/* Records */}
      <ModernGameRecords gameType="Sapre" duration={duration} />

      {/* Bet popup */}
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
