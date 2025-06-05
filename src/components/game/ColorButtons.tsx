
interface ColorButtonsProps {
  onColorSelect: (color: string) => void;
}

export const ColorButtons = ({ onColorSelect }: ColorButtonsProps) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <button
        onClick={() => onColorSelect('green')}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-8 rounded-lg shadow-sm transition-colors"
      >
        Join Green
      </button>
      <button
        onClick={() => onColorSelect('violet')}
        className="bg-violet-500 hover:bg-violet-600 text-white font-semibold py-8 rounded-lg shadow-sm transition-colors"
      >
        Join Violet
      </button>
      <button
        onClick={() => onColorSelect('red')}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-8 rounded-lg shadow-sm transition-colors"
      >
        Join Red
      </button>
    </div>
  );
};
