
import { RecordTable } from "./RecordTable";
import { UserBetsSection } from "./UserBetsSection";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
  price?: number;
}

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
  records: GameRecord[];
  userBets: UserBet[];
  gameType: string;
}

export const GameRecord = ({ records, userBets, gameType }: GameRecordProps) => {
  return (
    <div className="space-y-4">
      <RecordTable records={records} gameType={gameType} />
      <UserBetsSection userBets={userBets} gameType={gameType} />
    </div>
  );
};
