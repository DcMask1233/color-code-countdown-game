
import { GameRouter } from "@/components/game/GameRouter";

interface GamePageProps {
  selectedGame: string;
  userBalance: number;
  userId: string;
  onBackToHome: () => void;
}

export const GamePage = ({ selectedGame, userBalance, userId, onBackToHome }: GamePageProps) => {
  // Parse the game selection (e.g., "parity-1min" -> gameType: "parity", gameMode: "Wingo1min")
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
        <GameRouter
          gameType={gameType}
          gameMode={gameMode}
          userBalance={userBalance}
          userId={userId}
        />
      </div>
    </div>
  );
};
