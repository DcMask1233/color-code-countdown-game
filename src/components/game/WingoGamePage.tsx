import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UniversalGameEngine, UserBet } from "@/components/game/engines/UniversalGameEngine";
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

interface WingoGamePageProps {
  gameMode: string;
  userBalance: number;
  gameRecords: GameRecord[];
  onBackToHome: () => void;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (amount: number) => void;
  onGameRecordsUpdate: (records: GameRecord[]) => void;
}

export const WingoGamePage = ({
  gameMode,
  userBalance,
  gameRecords,
  onBackToHome,
  onRoundComplete,
  onBalanceUpdate,
  onGameRecordsUpdate,
}: WingoGamePageProps) => {
  const [activeTab, setActiveTab] = useState<string>("parity");

  const getDuration = () => {
    switch (gameMode) {
      case "wingo-1min":
        return 60;
      case "wingo-3min":
        return 180;
      case "wingo-5min":
        return 300;
      default:
        return 60;
    }
  };

  const duration = getDuration();

  // Helper to get number colors
  const getNumberColor = (num: number): string[] => {
    if (num === 0) return ["violet", "red"];
    if (num === 5) return ["violet", "green"];
    return num % 2 === 0 ? ["red"] : ["green"];
  };

  // This helper manages the onRoundComplete for all engines
  const handleRoundComplete = (newPeriod: string, winningNumber: number, gameType: string) => {
    const newRecord: GameRecord = {
      period: newPeriod,
      number: winningNumber,
      color: getNumberColor(winningNumber),
      gameInstance: `${duration / 60}min-${gameType}`,
    };
    const updatedRecords = [newRecord, ...gameRecords].slice(0, 50);
    onGameRecordsUpdate(updatedRecords);
    onRoundComplete(newPeriod, winningNumber, gameType);
  };

  // Create engine instance per game type
  const parityEngine = UniversalGameEngine({
    gameType: "parity",
    duration,
    onPeriodChange: () => {},
    onCountdownChange: () => {},
    onBettingClosedChange: () => {},
    onRoundComplete: handleRoundComplete,
    onBalanceUpdate,
    userBalance,
  });

  const sapreEngine = UniversalGameEngine({
    gameType: "sapre",
    duration,
    onPeriodChange: () => {},
    onCountdownChange: () => {},
    onBettingClosedChange: () => {},
    onRoundComplete: handleRoundComplete,
    onBalanceUpdate,
    userBalance,
  });

  const bconeEngine = UniversalGameEngine({
    gameType: "bcone",
    duration,
    onPeriodChange: () => {},
    onCountdownChange: () => {},
    onBettingClosedChange: () => {},
    onRoundComplete: handleRoundComplete,
    onBalanceUpdate,
    userBalance,
  });

  const emerdEngine = UniversalGameEngine({
    gameType: "emerd",
    duration,
    onPeriodChange: () => {},
    onCountdownChange: () => {},
    onBettingClosedChange: () => {},
    onRoundComplete: handleRoundComplete,
    onBalanceUpdate,
    userBalance,
  });

  const getGameModeTitle = () => {
    switch (gameMode) {
      case "wingo-1min":
        return "WinGo (1min)";
      case "wingo-3min":
        return "WinGo (3min)";
      case "wingo-5min":
        return "WinGo (5min)";
      default:
        return "WinGo";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1e99eb] text-white p-4">
        <div className="flex items-center gap-4">
          <button onClick={onBackToHome} className="text-white hover:bg-blue-600 rounded p-1 text-base">
            ←
          </button>
          <h1 className="text-lg font-semibold">{getGameModeTitle()}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="parity">Parity</TabsTrigger>
            <TabsTrigger value="sapre">Sapre</TabsTrigger>
            <TabsTrigger value="bcone">Bcone</TabsTrigger>
            <TabsTrigger value="emerd">Emerd</TabsTrigger>
          </TabsList>

          <TabsContent value="parity" className="mt-4">
            <ParityGame
              timeLeft={parityEngine.timeLeft}
              currentPeriod={parityEngine.currentPeriod}
              isBettingClosed={parityEngine.isBettingClosed}
              userBets={parityEngine.userBets}
              userBalance={userBalance}
              formatTime={parityEngine.formatTime}
              onPlaceBet={parityEngine.placeBet}
              duration={duration}
            />
          </TabsContent>

          <TabsContent value="sapre" className="mt-4">
            <SapreGame
              timeLeft={sapreEngine.timeLeft}
              currentPeriod={sapreEngine.currentPeriod}
              isBettingClosed={sapreEngine.isBettingClosed}
              userBets={sapreEngine.userBets}
              userBalance={userBalance}
              formatTime={sapreEngine.formatTime}
              onPlaceBet={sapreEngine.placeBet}
              duration={duration}
            />
          </TabsContent>

          <TabsContent value="bcone" className="mt-4">
            <BconeGame
              timeLeft={bconeEngine.timeLeft}
              currentPeriod={bconeEngine.currentPeriod}
              isBettingClosed={bconeEngine.isBettingClosed}
              userBets={bconeEngine.userBets}
              userBalance={userBalance}
              formatTime={bconeEngine.formatTime}
              onPlaceBet={bconeEngine.placeBet}
              duration={duration}
            />
          </TabsContent>

          <TabsContent value="emerd" className="mt-4">
            <EmerdGame
              timeLeft={emerdEngine.timeLeft}
              currentPeriod={emerdEngine.currentPeriod}
              isBettingClosed={emerdEngine.isBettingClosed}
              userBets={emerdEngine.userBets}
              userBalance={userBalance}
              formatTime={emerdEngine.formatTime}
              onPlaceBet={emerdEngine.placeBet}
              duration={duration}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
