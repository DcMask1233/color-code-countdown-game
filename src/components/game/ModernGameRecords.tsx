
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameResultsTable } from "./GameResultsTable";
import { UserBetsTable } from "./UserBetsTable";

interface UserBet {
  period: string;
  betType: 'color' | 'number';
  betValue: string | number;
  amount: number;
  result?: 'win' | 'lose';
  payout?: number;
  timestamp: Date;
}

interface ModernGameRecordsProps {
  userBets: UserBet[];
  gameType: string;
  duration: number;
}

export const ModernGameRecords: React.FC<ModernGameRecordsProps> = ({
  userBets,
  gameType,
  duration
}) => {
  const [activeTab, setActiveTab] = useState(`${gameType}-record`);

  const getGameDisplayName = (gameId: string) => {
    switch (gameId) {
      case 'parity': return 'Parity';
      case 'sapre': return 'Sapre';
      case 'bcone': return 'Bcone';
      case 'emerd': return 'Emerd';
      default: return 'Game';
    }
  };

  const gameDisplayName = getGameDisplayName(gameType);

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">{gameDisplayName} Record</CardTitle>
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
