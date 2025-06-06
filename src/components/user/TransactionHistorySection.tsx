
interface TransactionHistorySectionProps {
  type: 'deposit' | 'withdrawal';
}

export const TransactionHistorySection = ({ type }: TransactionHistorySectionProps) => {
  // Mock transaction data
  const transactions = type === 'deposit' ? [
    {
      id: 1,
      amount: 1000,
      status: 'Completed',
      method: 'UPI',
      timestamp: new Date().toISOString()
    }
  ] : [
    {
      id: 1,
      amount: 500,
      status: 'Processing',
      method: 'Bank Transfer',
      timestamp: new Date(Date.now() - 600000).toISOString()
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-800 mb-4">
        {type === 'deposit' ? 'Deposit History' : 'Withdrawal History'}
      </h3>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No {type} history found</p>
          <p className="text-sm mt-1">Your {type} transactions will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white p-3 rounded border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">₹{transaction.amount}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  transaction.status === 'Completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {transaction.status}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Method: {transaction.method}</p>
                <p>Time: {new Date(transaction.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
