
import { Crown, Target, TrendingUp, Zap } from "lucide-react";

interface GameSelectionCardsProps {
  onGameSelect: (gameMode: string) => void;
}

export const GameSelectionCards = ({ onGameSelect }: GameSelectionCardsProps) => {
  const gameTypes = [
    {
      id: 'parity',
      title: 'Parity',
      icon: Crown,
      description: 'Predict color or number'
    },
    {
      id: 'sapre',
      title: 'Sapre',
      icon: Target,
      description: 'Even or odd prediction'
    },
    {
      id: 'bcone',
      title: 'Bcone',
      icon: TrendingUp,
      description: 'Big or small prediction'
    },
    {
      id: 'emerd',
      title: 'Emerd',
      icon: Zap,
      description: 'Single digit prediction'
    }
  ];

  const durations = [
    { id: '1min', title: 'Wingo1min', subtitle: '1 Minute Games' },
    { id: '3min', title: 'Wingo3min', subtitle: '3 Minute Games' },
    { id: '5min', title: 'Wingo5min', subtitle: '5 Minute Games' }
  ];

  return (
    <div className="p-4 space-y-6">
      {durations.map((duration) => (
        <div key={duration.id} className="space-y-3">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg">
            <h2 className="text-lg font-bold">{duration.title}</h2>
            <p className="text-sm opacity-90">{duration.subtitle}</p>
          </div>
          
          {/* Games in this duration */}
          <div className="space-y-2">
            {gameTypes.map((game) => {
              const IconComponent = game.icon;
              const gameId = `${game.id}-${duration.id}`;
              
              return (
                <button
                  key={gameId}
                  onClick={() => onGameSelect(gameId)}
                  className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <div className="bg-blue-100 p-3 rounded-full">
                    <IconComponent size={24} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{game.title}</h3>
                    <p className="text-sm text-gray-500">{duration.id}</p>
                    <p className="text-xs text-gray-400">{game.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
