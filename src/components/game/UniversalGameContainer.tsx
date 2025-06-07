
import { useState } from "react";
import { UniversalGameEngine } from "@/components/game/engines/UniversalGameEngine";
import { GameTypeSelector } from "@/components/game/engines/GameTypeSelector";
import { ParityGame } from "@/components/game/engines/ParityGame";
import { SapreGame } from "@/components/game/engines/SapreGame";
import { BconeGame } from "@/components/game/engines/BconeGame";
import { EmerdGame } from "@/components/game/engines/EmerdGame";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
  gameInstance?: string;
}

interface UniversalGameContainerProps {
  gameMode: string;
  userBalance: number;
  gameRecords: GameRecord[];
  onBackToHome: () => void;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (amount: number) => void;
  onGameRecordsUpdate: (records: GameRecord[]) => void;
}

export const UniversalGameContainer = ({
  gameMode,
  userBalance,
  gameRecords,
  onBackToHome,
  onRoundComplete,
  onBalanceUpdate,
  onGameRecordsUpdate
}: UniversalGameContainerProps) => {
  const [selectedGameType, setSelectedGameType] = useState<string | null>(null);
  
  const getDuration = () => {
    switch (gameMode) {
      case 'wingo-1min':
        return 60;
      case 'wingo-3min':
        return 180;
      case 'wingo-5min':
        return 300;
      default:
        return 60;
    }
  };

  const getGameModeTitle = () => {
    switch (gameMode) {
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

  const duration = getDuration();
  const gameInstance = `${duration === 60 ? '1min' : duration === 180 ? '3min' : '5min'}-${selectedGameType?.toLowerCase()}`;

  const gameEngine = UniversalGameEngine({
    gameName: selectedGameType || 'parity',
    duration,
    gameMode,
    onRoundComplete: (newPeriod, winningNumber, gameType) => {
      // Create new record with game instance identifier
      const newRecord = {
        period: newPeriod,
        number: winningNumber,
        color: getNumberColor(winningNumber),
        gameInstance
      };

      // Update records and call parent callback
      const updatedRecords = [newRecord, ...gameRecords].slice(0, 50); // Keep last 50 records
      onGameRecordsUpdate(updatedRecords);
      onRoundComplete(newPeriod, winningNumber, gameType);
    },
    onBettingStateChange: () => {},
    onBalanceUpdate,
    userBalance
  });

  const getNumberColor = (num: number): string[] => {
    if (num === 0) return ["violet", "red"];
    if (num === 5) return ["violet", "green"];
    return num % 2 === 0 ? ["red"] : ["green"];
  };

  const handleGameTypeSelect = (gameType: string) => {
    setSelectedGameType(gameType);
  };

  const handleBackToGameSelection = () => {
    setSelectedGameType(null);
  };

  if (!selectedGameType) {
    return <GameTypeSelector onGameTypeSelect={handleGameTypeSelect} duration={duration} />;
  }

  // Filter records for this specific game instance
  const filteredRecords = gameRecords.filter(record => 
    record.gameInstance === gameInstance
  );

  const renderGameComponent = () => {
    const commonProps = {
      timeLeft: gameEngine.timeLeft,
      currentPeriod: gameEngine.currentPeriod,
      isBettingClosed: gameEngine.isBettingClosed,
      gameRecords: filteredRecords,
      userBalance,
      formatTime: gameEngine.formatTime,
      onPlaceBet: gameEngine.placeBet
    };

    switch (selectedGameType) {
      case 'parity':
        return <ParityGame {...commonProps} />;
      case 'sapre':
        return <SapreGame {...commonProps} />;
      case 'bcone':
        return <BconeGame {...commonProps} />;
      case 'emerd':
        return <EmerdGame {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1e99eb] text-white p-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToGameSelection}
            className="text-white hover:bg-blue-600 rounded p-1"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold">
            {getGameModeTitle()} - {selectedGameType?.toUpperCase()}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4 max-w-md">
        {renderGameComponent()}
      </div>
    </div>
  );
};
