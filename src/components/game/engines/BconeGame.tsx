
import { GameEngine } from "./GameEngine";
import { GameMode } from "@/types/Game";

interface BconeGameProps {
  userBalance: number;
  gameMode: GameMode;
  userId: string;
}

export const BconeGame = ({ userBalance, gameMode, userId }: BconeGameProps) => {
  return (
    <GameEngine
      gameType="Bcone"
      gameMode={gameMode}
    />
  );
};
