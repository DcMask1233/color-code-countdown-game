
import { WingoGamePage } from "@/components/game/WingoGamePage";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
  gameInstance?: string;
}

interface UniversalGameContainerProps {
  gameMode: string;
  userBalance: number;
  gameRecords: GameRecord[];
  onBackToHome: () => void;
  onRoundComplete: (newPeriod: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (amount: number) => void;
  onGameRecordsUpdate: (records: GameRecord[]) => void;
}

export const UniversalGameContainer = ({
  gameMode,
  userBalance,
  gameRecords,
  onBackToHome,
  onRoundComplete,
  onBalanceUpdate,
  onGameRecordsUpdate
}: UniversalGameContainerProps) => {
  return (
    <WingoGamePage
      gameMode={gameMode}
      userBalance={userBalance}
      gameRecords={gameRecords}
      onBackToHome={onBackToHome}
      onRoundComplete={onRoundComplete}
      onBalanceUpdate={onBalanceUpdate}
      onGameRecordsUpdate={onGameRecordsUpdate}
    />
  );
};
