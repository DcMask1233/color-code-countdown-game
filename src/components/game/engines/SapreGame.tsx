
import { useState } from "react";
import { ColorButtons } from "@/components/game/ColorButtons";
import { NumberGrid } from "@/components/game/NumberGrid";
import { ModernGameRecords } from "@/components/game/ModernGameRecords";
import { BetPopup } from "@/components/game/BetPopup";
import { useBackendGameEngine } from "@/hooks/useBackendGameEngine";
import { useBackendPeriod } from "@/hooks/useBackendPeriod";
import { getDurationFromGameMode } from "@/lib/gameUtils";
import { useAuth } from "@/hooks/useAuth";

interface SapreGameProps {
  userBalance: number;
  gameMode: "Wingo1min" | "Wingo3min" | "Wingo5min";
  userId: string;
}

export const SapreGame = ({ userBalance, gameMode, userId }: SapreGameProps) => {
  const duration = getDurationFromGameMode(gameMode);
  const { currentPeriod, timeLeft, isLoading, error } = useBackendPeriod(duration);
  const { userBets, placeBet, isLoading: isBetLoading } = useBackendGameEngine("Sapre", gameMode);
  const { userProfile } = useAuth();

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
    // Use a mock period ID since we don't have the actual period structure
    const success = await placeBet(selectedBetType, selectedBetValue, amount, 1);
    if (success) setShowBetPopup(false);
    return success;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isBettingClosed = timeLeft <= 5;
  const displayBalance = userProfile?.balance || userBalance;

  if (isLoading) return <div className="flex justify-center p-4">Loading...</div>;
  if (error) return <div className="flex justify-center p-4 text-red-500">Error: {error}</div>;

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

      {/* Game Controls */}
      <ColorButtons onColorSelect={handleColorSelect} disabled={isBettingClosed || isBetLoading} />
      <NumberGrid onNumberSelect={handleNumberSelect} disabled={isBettingClosed || isBetLoading} />

      {/* Game Records */}
      <ModernGameRecords gameType="Sapre" duration={duration} />

      {/* Bet Popup */}
      <BetPopup
        isOpen={showBetPopup}
        onClose={() => setShowBetPopup(false)}
        selectedType={selectedBetType}
        selectedValue={selectedBetValue}
        userBalance={displayBalance}
        onConfirmBet={handleConfirmBet}
        disabled={isBettingClosed || isBetLoading}
      />
    </>
  );
};
