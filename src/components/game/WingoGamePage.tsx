import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UniversalGameEngine from "@/components/game/engines/UniversalGameEngine";
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
  const [activeTab, setActiveTab] = useState("parity");
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isBettingClosed, setIsBettingClosed] = useState(false);

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

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const duration = getDuration();
  const durationLabel = duration === 60 ? "1min" : duration === 180 ? "3min" : "5min";

  const getNumberColor = (num: number): string[] => {
    if (num === 0) return ["violet", "red"];
    if (num === 5) return ["violet", "green"];
    return num % 2 === 0 ? ["red"] : ["green"];
  };

  const handleRoundComplete = (newPeriod: string, winningNumber: number, gameType: string) => {
    const gameInstance = `${durationLabel}-${gameType}`;
    const newRecord = {
      period: newPeriod,
      number: winningNumber,
      color: getNumberColor(winningNumber),
      gameInstance,
    };
    const updatedRecords = [newRecord, ...gameRecords].slice(0, 50);
    onGameRecordsUpdate(updatedRecords);
    onRoundComplete(newPeriod, winningNumber, gameType);
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
        <UniversalGameEngine
          gameType={activeTab}
          duration={duration}
          gameMode={gameMode}
          onPeriodChange={setCurrentPeriod}
          onCountdownChange={setTimeLeft}
          onBettingClosedChange={setIsBettingClosed}
          onRoundComplete={handleRoundComplete}
          onBalanceUpdate={onBalanceUpdate}
          userBalance={userBalance}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="parity">Parity</TabsTrigger>
            <TabsTrigger value="sapre">Sapre</TabsTrigger>
            <TabsTrigger value="bcone">Bcone</TabsTrigger>
            <TabsTrigger value="emerd">Emerd</TabsTrigger>
          </TabsList>

          <TabsContent value="parity" className="mt-4">
            <ParityGame
              timeLeft={timeLeft}
              currentPeriod={currentPeriod}
              isBettingClosed={isBettingClosed}
              userBets={[]}
              userBalance={userBalance}
              formatTime={formatTime}
              onPlaceBet={() => {}}
              duration={duration}
            />
          </TabsContent>

          <TabsContent value="sapre" className="mt-4">
            <SapreGame
              timeLeft={timeLeft}
              currentPeriod={currentPeriod}
              isBettingClosed={isBettingClosed}
              userBets={[]}
              userBalance={userBalance}
              formatTime={formatTime}
              onPlaceBet={() => {}}
              duration={duration}
            />
          </TabsContent>

          <TabsContent value="bcone" className="mt-4">
            <BconeGame
              timeLeft={timeLeft}
              currentPeriod={currentPeriod}
              isBettingClosed={isBettingClosed}
              userBets={[]}
              userBalance={userBalance}
              formatTime={formatTime}
              onPlaceBet={() => {}}
              duration={duration}
            />
          </TabsContent>

          <TabsContent value="emerd" className="mt-4">
            <EmerdGame
              timeLeft={timeLeft}
              currentPeriod={currentPeriod}
              isBettingClosed={isBettingClosed}
              userBets={[]}
              userBalance={userBalance}
              formatTime={formatTime}
              onPlaceBet={() => {}}
              duration={duration}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
