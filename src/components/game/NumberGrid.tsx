
interface NumberGridProps {
  onNumberSelect: (number: number) => void;
  disabled?: boolean;
}

export const NumberGrid = ({ onNumberSelect, disabled = false }: NumberGridProps) => {
  const getNumberColor = (num: number): string => {
    if (disabled) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50";
    }
    
    if (num === 0) return "bg-gradient-to-r from-violet-500 to-red-500 hover:opacity-90";
    if (num === 5) return "bg-gradient-to-r from-violet-500 to-green-500 hover:opacity-90";
    return num % 2 === 0 ? "bg-red-500 hover:opacity-90" : "bg-green-500 hover:opacity-90";
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-5 gap-2">
        {[0, 1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => !disabled && onNumberSelect(num)}
            disabled={disabled}
            className={`${getNumberColor(num)} text-white font-bold text-lg py-4 rounded-lg shadow-sm transition-all`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 mt-2">
        {[5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => !disabled && onNumberSelect(num)}
            disabled={disabled}
            className={`${getNumberColor(num)} text-white font-bold text-lg py-4 rounded-lg shadow-sm transition-all`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};
