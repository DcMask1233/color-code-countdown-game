
import { useState } from "react";
import { Bell, ChevronRight, ChevronDown, User, Star, Wallet, History, CreditCard, Shield, HelpCircle, Info, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BettingHistorySection } from "./BettingHistorySection";
import { TransactionHistorySection } from "./TransactionHistorySection";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface MySectionProps {
  userBalance: number;
  userId: string;
  mobile?: string;
  onLogout: () => void;
  onNavigateToPromotion: () => void;
  gameRecords: any[];
}

export const MySection = ({ 
  userBalance, 
  userId, 
  mobile, 
  onLogout: originalOnLogout, 
  onNavigateToPromotion,
  gameRecords 
}: MySectionProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState<string | null>(null);
  const { toast } = useToast();
  const { signOut, userProfile } = useAuth();

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

  const handleLogout = async () => {
    await signOut();
    originalOnLogout();
  };

  const getUserInitials = () => {
    if (userProfile?.mobile) {
      return userProfile.mobile.slice(-2).toUpperCase();
    }
    return userId.slice(-2).toUpperCase();
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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section - Blue Background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">User ID: {userId}</h2>
              {(userProfile?.mobile || mobile) && (
                <p className="text-white/80 text-sm mt-1">Mobile: {userProfile?.mobile || mobile}</p>
              )}
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg">
            <Bell size={24} />
          </button>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <p className="text-white/80 text-sm">Available Balance</p>
          <p className="text-2xl font-bold">₹{userBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* Menu Section - White Background */}
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

      {/* Logout Button */}
      <div className="p-4">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut size={20} />
          Logout
        </Button>
      </div>
    </div>
  );
};
