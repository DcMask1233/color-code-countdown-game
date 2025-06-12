
interface NumberGridProps {
  onNumberSelect: (number: number) => void;
  disabled?: boolean;
}

export const NumberGrid = ({ onNumberSelect, disabled = false }: NumberGridProps) => {
  const getNumberColor = (num: number): string => {
    if (disabled) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50";
    }
    
    if (num === 0) return "bg-gradient-to-br from-violet-500 via-violet-500 to-red-500 hover:opacity-90 relative overflow-hidden";
    if (num === 5) return "bg-gradient-to-br from-violet-500 via-violet-500 to-green-500 hover:opacity-90 relative overflow-hidden";
    return num % 2 === 0 ? "bg-red-500 hover:opacity-90" : "bg-green-500 hover:opacity-90";
  };

  const renderNumberButton = (num: number) => {
    const baseClasses = `${getNumberColor(num)} text-white font-bold text-sm py-2 px-3 rounded transition-all relative`;
    
    if ((num === 0 || num === 5) && !disabled) {
      return (
        <button
          key={num}
          onClick={() => !disabled && onNumberSelect(num)}
          disabled={disabled}
          className={baseClasses}
        >
          <div className="absolute inset-0 flex">
            <div 
              className={`w-1/2 ${num === 0 ? 'bg-violet-500' : 'bg-violet-500'}`}
              style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
            ></div>
            <div 
              className={`w-1/2 ${num === 0 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
            ></div>
          </div>
          <span className="relative z-10">{num}</span>
        </button>
      );
    }

    return (
      <button
        key={num}
        onClick={() => !disabled && onNumberSelect(num)}
        disabled={disabled}
        className={baseClasses}
      >
        {num}
      </button>
    );
  };

  return (
    <div className="mb-3 px-4">
      <div className="grid grid-cols-5 gap-1.5">
        {[0, 1, 2, 3, 4].map((num) => renderNumberButton(num))}
      </div>
      <div className="grid grid-cols-5 gap-1.5 mt-1.5">
        {[5, 6, 7, 8, 9].map((num) => renderNumberButton(num))}
      </div>
    </div>
  );
};
