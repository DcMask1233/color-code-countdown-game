
interface GameTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const GameTabs = ({ activeTab, onTabChange }: GameTabsProps) => {
  const tabs = [
    { id: 'parity', label: 'Parity' },
    { id: 'sapre', label: 'Sapre' },
    { id: 'bcone', label: 'Bcone' },
    { id: 'emerd', label: 'Emerd' }
  ];

  return (
    <div className="flex bg-white rounded-lg mb-4 shadow-sm overflow-hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
