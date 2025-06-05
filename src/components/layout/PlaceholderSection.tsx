
interface PlaceholderSectionProps {
  title: string;
}

export const PlaceholderSection = ({ title }: PlaceholderSectionProps) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm text-center">
      <h2 className="text-xl font-bold mb-4 capitalize">{title}</h2>
      <p className="text-gray-600">This section is coming soon!</p>
    </div>
  );
};
