
import { Crown, Target, TrendingUp, Zap } from "lucide-react";

interface GameType {
  id: string;
  name: string;
  description: string;
  icon: any;
}

interface GameTypeSelectorProps {
  onGameTypeSelect: (gameType: string) => void;
  duration: number;
}

export const GameTypeSelector = ({ onGameTypeSelect, duration }: GameTypeSelectorProps) => {
  const gameTypes: GameType[] = [
    {
      id: 'parity',
      name: 'Parity',
      description: 'Predict color or number',
      icon: Crown
    },
    {
      id: 'sapre',
      name: 'Sapre',
      description: 'Even or Odd prediction',
      icon: Target
    },
    {
      id: 'bcone',
      name: 'Bcone',
      description: 'Big or Small prediction',
      icon: TrendingUp
    },
    {
      id: 'emerd',
      name: 'Emerd',
      description: 'Single digit prediction',
      icon: Zap
    }
  ];

  const getDurationLabel = (duration: number) => {
    return duration === 60 ? '1min' : duration === 180 ? '3min' : '5min';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#1e99eb] text-white p-4">
        <h1 className="text-lg font-semibold">
          WinGo ({getDurationLabel(duration)}) - Select Game Type
        </h1>
      </div>
      
      <div className="container mx-auto px-4 py-4 max-w-md">
        <div className="space-y-4">
          {gameTypes.map((gameType) => {
            const IconComponent = gameType.icon;
            return (
              <button
                key={gameType.id}
                onClick={() => onGameTypeSelect(gameType.id)}
                className="w-full bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <div className="bg-blue-100 p-3 rounded-full">
                  <IconComponent size={32} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">{gameType.name}</h3>
                  <p className="text-sm text-gray-500">{gameType.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
