import { useState } from "react";
import { ChevronRight, ChevronDown, Star, Wallet, History, CreditCard, Shield, HelpCircle, Info } from "lucide-react";
import { BettingHistorySection } from "./BettingHistorySection";
import { TransactionHistorySection } from "./TransactionHistorySection";
import { useToast } from "@/hooks/use-toast";

interface MenuSectionProps {
  onNavigateToPromotion: () => void;
  gameRecords: any[];
}

export const MenuSection = ({ onNavigateToPromotion, gameRecords }: MenuSectionProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSectionToggle = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
    setActiveHistoryTab(null);
  };

  const handleHistoryTabClick = (tab: string) => {
    setActiveHistoryTab(activeHistoryTab === tab ? null : tab);
  };

  const showComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} functionality will be available soon!`,
    });
  };

  const menuItems = [
    {
      id: 'promotion',
      label: 'Promotion',
      icon: Star,
      action: onNavigateToPromotion
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: Wallet,
      expandable: true,
      subItems: [
        { label: 'Deposit', action: () => showComingSoon('Deposit') },
        { label: 'Withdrawal', action: () => showComingSoon('Withdrawal') }
      ]
    },
    {
      id: 'transaction',
      label: 'Transaction History',
      icon: History,
      expandable: true,
      subItems: [
        { label: 'Deposit History', action: () => handleHistoryTabClick('deposit') },
        { label: 'Withdrawal History', action: () => handleHistoryTabClick('withdrawal') },
        { label: 'Betting History', action: () => handleHistoryTabClick('betting') }
      ]
    },
    {
      id: 'bankcard',
      label: 'Bank Card',
      icon: CreditCard,
      action: () => showComingSoon('Bank Card')
    },
    {
      id: 'security',
      label: 'Account Security',
      icon: Shield,
      expandable: true,
      subItems: [
        { label: 'Reset Password', action: () => showComingSoon('Reset Password') }
      ]
    },
    {
      id: 'support',
      label: 'Support and Contact',
      icon: HelpCircle,
      action: () => showComingSoon('Support')
    },
    {
      id: 'about',
      label: 'About',
      icon: Info,
      action: () => showComingSoon('About')
    }
  ];

  return (
    <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
      {menuItems.map((item) => (
        <div key={item.id}>
          <button
            onClick={() => {
              if (item.expandable) {
                handleSectionToggle(item.id);
              } else if (item.action) {
                item.action();
              }
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className="text-gray-600" />
              <span className="text-gray-800 font-medium">{item.label}</span>
            </div>
            {item.expandable && (
              expandedSection === item.id ? 
                <ChevronDown size={20} className="text-gray-400" /> :
                <ChevronRight size={20} className="text-gray-400" />
            )}
          </button>

          {/* Sub-items */}
          {item.expandable && expandedSection === item.id && item.subItems && (
            <div className="bg-gray-50 border-b border-gray-100">
              {item.subItems.map((subItem, index) => (
                <button
                  key={index}
                  onClick={subItem.action}
                  className="w-full text-left px-12 py-3 text-gray-600 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                >
                  {subItem.label}
                </button>
              ))}
            </div>
          )}

          {/* History Content */}
          {item.id === 'transaction' && activeHistoryTab && (
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              {activeHistoryTab === 'betting' && (
                <BettingHistorySection gameRecords={gameRecords} />
              )}
              {activeHistoryTab === 'deposit' && (
                <TransactionHistorySection type="deposit" />
              )}
              {activeHistoryTab === 'withdrawal' && (
                <TransactionHistorySection type="withdrawal" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};