import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UniversalGameEngine from "@/components/game/engines/UniversalGameEngine";
import { ParityGame } from "@/components/game/engines/ParityGame";
import { SapreGame } from "@/components/game/engines/SapreGame";
import { BconeGame } from "@/components/game/engines/BconeGame";
import { EmerdGame } from "@/components/game/engines/EmerdGame";

const gameTypeMap = {
  parity: "Parity",
  sapre: "Sapre",
  bcone: "Bcone",
  emerd: "Emerd",
} as const;

interface WingoGamePageProps {
  gameMode: "Wingo1min" | "Wingo3min" | "Wingo5min";
  userBalance: number;
  gameRecords: any[];
  onBackToHome: () => void;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (amount: number) => void;
  onGameRecordsUpdate: (records: any[]) => void;
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
  const [activeTab, setActiveTab] = useState<keyof typeof gameTypeMap>("parity");
  const selectedGameType = gameTypeMap[activeTab]; // "Parity", etc.

  const getGameModeTitle = () => {
    switch (gameMode) {
      case "Wingo1min":
        return "WinGo (1 min)";
      case "Wingo3min":
        return "WinGo (3 min)";
      case "Wingo5min":
        return "WinGo (5 min)";
      default:
        return "WinGo";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#1e99eb] text-white p-4">
        <div className="flex items-center gap-4">
          <button onClick={onBackToHome} className="text-white hover:bg-blue-600 rounded p-1 text-base">
            ←
          </button>
          <h1 className="text-lg font-semibold">{getGameModeTitle()}</h1>
        </div>
      </div>

      {/* Period + Result Display (shared) */}
      <div className="container mx-auto px-4 pt-4 max-w-md">
        <UniversalGameEngine gameType={selectedGameType} gameMode={gameMode} />
      </div>

      {/* Tabs for Games */}
      <div className="container mx-auto px-4 py-4 max-w-md">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as keyof typeof gameTypeMap)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-2">
            <TabsTrigger value="parity">Parity</TabsTrigger>
            <TabsTrigger value="sapre">Sapre</TabsTrigger>
            <TabsTrigger value="bcone">Bcone</TabsTrigger>
            <TabsTrigger value="emerd">Emerd</TabsTrigger>
          </TabsList>

          <TabsContent value="parity" className="mt-4">
            <ParityGame userBalance={userBalance} gameMode={gameMode} />
          </TabsContent>

          <TabsContent value="sapre" className="mt-4">
            <SapreGame userBalance={userBalance} gameMode={gameMode} />
          </TabsContent>

          <TabsContent value="bcone" className="mt-4">
            <BconeGame userBalance={userBalance} gameMode={gameMode} />
          </TabsContent>

          <TabsContent value="emerd" className="mt-4">
            <EmerdGame userBalance={userBalance} gameMode={gameMode} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
