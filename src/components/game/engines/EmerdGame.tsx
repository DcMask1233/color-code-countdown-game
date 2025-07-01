
import { GameEngine } from "./GameEngine";

interface EmerdGameProps {
  userBalance: number;
  gameMode: "Wingo1min" | "Wingo3min" | "Wingo5min";
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
