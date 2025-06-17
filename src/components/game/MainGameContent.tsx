import React from "react";

interface GameRecord {
  period: string;
  number: number;
  color: string[];
}

interface MainGameContentProps {
  activeBottomTab: string;
  selectedGameMode: string | null;
  userBalance: number;
  userId: string;
  totalBetAmount: number;
  totalDepositAmount: number;
  totalWithdrawAmount: number;
  gameRecords: GameRecord[];
  onGameSelect: (gameMode: string) => void;
  onBackToHome: () => void;
  onRoundComplete: (period: string, winningNumber: number, gameType: string) => void;
  onBalanceUpdate: (amount: number) => void;
  onGameRecordsUpdate: (records: GameRecord[]) => void;
  onNavigateToPromotion: () => void;
  onLogout: () => void;
}

export const MainGameContent = ({
  activeBottomTab,
  selectedGameMode,
  userBalance,
  userId,
  totalBetAmount,
  totalDepositAmount,
  totalWithdrawAmount,
  gameRecords,
  onGameSelect,
  onBackToHome,
  onRoundComplete,
  onBalanceUpdate,
  onGameRecordsUpdate,
  onNavigateToPromotion,
  onLogout
}: MainGameContentProps) => {
  
  if (selectedGameMode) {
    // Placeholder: Render the selected game component here
    // You can replace this with actual game component import and rendering
    return (
      <div className="p-4">
        <button
          className="mb-4 px-4 py-2 bg-gray-300 rounded"
          onClick={onBackToHome}
        >
          ← Back to Home
        </button>
        <h2 className="text-xl font-bold mb-2">Playing: {selectedGameMode}</h2>
        <p>Game UI goes here...</p>
        {/* You can place the game component, passing needed props */}
      </div>
    );
  }

  return (
    <div className="p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, User #{userId}</h1>
          <p className="text-gray-600">Balance: ${userBalance.toFixed(2)}</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </header>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Stats</h2>
        <div className="flex space-x-4 text-gray-700">
          <div>
            <div className="font-semibold">{totalBetAmount.toFixed(2)}</div>
            <div>Bets</div>
          </div>
          <div>
            <div className="font-semibold">{totalDepositAmount.toFixed(2)}</div>
            <div>Deposits</div>
          </div>
          <div>
            <div className="font-semibold">{totalWithdrawAmount.toFixed(2)}</div>
            <div>Withdrawals</div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Select Game</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => onGameSelect('bcone')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Bcone Game
          </button>
          <button
            onClick={() => onGameSelect('parity')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Parity Game
          </button>
          <button
            onClick={() => onGameSelect('color')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Color Game
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Recent Game Results</h2>
        {gameRecords.length === 0 ? (
          <p>No game results found.</p>
        ) : (
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-2 py-1">Period</th>
                <th className="border border-gray-300 px-2 py-1">Number</th>
                <th className="border border-gray-300 px-2 py-1">Color(s)</th>
              </tr>
            </thead>
            <tbody>
              {gameRecords.map((record) => (
                <tr key={record.period} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-2 py-1">{record.period}</td>
                  <td className="border border-gray-300 px-2 py-1">{record.number}</td>
                  <td className="border border-gray-300 px-2 py-1">{record.color.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-6">
        <button
          onClick={onNavigateToPromotion}
          class
