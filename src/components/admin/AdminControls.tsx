
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminControls() {
  const { toast } = useToast();

  const handleManualGameRun = async () => {
    try {
      toast({
        title: "Info",
        description: "Manual game controls have been replaced with automated period management in the new secure architecture.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute manual control",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Game Management</h2>
        <p className="text-gray-600 mb-4">
          The new secure architecture uses automated period management. 
          Admin result overrides have been removed for security.
        </p>
        <button
          onClick={handleManualGameRun}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          ℹ️ View Info
        </button>
      </div>
    </div>
  );
}
