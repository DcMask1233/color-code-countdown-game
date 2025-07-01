
import { GameEngine } from "./GameEngine";

interface BconeGameProps {
  userBalance: number;
  gameMode: "Wingo1min" | "Wingo3min" | "Wingo5min";
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
