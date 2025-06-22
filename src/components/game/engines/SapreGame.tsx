interface SapreGameProps {
  userBalance: number;
}

export const SapreGame = ({ userBalance }: SapreGameProps) => {
  const {
    timeLeft,
    currentPeriod,
    isBettingClosed,
    userBets,
    placeBet,
    formatTime,
  } = useGameEngine("Sapre");

  const [showBetPopup, setShowBetPopup] = useState(false);
  const [selectedBetType, setSelectedBetType] = useState<"color" | "number">("color");
  const [selectedBetValue, setSelectedBetValue] = useState<string | number>("");

  const handleColorSelect = (color: string) => {
    setSelectedBetType("color");
    setSelectedBetValue(color);
    setShowBetPopup(true);
  };

  const handleNumberSelect = (number: number) => {
    setSelectedBetType("number");
    setSelectedBetValue(number);
    setShowBetPopup(true);
  };

  const handleConfirmBet = async (amount: number) => {
    const success = await placeBet(selectedBetType, selectedBetValue, amount);
    if (success) setShowBetPopup(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-950 font-semibold">Period</span>
          <span className="text-sm font-semibold text-gray-800">{currentPeriod}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-950 font-semibold">Count Down</span>
          <span
            className={`text-lg font-bold transition-all duration-300 ${
              isBettingClosed ? "text-black opacity-50 blur-[1px]" : "text-black"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <ColorButtons onColorSelect={handleColorSelect} disabled={isBettingClosed} />
      <NumberGrid onNumberSelect={handleNumberSelect} disabled={isBettingClosed} />

      <ModernGameRecords userBets={userBets} gameType="Sapre" />

      <BetPopup
        isOpen={showBetPopup}
        onClose={() => setShowBetPopup(false)}
        selectedType={selectedBetType}
        selectedValue={selectedBetValue}
        userBalance={userBalance}
        onConfirmBet={handleConfirmBet}
        disabled={isBettingClosed}
      />
    </>
  );
};
