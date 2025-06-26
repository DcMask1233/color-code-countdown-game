
import { Crown, Target, TrendingUp, Zap } from "lucide-react";

interface GameSelectionCardsProps {
  onGameSelect: (gameMode: string) => void;
}

export const GameSelectionCards = ({ onGameSelect }: GameSelectionCardsProps) => {
  const gameCards = [
    {
      id: 'parity-1min',
      title: 'Parity',
      subtitle: '1min',
      icon: Crown,
      description: 'Predict color or number'
    },
    {
      id: 'parity-3min',
      title: 'Parity',
      subtitle: '3min',
      icon: Crown,
      description: 'Predict color or number'
    },
    {
      id: 'parity-5min',
      title: 'Parity',
      subtitle: '5min',
      icon: Crown,
      description: 'Predict color or number'
    },
    {
      id: 'sapre-1min',
      title: 'Sapre',
      subtitle: '1min',
      icon: Target,
      description: 'Even or odd prediction'
    },
    {
      id: 'sapre-3min',
      title: 'Sapre',
      subtitle: '3min',
      icon: Target,
      description: 'Even or odd prediction'
    },
    {
      id: 'sapre-5min',
      title: 'Sapre',
      subtitle: '5min',
      icon: Target,
      description: 'Even or odd prediction'
    },
    {
      id: 'bcone-1min',
      title: 'Bcone',
      subtitle: '1min',
      icon: TrendingUp,
      description: 'Big or small prediction'
    },
    {
      id: 'bcone-3min',
      title: 'Bcone',
      subtitle: '3min',
      icon: TrendingUp,
      description: 'Big or small prediction'
    },
    {
      id: 'bcone-5min',
      title: 'Bcone',
      subtitle: '5min',
      icon: TrendingUp,
      description: 'Big or small prediction'
    },
    {
      id: 'emerd-1min',
      title: 'Emerd',
      subtitle: '1min',
      icon: Zap,
      description: 'Single digit prediction'
    },
    {
      id: 'emerd-3min',
      title: 'Emerd',
      subtitle: '3min',
      icon: Zap,
      description: 'Single digit prediction'
    },
    {
      id: 'emerd-5min',
      title: 'Emerd',
      subtitle: '5min',
      icon: Zap,
      description: 'Single digit prediction'
    }
  ];

  return (
    <div className="p-4 space-y-4">
      {gameCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onGameSelect(card.id)}
            className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <div className="bg-blue-100 p-3 rounded-full">
              <IconComponent size={24} className="text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.subtitle}</p>
              <p className="text-xs text-gray-400">{card.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
