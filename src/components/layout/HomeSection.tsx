
import { HomeHeader } from "@/components/layout/HomeHeader";
import { GameSelectionCards } from "@/components/game/GameSelectionCards";

interface HomeSectionProps {
  balance: number;
  userId: string;
  onRecharge: () => void;
  onWithdraw: () => void;
  onRefresh: () => void;
  onGameSelect: (gameMode: string) => void;
}

export const HomeSection = ({
  balance,
  userId,
  onRecharge,
  onWithdraw,
  onRefresh,
  onGameSelect
}: HomeSectionProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader
        balance={balance}
        userId={userId}
        onRecharge={onRecharge}
        onWithdraw={onWithdraw}
        onRefresh={onRefresh}
      />
      <GameSelectionCards onGameSelect={onGameSelect} />
    </div>
  );
};
