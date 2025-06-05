
import { Button } from "@/components/ui/button";

interface ProfileSectionProps {
  userBalance: number;
  onLogout: () => void;
}

export const ProfileSection = ({ userBalance, onLogout }: ProfileSectionProps) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Balance:</span>
          <span className="font-semibold">₹{userBalance}</span>
        </div>
        <Button onClick={onLogout} variant="outline" className="w-full">
          Logout
        </Button>
      </div>
    </div>
  );
};
