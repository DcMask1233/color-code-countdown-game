
import { DurationGamePage } from "@/components/game/DurationGamePage";

interface GamePageProps {
  selectedGame: string;
  userBalance: number;
  userId: string;
  onBackToHome: () => void;
}

export const GamePage = ({ selectedGame, userBalance, userId, onBackToHome }: GamePageProps) => {
  // Check if it's a duration selection (1min, 3min, 5min) or old format
  if (selectedGame === '1min' || selectedGame === '3min' || selectedGame === '5min') {
    return (
      <DurationGamePage
        duration={selectedGame}
        userBalance={userBalance}
        userId={userId}
        onBackToHome={onBackToHome}
      />
    );
  }

  // Handle legacy format (game-duration) for backward compatibility
  const [gameType, duration] = selectedGame.split('-');
  
  const gameMode = duration === '1min' ? 'Wingo1min' : 
                   duration === '3min' ? 'Wingo3min' : 'Wingo5min';

  const getGameTitle = () => {
    const typeTitle = gameType.charAt(0).toUpperCase() + gameType.slice(1);
    return `${typeTitle} (${duration})`;
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
            {getGameTitle()}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-md">
        {/* Legacy single game view - redirect to duration page */}
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Redirecting to game tabs...</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Game Tabs
          </button>
        </div>
      </div>
    </div>
  );
};
