
import { Crown, Target, TrendingUp, Zap } from "lucide-react";

interface GameSelectionCardsProps {
  onGameSelect: (gameMode: string) => void;
}

export const GameSelectionCards = ({ onGameSelect }: GameSelectionCardsProps) => {
  const durations = [
    { id: '1min', title: 'wingo1min', subtitle: '1 Minute Games' },
    { id: '3min', title: 'wingo3min', subtitle: '3 Minute Games' },
    { id: '5min', title: 'wingo5min', subtitle: '5 Minute Games' }
  ];

  return (
    <div className="p-4 space-y-4">
      {durations.map((duration) => (
        <button
          key={duration.id}
          onClick={() => onGameSelect(duration.id)}
          className="w-full bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <div className="bg-blue-100 p-3 rounded-full">
            <Crown size={24} className="text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">{duration.title}</h3>
            <p className="text-sm text-gray-500">{duration.subtitle}</p>
            <p className="text-xs text-gray-400">Multiple game types available</p>
          </div>
        </button>
      ))}
    </div>
  );
};
