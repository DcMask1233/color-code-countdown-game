
import { DurationGamePage } from "@/components/game/DurationGamePage";

interface GamePageProps {
  selectedGame: string;
  userBalance: number;
  userId: string;
  onBackToHome: () => void;
}

export const GamePage = ({ selectedGame, userBalance, userId, onBackToHome }: GamePageProps) => {
  return (
    <DurationGamePage
      duration={selectedGame}
      userBalance={userBalance}
      userId={userId}
      onBackToHome={onBackToHome}
    />
  );
};
