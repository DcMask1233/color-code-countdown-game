import { Home, Star, Wallet, User } from "lucide-react";

// ✅ Step 1: Define allowed tab types
export type BottomTab = "home" | "promotion" | "wallet" | "my";

interface BottomNavigationProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs: { id: BottomTab; label: string; icon: React.ElementType }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "promotion", label: "Promotion", icon: Star },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "my", label: "My", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "text-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <IconComponent size={20} />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
