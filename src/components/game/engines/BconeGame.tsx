
import { UnifiedGameEngine } from "./UnifiedGameEngine";

interface BconeGameProps {
  userBalance: number;
  gameMode: "Wingo1min" | "Wingo3min" | "Wingo5min";
  userId: string;
}

export const BconeGame = ({ userBalance, gameMode, userId }: BconeGameProps) => {
  return (
    <UnifiedGameEngine
      gameType="Bcone"
      userBalance={userBalance}
      gameMode={gameMode}
      userId={userId}
    />
  );
};
