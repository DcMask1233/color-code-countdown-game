import React from "react";

interface UserBet {
  period: string;
  betType: "color" | "number";
  betValue: string | number;
  amount: number;
  result?: "win" | "lose";
  payout?: number;
  timestamp: Date;
}

interface Props {
  userBets: UserBet[];
  gameType: string;
}

export const UserBetsSection: React.FC<Props> = ({ userBets, gameType }) => {
  const filteredBets = userBets.filter((bet) =>
    bet.period.includes(gameType)
  );

  return (
    <div>
      <h3>Your Bets - {gameType}</h3>
      {filteredBets.length === 0 ? (
        <p>No bets placed yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Period</th>
              <th>Bet Type</th>
              <th>Value</th>
              <th>Amount</th>
              <th>Result</th>
              <th>Payout</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredBets.map((bet, index) => (
              <tr key={index}>
                <td>{bet.period}</td>
                <td>{bet.betType}</td>
                <td>{bet.betValue}</td>
                <td>{bet.amount}</td>
                <td>{bet.result ?? "Pending"}</td>
                <td>{bet.payout ?? "-"}</td>
                <td>{new Date(bet.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
