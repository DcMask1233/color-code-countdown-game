
import { Crown } from "lucide-react";

interface GameSelectionCardsProps {
  onGameSelect: (gameMode: string) => void;
}

export const GameSelectionCards = ({ onGameSelect }: GameSelectionCardsProps) => {
  const gameCards = [
    {
      id: 'wingo-1min',
      title: 'WinGo',
      subtitle: '1min',
      icon: Crown
    },
    {
      id: 'wingo-5min',
      title: 'WinGo',
      subtitle: '5min',
      icon: Crown
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
            className="w-full bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <div className="bg-yellow-100 p-3 rounded-full">
              <IconComponent size={32} className="text-yellow-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
