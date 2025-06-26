
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

  switch (gameType.toLowerCase()) {
    case 'parity':
      return <ParityGame {...commonProps} />;
    case 'sapre':
      return <SapreGame {...commonProps} />;
    case 'bcone':
      return <BconeGame {...commonProps} />;
    case 'emerd':
      return <EmerdGame {...commonProps} />;
    default:
      return <ParityGame {...commonProps} />;
  }
};
