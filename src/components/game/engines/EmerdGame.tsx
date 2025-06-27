
import { UnifiedGameEngine } from "./UnifiedGameEngine";

interface EmerdGameProps {
  userBalance: number;
  gameMode: "Wingo1min" | "Wingo3min" | "Wingo5min";
  userId: string;
}

export const EmerdGame = ({ userBalance, gameMode, userId }: EmerdGameProps) => {
  return (
    <UnifiedGameEngine
      gameType="Emerd"
      userBalance={userBalance}
      gameMode={gameMode}
      userId={userId}
    />
  );
};
