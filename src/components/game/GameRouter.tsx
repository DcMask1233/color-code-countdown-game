
import { ParityGame } from "@/components/game/engines/ParityGame";
import { SapreGame } from "@/components/game/engines/SapreGame";
import { BconeGame } from "@/components/game/engines/BconeGame";
import { EmerdGame } from "@/components/game/engines/EmerdGame";

interface GameRouterProps {
  gameType: string;
  gameMode: "Wingo1min" | "Wingo3min" | "Wingo5min";
  userBalance: number;
  userId: string;
}

export const GameRouter = ({ gameType, gameMode, userBalance, userId }: GameRouterProps) => {
  const commonProps = {
    userBalance,
    gameMode,
    userId
  };

  // Create unique key for proper component unmounting/remounting
  const gameKey = `${gameType}_${gameMode}_${userId}`;

  switch (gameType.toLowerCase()) {
    case 'parity':
      return <ParityGame key={gameKey} {...commonProps} />;
    case 'sapre':
      return <SapreGame key={gameKey} {...commonProps} />;
    case 'bcone':
      return <BconeGame key={gameKey} {...commonProps} />;
    case 'emerd':
      return <EmerdGame key={gameKey} {...commonProps} />;
    default:
      return <ParityGame key={gameKey} {...commonProps} />;
  }
};
