
import { GameEngine } from "./GameEngine";
import { GameMode } from "@/types/Game";

interface EmerdGameProps {
  userBalance: number;
  gameMode: GameMode;
  userId: string;
}

export const EmerdGame = ({ userBalance, gameMode, userId }: EmerdGameProps) => {
  return (
    <GameEngine
      gameType="Emerd"
      gameMode={gameMode}
    />
  );
};
