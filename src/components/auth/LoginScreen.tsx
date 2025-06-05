
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/auth/LoginModal";

interface LoginScreenProps {
  showLoginModal: boolean;
  onShowLoginModal: () => void;
  onCloseLoginModal: () => void;
  onLogin: (mobile: string) => void;
}

export const LoginScreen = ({
  showLoginModal,
  onShowLoginModal,
  onCloseLoginModal,
  onLogin
}: LoginScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Color Prediction</h1>
          <p className="text-xl text-purple-200">Win Big with Colors!</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 space-y-4">
          <div className="flex justify-center space-x-4">
            <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-8 h-8 bg-violet-500 rounded-full animate-pulse delay-150"></div>
          </div>
          
          <p className="text-white/80 text-sm">
            Predict colors and numbers to win amazing rewards!
          </p>
          
          <Button 
            onClick={onShowLoginModal}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Login with Mobile OTP
          </Button>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={onCloseLoginModal}
        onLogin={onLogin}
      />
    </div>
  );
};
