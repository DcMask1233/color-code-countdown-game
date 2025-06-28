
import React, { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecureGameResultsTable } from "./SecureGameResultsTable";
import { SecureUserBetsTable } from "./SecureUserBetsTable";
import { useSecureGameEngine } from "@/hooks/useSecureGameEngine";

interface SecureGameRecordsProps {
  gameType: string;
  gameMode: string;
}

export const SecureGameRecords: React.FC<SecureGameRecordsProps> = React.memo(({
  gameType,
  gameMode
}) => {
  const [activeTab, setActiveTab] = useState(`${gameType}-record`);
  const { userBets } = useSecureGameEngine(gameType, gameMode);

  const gameDisplayName = useMemo(() => {
    switch (gameType.toLowerCase()) {
      case 'parity': return 'Parity';
      case 'sapre': return 'Sapre';
      case 'bcone': return 'Bcone';
      case 'emerd': return 'Emerd';
      default: return gameType.charAt(0).toUpperCase() + gameType.slice(1);
    }
  }, [gameType]);

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
            <SecureGameResultsTable gameType={gameType} gameMode={gameMode} />
          </TabsContent>
          
          <TabsContent value={`my-${gameType}-record`} className="mt-4 px-4">
            <SecureUserBetsTable 
              userBets={userBets} 
              gameType={gameType}
              title={`My ${gameDisplayName} Records`}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

SecureGameRecords.displayName = 'SecureGameRecords';
