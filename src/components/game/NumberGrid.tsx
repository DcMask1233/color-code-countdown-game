
interface NumberGridProps {
  onNumberSelect: (number: number) => void;
}

export const NumberGrid = ({ onNumberSelect }: NumberGridProps) => {
  const getNumberColor = (num: number): string => {
    if (num === 0) return "bg-gradient-to-r from-violet-500 to-red-500";
    if (num === 5) return "bg-gradient-to-r from-violet-500 to-green-500";
    return num % 2 === 0 ? "bg-red-500" : "bg-green-500";
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-5 gap-2">
        {[0, 1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => onNumberSelect(num)}
            className={`${getNumberColor(num)} text-white font-bold text-lg py-4 rounded-lg shadow-sm hover:opacity-90 transition-opacity`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 mt-2">
        {[5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberSelect(num)}
            className={`${getNumberColor(num)} text-white font-bold text-lg py-4 rounded-lg shadow-sm hover:opacity-90 transition-opacity`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};
