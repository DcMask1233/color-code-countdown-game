
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameResultsTable } from "./GameResultsTable";
import { UserBetsTable } from "./UserBetsTable";
import { useUserBets } from "@/hooks/useUserBets";

interface ModernGameRecordsProps {
  gameType: string;
  duration: number;
}

export const ModernGameRecords: React.FC<ModernGameRecordsProps> = ({
  gameType,
  duration
}) => {
  const [activeTab, setActiveTab] = useState(`${gameType}-record`);
  const { userBets, syncBetsWithDatabase } = useUserBets();

  // Sync bets when component mounts or gameType changes
  useEffect(() => {
    console.log(`🔄 ModernGameRecords mounted for ${gameType}, syncing bets...`);
    syncBetsWithDatabase();
  }, [gameType, syncBetsWithDatabase]);

  // Log current state for debugging
  useEffect(() => {
    console.log(`📊 ModernGameRecords state for ${gameType}:`, {
      totalBets: userBets.length,
      gameTypeBets: userBets.filter(bet => bet.gameType?.toLowerCase() === gameType.toLowerCase()).length,
      allGameTypes: [...new Set(userBets.map(bet => bet.gameType))],
      userBets: userBets
    });
  }, [userBets, gameType]);

  const getGameDisplayName = (gameId: string) => {
    switch (gameId.toLowerCase()) {
      case 'parity': return 'Parity';
      case 'sapre': return 'Sapre';
      case 'bcone': return 'Bcone';
      case 'emerd': return 'Emerd';
      default: return gameId.charAt(0).toUpperCase() + gameId.slice(1);
    }
  };

  const gameDisplayName = getGameDisplayName(gameType);

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {gameDisplayName} Record
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg mx-4">
            <TabsTrigger
              value={`${gameType}-record`}
              className="text-sm px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              {gameDisplayName} Record
            </TabsTrigger>
            <TabsTrigger
              value={`my-${gameType}-record`}
              className="text-sm px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
            >
              My {gameDisplayName} Record
            </TabsTrigger>
          </TabsList>

          <TabsContent value={`${gameType}-record`} className="mt-4 px-4">
            <GameResultsTable gameType={gameType} duration={duration} />
          </TabsContent>
          
          <TabsContent value={`my-${gameType}-record`} className="mt-4 px-4">
            <UserBetsTable 
              userBets={userBets} 
              gameType={gameType}
              title={`My ${gameDisplayName} Records`}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
