
import { useAuth } from "@/hooks/useAuth";
import { MainGame } from "@/components/game/MainGame";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { user, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (!isLoading && !user) {
      console.log('🔄 User not authenticated, redirecting to auth');
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  console.log('🎮 Index rendering MainGame with user:', user.id);
  console.log('💰 User profile balance:', userProfile?.balance);

  return (
    <MainGame 
      userId={user.id}
      userBalance={userProfile?.balance || 0}
    />
  );
};

export default Index;
