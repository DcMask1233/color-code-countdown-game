import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserProfileHeaderProps {
  userId: string;
  userBalance: number;
}

export const UserProfileHeader = ({ userId, userBalance }: UserProfileHeaderProps) => {
  const getUserInitials = () => {
    return userId.slice(-2).toUpperCase();
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white/20">
            <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">User ID: {userId.slice(0, 8)}...</h2>
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
  );
};