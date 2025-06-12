
interface ColorButtonsProps {
  onColorSelect: (color: string) => void;
  disabled?: boolean;
}

export const ColorButtons = ({ onColorSelect, disabled = false }: ColorButtonsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4 px-4">
      <button
        onClick={() => !disabled && onColorSelect('green')}
        disabled={disabled}
        className={`font-semibold py-3 rounded shadow-sm transition-all text-sm ${
          disabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        Join Green
      </button>
      <button
        onClick={() => !disabled && onColorSelect('violet')}
        disabled={disabled}
        className={`font-semibold py-3 rounded shadow-sm transition-all text-sm ${
          disabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
            : 'bg-violet-500 hover:bg-violet-600 text-white'
        }`}
      >
        Join Violet
      </button>
      <button
        onClick={() => !disabled && onColorSelect('red')}
        disabled={disabled}
        className={`font-semibold py-3 rounded shadow-sm transition-all text-sm ${
          disabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        Join Red
      </button>
    </div>
  );
};
