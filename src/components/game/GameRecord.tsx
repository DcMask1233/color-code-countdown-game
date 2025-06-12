
import { GameResultsTable } from "./GameResultsTable";
import { UserBetsSection } from "./UserBetsSection";

interface UserBet {
  period: string;
  betType: 'color' | 'number';
  betValue: string | number;
  amount: number;
  result?: 'win' | 'lose';
  payout?: number;
  timestamp: Date;
}

interface GameRecordProps {
  userBets: UserBet[];
  gameType: string;
  duration: number;
}

export const GameRecord = ({ userBets, gameType, duration }: GameRecordProps) => {
  return (
    <div className="space-y-4">
      <GameResultsTable gameType={gameType} duration={duration} />
      <UserBetsSection userBets={userBets} gameType={gameType} />
    </div>
  );
};
