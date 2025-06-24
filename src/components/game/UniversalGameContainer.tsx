import { WingoGamePage } from "@/components/game/WingoGamePage";

type GameMode = "Wingo1min" | "Wingo3min" | "Wingo5min";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
  gameInstance?: string;
}

interface UniversalGameContainerProps {
  gameMode: GameMode;
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
  onGameRecordsUpdate,
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
