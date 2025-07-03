
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileHeader } from "./UserProfileHeader";
import { MenuSection } from "./MenuSection";
import { useAuth } from "@/hooks/useAuth";

interface MySectionProps {
  userBalance: number;
  userId: string;
  onLogout: () => void;
  onNavigateToPromotion: () => void;
  gameRecords: any[];
}

export const MySection = ({ 
  userBalance, 
  userId, 
  onLogout: originalOnLogout, 
  onNavigateToPromotion,
  gameRecords 
}: MySectionProps) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      originalOnLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserProfileHeader userId={userId} userBalance={userBalance} />
      <MenuSection onNavigateToPromotion={onNavigateToPromotion} gameRecords={gameRecords} />
      
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
