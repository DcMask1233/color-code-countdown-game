
import { useState } from "react";
import { GameTabs } from "@/components/game/GameTabs";
import { GameRouter } from "@/components/game/GameRouter";

interface DurationGamePageProps {
  duration: string;
  userBalance: number;
  userId: string;
  onBackToHome: () => void;
}

export const DurationGamePage = ({ duration, userBalance, userId, onBackToHome }: DurationGamePageProps) => {
  const [activeGameTab, setActiveGameTab] = useState("parity");

  const getDurationTitle = () => {
    switch (duration) {
      case '1min':
        return 'Wingo1min';
      case '3min':
        return 'Wingo3min';
      case '5min':
        return 'Wingo5min';
      default:
        return 'Wingo';
    }
  };

  const getGameMode = () => {
    switch (duration) {
      case '1min':
        return 'Wingo1min' as const;
      case '3min':
        return 'Wingo3min' as const;
      case '5min':
        return 'Wingo5min' as const;
      default:
        return 'Wingo1min' as const;
    }
  };

  return (
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
            {getDurationTitle()}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-md">
        <GameTabs
          activeTab={activeGameTab}
          onTabChange={setActiveGameTab}
        />

        <GameRouter
          gameType={activeGameTab}
          gameMode={getGameMode()}
          userBalance={userBalance}
          userId={userId}
        />
      </div>
    </div>
  );
};
