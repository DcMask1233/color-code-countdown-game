
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [activeTab, setActiveTab] = useState("parity-record");

  const gameTypes = [
    { id: 'parity', name: 'Parity' },
    { id: 'sapre', name: 'Sapre' },
    { id: 'bcone', name: 'Bcone' },
    { id: 'emerd', name: 'Emerd' }
  ];

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">Game Records</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 p-1 bg-gray-100 rounded-lg mx-4">
            {gameTypes.map((game) => (
              <React.Fragment key={game.id}>
                <TabsTrigger
                  value={`${game.id}-record`}
                  className="text-xs px-2 py-1 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  {game.name}
                </TabsTrigger>
                <TabsTrigger
                  value={`my-${game.id}-record`}
                  className="text-xs px-2 py-1 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  My {game.name}
                </TabsTrigger>
              </React.Fragment>
            ))}
          </TabsList>

          {gameTypes.map((game) => (
            <React.Fragment key={game.id}>
              <TabsContent value={`${game.id}-record`} className="mt-4 px-4">
                <GameResultsTable gameType={game.id} duration={duration} />
              </TabsContent>
              <TabsContent value={`my-${game.id}-record`} className="mt-4 px-4">
                <UserBetsTable 
                  userBets={userBets} 
                  gameType={game.id}
                  title={`My ${game.name} Records`}
                />
              </TabsContent>
            </React.Fragment>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
