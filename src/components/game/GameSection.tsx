
import { GameTabs } from "@/components/game/GameTabs";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { ColorButtons } from "@/components/game/ColorButtons";
import { NumberGrid } from "@/components/game/NumberGrid";
import { ParityRecord } from "@/components/game/ParityRecord";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface GameSectionProps {
  activeGameTab: string;
  onGameTabChange: (tab: string) => void;
  onRoundComplete: (newPeriod: string, winningNumber: number) => void;
  onBettingStateChange: (isClosed: boolean) => void;
  onColorSelect: (color: string) => void;
  onNumberSelect: (number: number) => void;
  isBettingClosed: boolean;
  gameRecords: GameRecord[];
  gameMode?: string;
}

export const GameSection = ({
  activeGameTab,
  onGameTabChange,
  onRoundComplete,
  onBettingStateChange,
  onColorSelect,
  onNumberSelect,
  isBettingClosed,
  gameRecords,
  gameMode
}: GameSectionProps) => {
  return (
    <>
      <GameTabs
        activeTab={activeGameTab}
        onTabChange={onGameTabChange}
      />

      <CountdownTimer 
        onRoundComplete={onRoundComplete}
        onBettingStateChange={onBettingStateChange}
        gameMode={gameMode}
      />

      <ColorButtons 
        onColorSelect={onColorSelect}
        disabled={isBettingClosed}
      />

      <NumberGrid 
        onNumberSelect={onNumberSelect}
        disabled={isBettingClosed}
      />

      <ParityRecord records={gameRecords} />
    </>
  );
};
