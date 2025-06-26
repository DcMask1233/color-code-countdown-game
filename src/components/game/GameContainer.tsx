import { BetPopup } from "@/components/game/BetPopup";
import { useToast } from "@/hooks/use-toast";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface GameContainerProps {
  activeGameTab: string;
  selectedGameMode: string;
  showBetPopup: boolean;
  selectedBetType: 'color' | 'number';
  selectedBetValue: string | number;
  isBettingClosed: boolean;
  userBalance: number;
  gameRecords: GameRecord[];
  onGameTabChange: (tab: string) => void;
  onBackToHome: () => void;
  onBetPopupClose: () => void;
  onRoundComplete: (newPeriod: string, winningNumber: number) => void;
  onBettingStateChange: (isClosed: boolean) => void;
  onColorSelect: (color: string) => void;
  onNumberSelect: (number: number) => void;
  onConfirmBet: (amount: number) => void;
}

export const GameContainer = ({
  activeGameTab,
  selectedGameMode,
  showBetPopup,
  selectedBetType,
  selectedBetValue,
  isBettingClosed,
  userBalance,
  gameRecords,
  onGameTabChange,
  onBackToHome,
  onBetPopupClose,
  onRoundComplete,
  onBettingStateChange,
  onColorSelect,
  onNumberSelect,
  onConfirmBet
}: GameContainerProps) => {
  const getGameModeTitle = (mode: string) => {
    switch (mode) {
      case 'wingo-1min':
        return 'WinGo (1min)';
      case 'wingo-3min':
        return 'WinGo (3min)';
      case 'wingo-5min':
        return 'WinGo (5min)';
      default:
        return 'WinGo';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <div className="bg-[#1e99eb] text-white p-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBackToHome}
              className="text-white hover:bg-blue-600 rounded p-1"
            >
              ←
            </button>
            <h1 className="text-lg font-semibold">
              {getGameModeTitle(selectedGameMode)}
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-4 max-w-md">
          <GameSection
            activeGameTab={activeGameTab}
            onGameTabChange={onGameTabChange}
            onRoundComplete={onRoundComplete}
            onBettingStateChange={onBettingStateChange}
            onColorSelect={onColorSelect}
            onNumberSelect={onNumberSelect}
            isBettingClosed={isBettingClosed}
            gameRecords={gameRecords}
            gameMode={selectedGameMode}
          />
        </div>
      </div>

      <BetPopup
        isOpen={showBetPopup}
        onClose={onBetPopupClose}
        selectedType={selectedBetType}
        selectedValue={selectedBetValue}
        userBalance={userBalance}
        onConfirmBet={onConfirmBet}
        disabled={isBettingClosed}
      />
    </>
  );
};
