
import { useState } from "react";
import { ColorButtons } from "@/components/game/ColorButtons";
import { NumberGrid } from "@/components/game/NumberGrid";
import { ModernGameRecords } from "@/components/game/ModernGameRecords";
import { BetPopup } from "@/components/game/BetPopup";
import { useGamePeriods } from "@/hooks/useGamePeriods";
import { useBackendGameEngine } from "@/hooks/useBackendGameEngine";
import { getDurationFromGameMode } from "@/lib/gameUtils";
import { useAuth } from "@/hooks/useAuth";
import { GameType, GameMode } from "@/types/Game";
import { formatTime, isBettingClosed as checkBettingClosed } from "@/utils/gameHelpers";

interface GameEngineProps {
  gameType: GameType;
  gameMode: GameMode;
}

export const GameEngine = ({ gameType, gameMode }: GameEngineProps) => {
  const duration = getDurationFromGameMode(gameMode);
  const { currentPeriod, timeLeft, isLoading, error } = useGamePeriods(gameType, gameMode);
  const { userBets, placeBet, isLoading: isBetLoading } = useBackendGameEngine(gameType, gameMode);
  const { user, userProfile } = useAuth();

  const [showBetPopup, setShowBetPopup] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState<"color" | "number">("color");
  const [selectedBetValue, setSelectedBetValue] = useState<string | number>("");

  const handleColorSelect = (color: string) => {
    if (!user) {
      alert("Please login to place bets");
      return;
    }
    setSelectedBetType("color");
    setSelectedBetValue(color);
    setShowBetPopup(true);
  };

  const handleNumberSelect = (number: number) => {
    if (!user) {
      alert("Please login to place bets");
      return;
    }
    setSelectedBetType("number");
    setSelectedBetValue(number);
    setShowBetPopup(true);
  };

  const handleConfirmBet = async (amount: number) => {
    if (!currentPeriod) {
      console.error('No current period available');
      return false;
    }

    // Use period ID or create period if needed
    let periodId = currentPeriod.id;
    if (periodId === 0) {
      console.warn('Period ID is 0, the backend will handle period creation');
      periodId = 1; // Temporary ID, backend handles actual period creation
    }

    const success = await placeBet(
      selectedBetType,
      selectedBetValue,
      amount,
      periodId
    );
    
    if (success) setShowBetPopup(false);
    return success;
  };

  const isBettingClosed = checkBettingClosed(timeLeft, currentPeriod?.is_locked);
  const displayBalance = userProfile?.balance || 0;

  if (isLoading) return <div className="flex justify-center p-4">Loading game...</div>;
  if (error) return <div className="flex justify-center p-4 text-red-500">Error: {error}</div>;
  if (!currentPeriod) return <div className="flex justify-center p-4">No active game period</div>;

  return (
    <>
      {/* Game Header */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-950 font-semibold">Period</span>
          <span className="text-sm font-semibold text-gray-800">{currentPeriod.period}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-950 font-semibold">Count Down</span>
          <span className={`text-lg font-bold ${isBettingClosed ? "opacity-50 blur-[1px]" : ""}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        {isBettingClosed && (
          <div className="mt-2 text-center text-sm text-red-600 font-medium">
            Betting Closed
          </div>
        )}
      </div>

      {/* Game Controls */}
      <ColorButtons onColorSelect={handleColorSelect} disabled={isBettingClosed || isBetLoading} />
      <NumberGrid onNumberSelect={handleNumberSelect} disabled={isBettingClosed || isBetLoading} />

      {/* Game Records */}
      <ModernGameRecords gameType={gameType} duration={duration} />

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
